import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import StatsBar from "../components/StatsBar.jsx";
import VerifyPanel from "../components/panels/VerifyPanel.jsx";

export default function VerifyPage() {
  const { hash } = useParams();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <StatsBar
        stats={[
          { label: "Total Certificates", value: "—" },
          { label: "Valid", value: "—" },
          { label: "Revoked", value: "—" }
        ]}
      />

      <main className="container-shell pb-16">
        <VerifyPanel defaultHash={hash || ""} />
      </main>
    </div>
  );
}