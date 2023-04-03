import { FC, useMemo } from "react"
import { BlogProvider } from "src/context/Blog"
import { Router } from "src/router"
import "./App.css"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets"

export const App = () => {
  const endpoint = "https://proud-bold-valley.solana-devnet.discover.quiknode.pro/45249c0f0f5171eed6e9b1710e957986ddf2be07/"
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],[]
  )
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <BlogProvider>
          <Router />
        </BlogProvider>
      </WalletProvider>
    </ConnectionProvider>
  )}
