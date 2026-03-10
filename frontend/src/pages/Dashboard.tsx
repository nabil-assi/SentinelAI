import { useEffect, useState } from "react";
import api from "@/api/axios";
import { FolderGit2, Scan, AlertTriangle, Shield, ArrowUpRight, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface DashboardData {
  success: boolean;
  totalProjects: number;
  totalScans: number;
  activeVulnerabilities: number;
  thisWeekProjects: number;
  thisWeekTotalScans: number;
  stats: {
    _avg: { securityScore: number | null };
    _max: { securityScore: number | null };
    _min: { securityScore: number | null };
    _count: { id: number };
  };
  projects: Array<{
    name: string;
    scans: Array<{
      status: string;
      securityScore: number | null;
      _count: { vulnerabilities: number };
    }>;
  }>;
}

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  PROCESSING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  FAILED: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<DashboardData>("/api/dashboard");
      if (response.data.success) {
        setData(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 border border-red-200 bg-red-50 rounded-xl text-center max-w-md mx-auto mt-10">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">{error}</p>
        <button onClick={fetchDashboard} className="mt-4 text-sm font-bold text-red-600 flex items-center gap-2 mx-auto">
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Total Projects", value: data.totalProjects, icon: FolderGit2, change: `+${data.thisWeekProjects} this week` },
    { label: "Total Scans", value: data.totalScans, icon: Scan, change: `+${data.thisWeekTotalScans} this week` },
    { label: "Active Vulnerabilities", value: data.activeVulnerabilities, icon: AlertTriangle, change: "Requires attention" },
    { label: "Security Score", value: `${data.stats._avg.securityScore ?? 0}%`, icon: Shield, change: "Overall average" },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your security posture</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 hover:border-primary/20 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Recent Scans Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Recent Activity</h2>
          <Link to="/scan" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
            New Scan <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-muted/20">
                <th className="py-3 px-5 font-medium">Project</th>
                <th className="py-3 px-5 font-medium">Status</th>
                <th className="py-3 px-5 font-medium">Vulnerabilities</th>
                <th className="py-3 px-5 font-medium">Score</th>
                <th className="py-3 px-5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.projects.map((project, i) => {
                const latestScan = project.scans[0];
                const score = latestScan?.securityScore;

                return (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-5 font-medium font-mono text-foreground">{project.name}</td>
                    <td className="py-3 px-5">
                      <Badge variant="outline" className={`font-semibold ${statusStyles[latestScan?.status] || ""}`}>
                        {latestScan?.status || "PENDING"}
                      </Badge>
                    </td>
                    <td className="py-3 px-5 text-muted-foreground font-mono">
                      {latestScan?._count.vulnerabilities ?? "—"}
                    </td>
                    <td className="py-3 px-5">
                      {score !== null && score !== undefined ? (
                        <div className="flex items-center gap-2">
                           <span className={`font-bold ${score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600"}`}>
                            {score}%
                          </span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="py-3 px-5 text-right">
                       <Link to={`/projects/${project.name}`} className="text-muted-foreground hover:text-primary transition-colors">
                          <ArrowUpRight className="h-4 w-4 inline" />
                       </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.projects.length === 0 && (
            <div className="p-10 text-center text-muted-foreground">No active projects found.</div>
          )}
        </div>
      </div>
    </div>
  );
}