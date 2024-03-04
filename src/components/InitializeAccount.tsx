'use client';

import { FC, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
    PublicKey, 
    Transaction, 
    SystemProgram, 
    Keypair
} from '@solana/web3.js';
import { Buffer } from 'buffer';

interface InitializeAccountProps {
    onInitialize?: (address: string) => void; // 初始化成功后的回调函数
}

/**
 * 初始化计数器账户组件
 * 用于创建一个新的账户来存储计数器的值
 */
const InitializeAccount: FC<InitializeAccountProps> = ({ onInitialize }) => {
    // 获取 Solana 连接实例
    const { connection } = useConnection();
    // 获取钱包状态和方法
    const { publicKey, signTransaction } = useWallet();
    // 加载状态
    const [loading, setLoading] = useState(false);
    
    // Solana 程序 ID，需要替换为实际部署的程序 ID
    const PROGRAM_ID = new PublicKey('');
    
    /**
     * 初始化计数器账户
     * 1. 生成新的密钥对
     * 2. 计算所需空间和租金
     * 3. 创建账户交易
     * 4. 签名并发送交易
     * 5. 确认交易
     */
    const initializeAccount = async () => {
        // 检查钱包连接状态
        if (!publicKey || !signTransaction) {
            alert('请先连接钱包！');
            return;
        }

        try {
            setLoading(true);
            
            // 生成新的账户密钥对
            const newAccountKeypair = Keypair.generate();
            console.log('新账户公钥:', newAccountKeypair.publicKey.toBase58());
            
            // 计算所需空间：4 字节用于存储 u32 类型的计数值
            const space = 4;
            
            // 计算免除租金所需的最小余额
            const rentExemptionAmount = await connection.getMinimumBalanceForRentExemption(space);
            
            // 获取最新的区块哈希
            const { blockhash } = await connection.getLatestBlockhash('confirmed');
            
            // 创建初始计数器数据 (value = 0)
            const counterData = Buffer.alloc(4);
            counterData.writeUInt32LE(0); // 设置初始值为 0
            
            // 创建交易对象并添加创建账户指令
            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: publicKey,           // 支付账户（当前连接的钱包）
                    newAccountPubkey: newAccountKeypair.publicKey, // 新账户的公钥
                    lamports: rentExemptionAmount,   // 转入的 lamports 数量
                    space: space,                    // 分配的空间大小
                    programId: PROGRAM_ID            // 程序 ID
                })
            );

            // 设置交易参数
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            console.log('准备签名交易...');
            console.log('账户大小:', space);
            console.log('初始数据:', counterData);

            try {
                // 请求用户签名交易
                const signedTx = await signTransaction(transaction);
                // 使用新账户的密钥对进行部分签名
                signedTx.partialSign(newAccountKeypair);

                console.log('发送交易...');
                // 发送已签名的交易
                const signature = await connection.sendRawTransaction(signedTx.serialize());
                
                console.log('等待交易确认...');
                // 等待交易确认
                const confirmation = await connection.confirmTransaction(signature, 'confirmed');
                
                // 检查交易是否成功
                if (confirmation.value.err) {
                    throw new Error(`交易确认失败: ${confirmation.value.err.toString()}`);
                }

                console.log('交易已确认！');
                console.log('交易签名:', signature);
                console.log('计数器账户地址:', newAccountKeypair.publicKey.toBase58());
                
                // 验证账户初始化是否成功
                const accountInfo = await connection.getAccountInfo(newAccountKeypair.publicKey);
                if (accountInfo) {
                    const value = accountInfo.data.readUInt32LE(0);
                    console.log('当前计数器值:', value);
                }
                
                alert('计数器账户初始化成功！');
                
                // 调用初始化成功的回调函数
                if (onInitialize) {
                    onInitialize(newAccountKeypair.publicKey.toBase58());
                }
                
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : '未知错误';
                console.error('交易签名或发送失败:', error);
                throw new Error(`交易签名失败: ${errorMessage}`);
            }
            
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            console.error('初始化失败:', error);
            alert(`初始化失败: ${errorMessage}`);
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