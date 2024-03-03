'use client';

import { FC, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
    PublicKey, 
    Transaction, 
    TransactionInstruction, 
    SystemProgram, 
    LAMPORTS_PER_SOL, 
    Keypair
} from '@solana/web3.js';
import { Buffer } from 'buffer';

const InitializeAccount: FC<{ onInitialize?: (address: string) => void }> = ({ onInitialize }) => {
    const { connection } = useConnection();
    const { publicKey, signTransaction } = useWallet();
    const [loading, setLoading] = useState(false);
    
    const PROGRAM_ID = new PublicKey('');
    
    const initializeAccount = async () => {
        if (!publicKey || !signTransaction) {
            alert('请先连接钱包！');
            return;
        }

        try {
            setLoading(true);
            
            const newAccountKeypair = Keypair.generate();
            console.log('新账户公钥:', newAccountKeypair.publicKey.toBase58());
            
            // Counter 结构体大小：4 字节（u32）
            const space = 4; // 只需要存储一个 u32 类型的 value
            
            const rentExemptionAmount = await connection.getMinimumBalanceForRentExemption(space);
            
            const { blockhash } = await connection.getLatestBlockhash('confirmed');
            
            // 创建初始计数器数据 (value = 0)
            const counterData = Buffer.alloc(4); // 4 bytes for u32
            counterData.writeUInt32LE(0); // 初始值设为 0
            
            const transaction = new Transaction().add(
                // 创建账户指令
                SystemProgram.createAccount({
                    fromPubkey: publicKey,
                    newAccountPubkey: newAccountKeypair.publicKey,
                    lamports: rentExemptionAmount,
                    space: space,
                    programId: PROGRAM_ID
                })
            );

            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            console.log('准备签名交易...');
            console.log('账户大小:', space);
            console.log('初始数据:', counterData);

            try {
                const signedTx = await signTransaction(transaction);
                signedTx.partialSign(newAccountKeypair);

                console.log('发送交易...');
                const signature = await connection.sendRawTransaction(signedTx.serialize());
                
                console.log('等待交易确认...');
                const confirmation = await connection.confirmTransaction(signature, 'confirmed');
                
                if (confirmation.value.err) {
                    throw new Error(`交易确认失败: ${confirmation.value.err.toString()}`);
                }

                console.log('交易已确认！');
                console.log('交易签名:', signature);
                console.log('计数器账户地址:', newAccountKeypair.publicKey.toBase58());
                
                // 读取账户数据以验证初始化
                const accountInfo = await connection.getAccountInfo(newAccountKeypair.publicKey);
                if (accountInfo) {
                    const value = accountInfo.data.readUInt32LE(0);
                    console.log('当前计数器值:', value);
                }
                
                alert('计数器账户初始化成功！');
                
                // 在成功初始化后调用
                if (onInitialize) {
                    onInitialize(newAccountKeypair.publicKey.toBase58());
                }
                
            } catch (signError: any) {
                console.error('交易签名或发送失败:', signError);
                throw new Error(`交易签名失败: ${signError.message}`);
            }
            
        } catch (error: any) {
            console.error('初始化失败:', error);
            alert(`初始化失败: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <button 
                onClick={initializeAccount}
                disabled={loading || !publicKey}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                {loading ? '初始化中...' : '初始化计数器'}
            </button>
        </div>
    );
};

export default InitializeAccount; 