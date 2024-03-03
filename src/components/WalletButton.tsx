'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FC } from 'react';

const WalletButton: FC = () => {
    const { connected } = useWallet();

    return (
        <div>
            <WalletMultiButton />
            {connected && <p>钱包已连接！</p>}
        </div>
    );
};

export default WalletButton; 