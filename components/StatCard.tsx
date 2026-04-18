export default function StatCard({ title, used, total, colorHex }: { title: string, used: number, total: number, colorHex: string, label?: string; }) {
  const percentage = (used / total) * 100;
  
  return (
    <div className="card">
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{title}</p>
      <h3 style={{ fontSize: "2rem", margin: "0.5rem 0" }}>
        {total - used} <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: "normal" }}>Days Left</span>
      </h3>
      <div style={{ width: "100%", background: "var(--bg-color)", height: "8px", borderRadius: "4px" }}>
        <div style={{ width: `${percentage}%`, background: colorHex, height: "100%", borderRadius: "4px" }} />
      </div>
    </div>
  );
}