'use client';

import { useState } from 'react';
import WalletButton from '../components/WalletButton';
import InitializeAccount from '../components/InitializeAccount';
import Counter from '../components/Counter';
import ClientOnly from '../components/ClientOnly';

export default function Home() {
  const [counterAddress, setCounterAddress] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Solana 计数器演示</h1>
        <ClientOnly>
          <div className="space-y-6">
            <WalletButton />
            <InitializeAccount onInitialize={setCounterAddress} />
            <Counter counterAddress={counterAddress} />
          </div>
        </ClientOnly>
      </div>
    </main>
  );
} 