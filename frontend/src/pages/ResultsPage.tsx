import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowLeft,
  Terminal,
  PlayCircle,
  ExternalLink,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/axios";

// --- التقييم الديناميكي ---
const calculateScore = (vulns: any[]) => {
  if (!vulns || vulns.length === 0) return 100;
  const weights = { CRITICAL: 20, HIGH: 10, MEDIUM: 5, LOW: 2 };
  const totalDeduction = vulns.reduce(
    (acc, v) => acc + (weights[v.severity as keyof typeof weights] || 0),
    0,
  );
  return Math.max(5, 100 - totalDeduction);
};

export default function ResultsPage() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get(`/scan/results/${scanId}`);
        // التأكد من استخراج البيانات بشكل صحيح بناءً على هيكلة JSON الخاصة بك
        setScan(res.data.data);
      } catch (err: any) {
        setError("Failed to fetch security report.");
      } finally {
        setLoading(false);
      }
    };
    if (scanId) fetchResults();
  }, [scanId]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-mono italic">
          Parsing AI Security Report...
        </p>
      </div>
    );

  if (error || !scan)
    return (
      <div className="p-20 text-center text-destructive">
        <p>{error || "Report not found"}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );

  const vulns = scan.vulnerabilities || [];
  const score = calculateScore(vulns);

  const grouped = {
    CRITICAL: vulns.filter((v: any) => v.severity === "CRITICAL"),
    HIGH: vulns.filter((v: any) => v.severity === "HIGH"),
    MEDIUM: vulns.filter((v: any) => v.severity === "MEDIUM"),
    LOW: vulns.filter((v: any) => v.severity === "LOW"),
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Navigation & Actions */}
  <div className="flex justify-between items-center">
  <Button variant="ghost" asChild>
    <Link
      to={`/history/${scan.projectId}`}
      className="flex items-center gap-2"
    >
      <ArrowLeft className="h-4 w-4" /> Back to History
    </Link>
  </Button>
  
  <div className="flex gap-2">
    {/* زر التصدير مع قائمة منسدلة */}
    <div className="relative group">
      <Button
        variant="outline"
        className="gap-2 font-bold uppercase text-[10px] tracking-widest rounded-full"
      >
        <Download className="h-4 w-4" /> Export
      </Button>
      
      {/* القائمة المنسدلة للتصدير */}
      <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-1 space-y-1">
          <button
            onClick={() => {
              // تصدير JSON
              const dataStr = JSON.stringify(scan, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', `scan-${scan.id.slice(0,8)}.json`);
              linkElement.click();
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-primary/10 rounded-lg transition-colors"
          >
            Export as JSON
          </button>
          
          <button
            onClick={() => {
              // تصدير CSV للثغرات فقط
              const vulns = scan.vulnerabilities || [];
              if (vulns.length === 0) {
                alert("No vulnerabilities to export");
                return;
              }
              
              // إنشاء CSV
              const headers = ['Library', 'Severity', 'CVE ID', 'Description', 'Recommendation'];
              const rows = vulns.map((v: any) => [
                v.libraryName,
                v.severity,
                v.cveId || 'N/A',
                v.description?.replace(/,/g, ';') || '',
                v.recommendation?.replace(/,/g, ';') || ''
              ]);
              
              const csvContent = [headers, ...rows]
                .map(row => row.join(','))
                .join('\n');
              
              const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', `vulnerabilities-${scan.id.slice(0,8)}.csv`);
              linkElement.click();
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-primary/10 rounded-lg transition-colors"
          >
            Export as CSV
          </button>
          
          <button
            onClick={() => {
              // تصدير تقرير نصي
              const vulns = scan.vulnerabilities || [];
              const score = calculateScore(vulns);
              
              let report = `SECURITY SCAN REPORT\n`;
              report += `====================\n\n`;
              report += `Scan ID: ${scan.id}\n`;
              report += `Date: ${new Date(scan.completedAt).toLocaleString()}\n`;
              report += `File: ${scan.fileName}\n`;
              report += `Security Score: ${score}/100\n`;
              report += `Total Vulnerabilities: ${vulns.length}\n\n`;
              
              if (vulns.length > 0) {
                report += `VULNERABILITIES\n`;
                report += `===============\n\n`;
                
                vulns.forEach((v: any, i: number) => {
                  report += `${i + 1}. ${v.libraryName} (${v.severity})\n`;
                  report += `   CVE: ${v.cveId || 'N/A'}\n`;
                  report += `   Description: ${v.description}\n`;
                  report += `   Fix: ${v.recommendation}\n\n`;
                });
              }
              
              const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(report);
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', `report-${scan.id.slice(0,8)}.txt`);
              linkElement.click();
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-primary/10 rounded-lg transition-colors"
          >
            Export as Text
          </button>
        </div>
      </div>
    </div>
    
    {/* زر إعادة الفحص */}
    <Button
      onClick={() => navigate(`/scan/${scan.projectId}`)}
      className="rounded-full font-bold uppercase text-[10px] tracking-widest gap-2"
    >
      <PlayCircle className="h-4 w-4" /> Retake Test
    </Button>
  </div>
</div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 bg-card p-8 rounded-3xl border border-border shadow-sm">
        <ScoreGauge value={score} />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black tracking-tight">
              Security Scan Report
            </h1>
            <Badge variant="outline" className="font-mono text-[10px]">
              {scan.id.slice(0, 8)}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Analyzed:{" "}
            <span className="text-foreground font-semibold">
              {scan.fileName}
            </span>{" "}
            • Status:{" "}
            <span className="text-emerald-500 font-bold ml-1">COMPLETED</span>
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map(
              (sev) =>
                grouped[sev].length > 0 && (
                  <Badge
                    key={sev}
                    className={`${getSeverityConfig(sev).bg} ${getSeverityConfig(sev).color} border-none font-bold`}
                  >
                    {grouped[sev].length} {sev}
                  </Badge>
                ),
            )}
          </div>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3 text-primary">
          <Shield className="h-5 w-5" />
          <h2 className="font-bold text-lg">AI Security Insights</h2>
        </div>
        <div className="text-sm text-foreground/80 leading-relaxed font-medium italic">
          {/* Logic handles aiInsights as an object or string */}
          Based on the technical analysis of{" "}
          <span className="text-primary font-bold">{scan.fileName}</span>, a
          total of{" "}
          <span className="text-primary font-bold">
            {vulns.length} vulnerabilities
          </span>{" "}
          were identified. It is highly recommended to review the affected
          libraries and update them immediately to mitigate potential security
          breaches.
        </div>
      </div>

      {/* Vulnerabilities List */}
      <div className="space-y-10">
        {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((severity) => {
          const items = grouped[severity];
          if (items.length === 0) return null;
          const config = getSeverityConfig(severity);

          return (
            <div key={severity} className="space-y-4">
              <h2
                className={`text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 ${config.color}`}
              >
                <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                {severity} Findings ({items.length})
              </h2>
              <div className="grid gap-3">
                {items.map((v: any) => (
                  <VulnCard key={v.id} vuln={v} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Sub-components ---

function ScoreGauge({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const color =
    value >= 80
      ? "text-emerald-500"
      : value >= 50
        ? "text-amber-500"
        : "text-rose-500";

  return (
    <div className="relative w-32 h-32 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/10"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className={color}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "circOut" }}
          strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-black ${color}`}>{value}</span>
        <span className="text-[10px] uppercase font-bold text-muted-foreground">
          Score
        </span>
      </div>
    </div>
  );
}

function VulnCard({ vuln }: { vuln: any }) {
  const [expanded, setExpanded] = useState(false);
  const config = getSeverityConfig(vuln.severity);

  return (
    <div
      className={`rounded-xl border border-border bg-card hover:border-primary/20 transition-all overflow-hidden shadow-sm`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-5 min-w-0">
          <div className={`p-2.5 rounded-xl ${config.bg} ${config.color}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-foreground">
                {vuln.libraryName}
              </span>
              <a
                href={`https://nvd.nist.gov/vuln/detail/${vuln.cveId}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] text-primary hover:underline flex items-center gap-1 font-mono"
              >
                {vuln.cveId || "CVE-INFO"} <ExternalLink className="h-2 w-2" />
              </a>
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-[400px] mt-1 italic">
              {vuln.title}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-muted/20"
          >
            <div className="p-6 border-t border-border/50 space-y-5">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Description
                </span>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {vuln.description}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase">
                  <Terminal className="h-3 w-3" /> Recommended Fix
                </div>
                <pre className="p-5 rounded-xl bg-black text-emerald-400 text-[11px] font-mono overflow-x-auto border border-white/5">
                  <code>{vuln.recommendation}</code>
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const getSeverityConfig = (severity: string) => {
  const s = String(severity || "LOW").toUpperCase();
  if (s === "CRITICAL")
    return { color: "text-rose-500", bg: "bg-rose-500/10", dot: "bg-rose-500" };
  if (s === "HIGH")
    return {
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      dot: "bg-orange-500",
    };
  if (s === "MEDIUM")
    return {
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      dot: "bg-amber-500",
    };
  return { color: "text-blue-500", bg: "bg-blue-500/10", dot: "bg-blue-500" };
};
