import StatCard from "./StatCard.jsx";

export default function StatsBar({ stats }) {
  return (
    <div className="container-shell grid gap-4 py-8 sm:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </div>
  );
}
