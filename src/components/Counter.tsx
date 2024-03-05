'use client';

import { FC, useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
    PublicKey, 
    Transaction, 
    Connection,
    TransactionInstruction,
    VersionedTransaction,
    TransactionMessage
} from '@solana/web3.js';

/**
 * 计数器组件的属性接口
 * @interface CounterProps
 * @property {string | null} counterAddress - 计数器账户的地址
 * @property {Function} onIncrement - 可选的回调函数，在计数器值增加后调用
 */
interface CounterProps {
    counterAddress: string | null;
    onIncrement?: () => void;
}

/**
 * Solana 计数器组件
 * 用于显示和操作链上计数器的值
 * 
 * @component Counter
 * @param {CounterProps} props - 组件属性
 */
const Counter: FC<CounterProps> = ({ counterAddress, onIncrement }) => {
    // 创建 Solana 连接实例，连接到 devnet 网络
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    // 获取钱包状态和签名方法
    const { publicKey, signTransaction } = useWallet();
    // 存储计数器当前值
    const [count, setCount] = useState<number | null>(null);
    // 控制按钮加载状态
    const [loading, setLoading] = useState(false);
    
    // Solana 程序的公钥（需要替换为实际部署的程序 ID），可提前生成，也可以在部署后通过命令行获取
    const PROGRAM_ID = new PublicKey('');

    /**
     * 从链上读取计数器的当前值
     * 通过查询账户数据来获取计数器值
     */
    const fetchCounter = async () => {
        if (!counterAddress) return;

        try {
            const accountInfo = await connection.getAccountInfo(new PublicKey(counterAddress));
            if (accountInfo) {
                // 读取账户数据中的 u32 类型值
                const value = accountInfo.data.readUInt32LE(0);
                setCount(value);
            }
        } catch (error) {
            console.error('读取计数器失败:', error);
        }
    };

    /**
     * 增加计数器值的方法
     * 1. 创建交易指令
     * 2. 构建交易
     * 3. 请求用户签名
     * 4. 发送交易并等待确认
     */
    const incrementCounter = async () => {
        // 验证钱包连接状态和计数器地址
        if (!publicKey || !signTransaction || !counterAddress) {
            alert('请先连接钱包！');
            return;
        }

        try {
            setLoading(true);
            
            const counterPubkey = new PublicKey(counterAddress);
            
            // 获取最新的区块哈希
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            
            // 创建增加计数器值的交易指令
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

            // 创建版本化交易对象
            const transaction = new VersionedTransaction(messageV0);

            // 请求用户签名
            const signedTx = await signTransaction(transaction);
            
            console.log('发送交易...');
            const signature = await connection.sendTransaction(signedTx);
            
            console.log('等待交易确认...');
            // 等待交易确认
            const confirmation = await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            });
            
            // 检查交易是否成功
            if (confirmation.value.err) {
                throw new Error(`交易确认失败: ${confirmation.value.err.toString()}`);
            }

            console.log('计数器增加成功！');
            console.log('交易签名:', signature);
            
            // 重新读取计数器值
            await fetchCounter();
            
            // 调用增加成功的回调函数
            if (onIncrement) {
                onIncrement();
            }
            
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            console.error('增加计数器失败:', error);
            alert(`增加计数器失败: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // 组件挂载和计数器地址变化时，读取计数器值
    useEffect(() => {
        fetchCounter();
        
        // 设置定时刷新，每 5 秒更新一次计数器值
        const interval = setInterval(fetchCounter, 5000);
        
        // 组件卸载时清理定时器
        return () => clearInterval(interval);
    }, [counterAddress]);

    // 未初始化时显示提示信息
    if (!counterAddress) {
        return <div className="mt-4">请先初始化计数器</div>;
    }

    // 渲染计数器界面
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