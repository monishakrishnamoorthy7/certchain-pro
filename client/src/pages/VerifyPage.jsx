import { useParams } from "react-router-dom";
import Hero from "../components/Hero.jsx";
import Navbar from "../components/Navbar.jsx";
import StatsBar from "../components/StatsBar.jsx";
import VerifyPanel from "../components/panels/VerifyPanel.jsx";
import VerifyResults from "../components/VerifyResults.jsx";

export default function VerifyPage() {
  const { hash } = useParams();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <Hero
        eyebrow="Public Verification"
        title="Blockchain certificate ecosystem"
        subtitle="Verify any certificate with a hash or document upload. Results are anchored to the ledger."
      />
      <StatsBar
        stats={[
          { label: "Total Certificates", value: "—" },
          { label: "Valid", value: "—" },
          { label: "Revoked", value: "—" }
        ]}
      />
      <main className="container-shell pb-16">
        <div className="space-y-6">
          <VerifyPanel defaultHash={hash || ""} />
          <VerifyResults hash={hash} />
        </div>
      </main>
    </div>
  );
}
