import { Inter } from "next/font/google";
import "./globals.css";
import WalletContextProvider from "../context/WalletContextProvider";
import ClientOnly from "../components/ClientOnly";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientOnly>
          <WalletContextProvider>
            {children}
          </WalletContextProvider>
        </ClientOnly>
      </body>
    </html>
  );
} 