'use client';

import { FC, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
    PublicKey, 
    Connection,
    TransactionInstruction,
    VersionedTransaction,
    TransactionMessage
} from '@solana/web3.js';

interface CounterProps {
    counterAddress: string | null;
    onIncrement?: () => void;
}

const Counter: FC<CounterProps> = ({ counterAddress, onIncrement }) => {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const { publicKey, signTransaction } = useWallet();
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    
    const PROGRAM_ID = new PublicKey('3Rs1WJXAcfuBYkNEEXJ8sGw6kbp8Pzu6VKoniZBzgmqN');

    // 读取计数器值
    const fetchCounter = async () => {
        if (!counterAddress) return;

        try {
            const accountInfo = await connection.getAccountInfo(new PublicKey(counterAddress));
            if (accountInfo) {
                const value = accountInfo.data.readUInt32LE(0);
                setCount(value);
            }
        } catch (error) {
            console.error('读取计数器失败:', error);
        }
    };

    // 增加计数器值
    const incrementCounter = async () => {
        if (!publicKey || !signTransaction || !counterAddress) {
            alert('请先连接钱包！');
            return;
        }

        try {
            setLoading(true);
            
            const counterPubkey = new PublicKey(counterAddress);
            
            // 获取最新的 blockhash
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            
            // 创建交易指令
            const instruction = new TransactionInstruction({
                keys: [
                    {
                        pubkey: counterPubkey,
                        isSigner: false,
                        isWritable: true
                    }
                ],
                programId: PROGRAM_ID,
                data: Buffer.from([]) // 程序只有一个指令，不需要指令数据
            });

            // 创建交易消息
            const messageV0 = new TransactionMessage({
                payerKey: publicKey,
                recentBlockhash: blockhash,
                instructions: [instruction]
            }).compileToV0Message();

            // 创建 VersionedTransaction
            const transaction = new VersionedTransaction(messageV0);

            // 签名交易
            const signedTx = await signTransaction(transaction);
            
            console.log('发送交易...');
            const signature = await connection.sendTransaction(signedTx);
            
            console.log('等待交易确认...');
            const confirmation = await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            });
            
            if (confirmation.value.err) {
                throw new Error(`交易确认失败: ${confirmation.value.err.toString()}`);
            }

            console.log('计数器增加成功！');
            console.log('交易签名:', signature);
            
            // 重新读取计数器值
            await fetchCounter();
            
            if (onIncrement) {
                onIncrement();
            }
            
        } catch (error: Error | unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('增加计数器失败:', error);
            alert(`增加计数器失败: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // 当组件加载或计数器地址改变时读取值
    useEffect(() => {
        fetchCounter();
        
        // 设置定期刷新
        const interval = setInterval(fetchCounter, 5000); // 每5秒刷新一次
        
        return () => clearInterval(interval);
    }, [counterAddress]);

    if (!counterAddress) {
        return <div className="mt-4">请先初始化计数器</div>;
    }

    return (
        <div className="mt-4 p-4 border rounded-lg">
            <div className="mb-4">
                <p className="text-lg">计数器地址: <span className="font-mono text-sm">{counterAddress}</span></p>
                <p className="text-2xl font-bold mt-2">当前值: {count !== null ? count : '加载中...'}</p>
            </div>
            <div className="flex gap-4">
                <button 
                    onClick={fetchCounter}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    刷新
                </button>
                <button 
                    onClick={incrementCounter}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                    {loading ? '处理中...' : '+1'}
                </button>
            </div>
        </div>
    );
};

export default Counter; 