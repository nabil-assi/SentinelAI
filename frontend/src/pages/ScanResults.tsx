//Mock data

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowLeft,
  Terminal,
  Zap,
  ShieldAlert,
  ArrowRightLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// --- بيانات وهمية للديمو (Mock Data) ---
const MOCK_SCAN_RESULT = {
  id: "scan_demo_782910",
  fileName: "package-lock.json",
  projectId: "sentinel-core-ai",
  status: "COMPLETED",
  aiInsights:
    "Your security posture is currently AT RISK. \n\nWe detected several legacy libraries (body-parser, moment) that should be replaced with native Node.js APIs to reduce memory overhead and attack surface. Lodash version 4.17.15 is susceptible to prototype pollution - immediate update to 4.17.21 is mandatory.",
  vulnerabilities: [
    {
      id: "v1",
      libraryName: "lodash",
      cveId: "CVE-2020-8203",
      severity: "CRITICAL",
      title: "Prototype Pollution in _.merge",
      description:
        "A critical prototype pollution vulnerability allows attackers to inject properties into Object.prototype, potentially leading to Remote Code Execution (RCE) in Node.js environments.",
      recommendation: "npm install lodash@4.17.21",
      alternativeLibrary: "Native Object.assign() or Radash",
    },
    {
      id: "v2",
      libraryName: "body-parser",
      cveId: "GHSA-wqch-xfxh-vrr4",
      severity: "HIGH",
      title: "Insecure Default Configuration & Legacy Usage",
      description:
        "The body-parser middleware is redundant in modern Express (4.16+). Attackers can trigger DoS by sending large payloads if limits are not strictly configured.",
      recommendation:
        "// Delete body-parser and use:\napp.use(express.json());",
      alternativeLibrary: "Express Built-in Middleware",
    },
    {
      id: "v3",
      libraryName: "moment",
      cveId: "GHSA-884p-6pjj-vggm",
      severity: "MEDIUM",
      title: "Regular Expression Denial of Service (ReDoS)",
      description:
        "Moment.js is legacy and vulnerable to ReDoS when parsing specially crafted date strings. It also lacks tree-shaking support.",
      recommendation: "npm uninstall moment && npm install date-fns",
      alternativeLibrary: "date-fns / Luxon",
    },
  ],
};

const calculateScore = (vulns: any[]) => {
  if (vulns.length === 0) return 100;
  const weights = { CRITICAL: 30, HIGH: 15, MEDIUM: 8, LOW: 3 };
  const totalDeduction = vulns.reduce(
    (acc, v) => acc + (weights[v.severity as keyof typeof weights] || 0),
    0,
  );
  return Math.max(0, 100 - totalDeduction);
};

export default function ResultsPage() {
  const { scanId } = useParams();
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // محاكاة تحميل بسيطة للديمو
    const timer = setTimeout(() => {
      setScan(MOCK_SCAN_RESULT);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [scanId]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-mono italic animate-pulse">
          Sentinel AI is analyzing findings...
        </p>
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
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      <Button variant="ghost" asChild className="mb-4 hover:bg-secondary">
        <Link to={`/dashboard`} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 bg-card p-10 rounded-[2.5rem] border border-border shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <ShieldAlert size={120} />
        </div>
        <ScoreGauge value={score} />
        <div className="flex-1 z-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black tracking-tighter">
              Security Report
            </h1>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3">
              VERIFIED BY AI
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
            Source:{" "}
            <span className="text-foreground font-bold">{scan.fileName}</span>
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            {Object.entries(grouped).map(
              ([sev, list]) =>
                list.length > 0 && (
                  <div
                    key={sev}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-black ${getSeverityConfig(sev).bg} ${getSeverityConfig(sev).color}`}
                  >
                    {list.length} {sev}
                  </div>
                ),
            )}
          </div>
        </div>
      </div>

      {/* AI Insights Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-3xl border border-primary/30 bg-primary/[0.02] p-8 relative"
      >
        <div className="absolute -top-4 left-8 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
          <Zap className="h-3 w-3 fill-current" /> AI EXECUTIVE SUMMARY
        </div>
        <div className="text-lg text-foreground/90 leading-relaxed font-medium italic">
          "{scan.aiInsights}"
        </div>
      </motion.div>

      {/* Vulnerabilities List */}
      <div className="space-y-8">
        {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((severity) => {
          const items = grouped[severity];
          if (items.length === 0) return null;
          return (
            <div key={severity} className="space-y-4">
              <h2
                className={`text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3 ${getSeverityConfig(severity).color}`}
              >
                <div
                  className={`h-1 w-12 rounded-full ${getSeverityConfig(severity).dot}`}
                />
                {severity} THREATS
              </h2>
              <div className="grid gap-4">
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
  const color =
    value >= 80
      ? "text-emerald-500"
      : value >= 50
        ? "text-amber-500"
        : "text-rose-500";
  return (
    <div className="relative w-40 h-40 flex items-center justify-center bg-secondary/30 rounded-full border-4 border-background shadow-inner">
      <div className="text-center">
        <span className={`text-5xl font-black tracking-tighter ${color}`}>
          {value}
        </span>
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
          Health Score
        </p>
      </div>
    </div>
  );
}

function VulnCard({ vuln }: { vuln: any }) {
  const [expanded, setExpanded] = useState(false);
  const config = getSeverityConfig(vuln.severity);

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${expanded ? "border-primary/40 shadow-lg bg-card" : "border-border bg-card/50 hover:border-primary/20"}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-5">
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center ${config.bg} ${config.color} shadow-sm`}
          >
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-lg tracking-tight">
                {vuln.libraryName}
              </span>
              <Badge
                variant="outline"
                className="text-[9px] font-mono opacity-60"
              >
                {vuln.cveId}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {vuln.title}
            </p>
          </div>
        </div>
        <div
          className={`p-2 rounded-full transition-transform ${expanded ? "rotate-180 bg-primary/10 text-primary" : "text-muted-foreground"}`}
        >
          <ChevronDown className="h-5 w-5" />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 space-y-6">
              <div className="h-px bg-border w-full" />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Vulnerability Analysis
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {vuln.description}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* البدائل الذكية - تمييزها للديمو */}
                  {vuln.alternativeLibrary && (
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase mb-2">
                        <ArrowRightLeft className="h-3 w-3" /> Sentinel AI
                        Recommendation
                      </div>
                      <p className="text-sm font-bold text-emerald-600">
                        Switch to: {vuln.alternativeLibrary}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary">
                      <Terminal className="h-3 w-3" /> Remediation Script
                    </div>
                    <pre className="p-4 rounded-xl bg-zinc-950 text-emerald-400 text-xs font-mono border border-white/5">
                      {vuln.recommendation}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const getSeverityConfig = (severity: string) => {
  const s = severity.toUpperCase();
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
