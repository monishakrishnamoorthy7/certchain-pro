import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  formatAddress,
  getChainId,
  getEthereum,
  isExpectedChain,
  requestAccounts
} from "../services/wallet.js";
import { getRolesForAddress } from "../services/blockchain.js";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [walletState, setWalletState] = useState({
    address: null,
    chainId: null,
    isConnected: false,
    isCorrectNetwork: true,
    shortAddress: "",
    status: "idle",
    error: null
  });

  const connect = async () => {
    try {
      setWalletState((prev) => ({ ...prev, status: "connecting", error: null }));
      const accounts = await requestAccounts();
      const chainId = await getChainId();
      const address = accounts?.[0] || null;
      const isCorrectNetwork = isExpectedChain(chainId);
      const roles = await getRolesForAddress(address).catch(() => null);
      // avoid verbose logging in production
      // console.warn('wallet connected', address, 'chainId', chainId);
      setWalletState({
        address,
        chainId,
        isConnected: Boolean(address),
        isCorrectNetwork,
        shortAddress: formatAddress(address),
        status: "connected",
        error: isCorrectNetwork ? null : "Wrong network",
        roles
      });
      localStorage.setItem("wallet_connected", "true");
    } catch (error) {
      setWalletState((prev) => ({
        ...prev,
        status: "error",
        error: error?.message || "Failed to connect"
      }));
    }
  };

  const disconnect = () => {
    setWalletState({
      address: null,
      chainId: null,
      isConnected: false,
      isCorrectNetwork: true,
      shortAddress: "",
      status: "idle",
      error: null
    });
    localStorage.removeItem("wallet_connected");
  };

  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    const handleAccountsChanged = (accounts) => {
      const address = accounts?.[0] || null;
      getRolesForAddress(address)
        .then((roles) => {
          setWalletState((prev) => ({
            ...prev,
            address,
            shortAddress: formatAddress(address),
            isConnected: Boolean(address),
            roles
          }));
        })
        .catch(() => {
          setWalletState((prev) => ({
            ...prev,
            address,
            shortAddress: formatAddress(address),
            isConnected: Boolean(address)
          }));
        });
    };

    const handleChainChanged = (chainIdHex) => {
      const chainId = Number(chainIdHex);
      setWalletState((prev) => ({
        ...prev,
        chainId,
        isCorrectNetwork: isExpectedChain(chainId),
        error: isExpectedChain(chainId) ? null : "Wrong network"
      }));
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  useEffect(() => {
    const shouldReconnect = localStorage.getItem("wallet_connected") === "true";
    if (shouldReconnect) connect();
  }, []);

  const value = useMemo(
    () => ({ walletState, connect, disconnect }),
    [walletState]
  );
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }
  return context;
}
