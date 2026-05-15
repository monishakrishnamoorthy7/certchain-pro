import { Link } from "react-router-dom";
import WalletButton from "./WalletButton.jsx";
import useAuth from "../hooks/useAuth.js";

export default function Navbar() {
  const { authState, logout } = useAuth();
  const adminName = authState.address ? authState.address.slice(0, 10) : null;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
      <div className="container-shell flex items-center justify-between py-5">
        <Link to="/verify" className="text-xl font-semibold text-white">
          CertChain Pro
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <WalletButton />
          {adminName ? (
            <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-blue-200">
              Admin: {adminName}
            </span>
          ) : null}
          {adminName ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-red-500/40 bg-red-500/10 px-4 py-1 text-red-200"
            >
              Logout
            </button>
          ) : (
            <Link className="text-slate-300 hover:text-white" to="/login">
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
