import { useState } from "react";
import Hero from "../components/Hero.jsx";
import Navbar from "../components/Navbar.jsx";
import StatsBar from "../components/StatsBar.jsx";
import Tabs from "../components/Tabs.jsx";
import UploadPanel from "../components/panels/UploadPanel.jsx";
import RevokePanel from "../components/panels/RevokePanel.jsx";
import LogsPanel from "../components/panels/LogsPanel.jsx";
import RolesPanel from "../components/panels/RolesPanel.jsx";

const TABS = [
  { id: "upload", label: "Upload" },
  { id: "revoke", label: "Revoke" },
  { id: "logs", label: "Audit Logs" },
  { id: "roles", label: "Roles" }
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <Hero
        eyebrow="Admin Console"
        title="Issue, revoke, and audit"
        subtitle="All admin actions will soon be signed with MetaMask."
      />
      <StatsBar
        stats={[
          { label: "Total Certificates", value: "—" },
          { label: "Valid", value: "—" },
          { label: "Revoked", value: "—" }
        ]}
      />
      <main className="container-shell space-y-6 pb-16">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === "upload" ? <UploadPanel /> : null}
        {activeTab === "revoke" ? <RevokePanel /> : null}
        {activeTab === "logs" ? <LogsPanel /> : null}
        {activeTab === "roles" ? <RolesPanel /> : null}
      </main>
    </div>
  );
}
