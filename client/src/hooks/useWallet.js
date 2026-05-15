import { useWalletContext } from "../context/WalletContext.jsx";

export default function useWallet() {
  const { walletState, connect, disconnect } = useWalletContext();
  return { walletState, connect, disconnect };
}
