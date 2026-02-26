import { FolderGit2, Scan, AlertTriangle, Shield, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const stats = [
  { label: "Total Projects", value: "12", icon: FolderGit2, change: "+2 this week" },
  { label: "Total Scans", value: "148", icon: Scan, change: "+23 this week" },
  { label: "Active Vulnerabilities", value: "37", icon: AlertTriangle, change: "-5 from last scan" },
  { label: "Security Score", value: "74", icon: Shield, change: "Good" },
];

const recentScans = [
  { project: "frontend-app", date: "2 min ago", status: "Completed", vulns: 3, score: 92 },
  { project: "api-gateway", date: "15 min ago", status: "Processing", vulns: null, score: null },
  { project: "auth-service", date: "1 hour ago", status: "Completed", vulns: 12, score: 64 },
  { project: "payment-ms", date: "3 hours ago", status: "Failed", vulns: null, score: null },
  { project: "user-service", date: "5 hours ago", status: "Completed", vulns: 0, score: 100 },
  { project: "data-pipeline", date: "1 day ago", status: "Pending", vulns: null, score: null },
];

const statusStyles: Record<string, string> = {
  Completed: "bg-severity-safe/10 text-severity-safe border-severity-safe/20",
  Processing: "bg-severity-medium/10 text-severity-medium border-severity-medium/20",
  Failed: "bg-severity-critical/10 text-severity-critical border-severity-critical/20",
  Pending: "bg-muted text-muted-foreground border-border",
};

export default function Dashboard() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your security posture</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 hover:border-primary/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Recent Scans */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Recent Scans</h2>
          <Link to="/scan" className="text-sm text-primary hover:underline flex items-center gap-1">
            New Scan <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-5 font-medium">Project</th>
                <th className="text-left py-3 px-5 font-medium">Status</th>
                <th className="text-left py-3 px-5 font-medium">Vulnerabilities</th>
                <th className="text-left py-3 px-5 font-medium">Score</th>
                <th className="text-left py-3 px-5 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentScans.map((scan) => (
                <tr key={scan.project} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-5 font-medium font-mono text-foreground">{scan.project}</td>
                  <td className="py-3 px-5">
                    <Badge variant="outline" className={statusStyles[scan.status]}>
                      {scan.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-5 text-muted-foreground">{scan.vulns ?? "—"}</td>
                  <td className="py-3 px-5">
                    {scan.score !== null ? (
                      <span className={scan.score >= 80 ? "text-severity-safe" : scan.score >= 50 ? "text-severity-medium" : "text-severity-critical"}>
                        {scan.score}/100
                      </span>
                    ) : "—"}
                  </td>
                  <td className="py-3 px-5 text-muted-foreground">{scan.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
