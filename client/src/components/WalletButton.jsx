import useWallet from "../hooks/useWallet.js";
import { getExpectedNetwork } from "../config/networks.js";
import { switchToExpectedChain } from "../services/wallet.js";

export default function WalletButton() {
  const { walletState, connect, disconnect } = useWallet();
  const expected = getExpectedNetwork();

  if (!window.ethereum) {
    return (
      <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
        MetaMask required
      </span>
    );
  }

  if (!walletState.isConnected) {
    return (
      <button
        type="button"
        onClick={connect}
        className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs text-blue-200"
      >
        {walletState.status === "connecting" ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`rounded-full border px-3 py-1 text-xs ${
          walletState.isCorrectNetwork
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
            : "border-red-500/40 bg-red-500/10 text-red-200"
        }`}
      >
        {walletState.shortAddress || "Connected"}
      </span>
      {!walletState.isCorrectNetwork ? (
        <button
          type="button"
          onClick={switchToExpectedChain}
          className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-200"
        >
          Switch to {expected.name}
        </button>
      ) : null}
      <button
        type="button"
        onClick={disconnect}
        className="rounded-full border border-slate-600/60 bg-slate-900/60 px-3 py-1 text-xs text-slate-200"
      >
        Disconnect
      </button>
    </div>
  );
}
