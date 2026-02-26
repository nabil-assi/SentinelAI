import { useState } from "react";
import { Shield, AlertTriangle, Copy, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

const score = 72;

const aiSummary = `This scan analyzed 847 dependencies and identified 15 vulnerabilities across your project. The most critical issues involve outdated versions of \`lodash\` and \`express\`, which have known prototype pollution and path traversal vulnerabilities respectively. We recommend prioritizing the 3 critical findings and updating the affected packages immediately. Overall, your project's security posture is **Good** but requires attention on key dependencies.`;

interface Vulnerability {
  id: string;
  library: string;
  cveId: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  fixRecommendation: string;
}

const vulnerabilities: Vulnerability[] = [
  {
    id: "1",
    library: "lodash@4.17.15",
    cveId: "CVE-2021-23337",
    severity: "critical",
    description: "Prototype Pollution in lodash via the template function allowing attackers to modify Object.prototype properties.",
    fixRecommendation: 'npm install lodash@4.17.21\n\n// Or pin the version in package.json:\n"lodash": "^4.17.21"',
  },
  {
    id: "2",
    library: "express@4.17.1",
    cveId: "CVE-2024-29041",
    severity: "critical",
    description: "Open Redirect vulnerability in Express.js allows attackers to redirect users to malicious URLs via crafted request paths.",
    fixRecommendation: 'npm install express@4.19.2\n\n// Ensure URL validation:\napp.use((req, res, next) => {\n  // Validate redirect URLs\n});',
  },
  {
    id: "3",
    library: "jsonwebtoken@8.5.1",
    cveId: "CVE-2022-23529",
    severity: "critical",
    description: "Insecure implementation of key retrieval function allows remote attackers to forge JWTs and bypass authentication.",
    fixRecommendation: 'npm install jsonwebtoken@9.0.0\n\n// Use asymmetric key verification:\njwt.verify(token, publicKey, { algorithms: ["RS256"] });',
  },
  {
    id: "4",
    library: "axios@0.21.1",
    cveId: "CVE-2023-45857",
    severity: "high",
    description: "SSRF vulnerability allows attackers to send requests to internal services by exploiting URL parsing inconsistencies.",
    fixRecommendation: 'npm install axios@1.6.0\n\n// Add request interceptor for URL validation',
  },
  {
    id: "5",
    library: "minimatch@3.0.4",
    cveId: "CVE-2022-3517",
    severity: "high",
    description: "ReDoS vulnerability in minimatch when processing specially crafted glob patterns causing exponential backtracking.",
    fixRecommendation: 'npm install minimatch@3.1.2',
  },
  {
    id: "6",
    library: "semver@5.7.1",
    cveId: "CVE-2022-25883",
    severity: "medium",
    description: "Regular Expression Denial of Service in semver package when parsing crafted version strings.",
    fixRecommendation: 'npm install semver@7.5.2',
  },
  {
    id: "7",
    library: "tough-cookie@2.5.0",
    cveId: "CVE-2023-26136",
    severity: "medium",
    description: "Prototype pollution vulnerability in tough-cookie via cookie parsing allows modification of Object prototype.",
    fixRecommendation: 'npm install tough-cookie@4.1.3',
  },
  {
    id: "8",
    library: "word-wrap@1.2.3",
    cveId: "CVE-2023-26115",
    severity: "low",
    description: "ReDoS vulnerability when wrapping text with specific patterns causing potential denial of service.",
    fixRecommendation: 'npm install word-wrap@1.2.4',
  },
];

const severityConfig = {
  critical: { color: "text-severity-critical", bg: "bg-severity-critical/10", border: "border-severity-critical/20", label: "Critical" },
  high: { color: "text-severity-high", bg: "bg-severity-high/10", border: "border-severity-high/20", label: "High" },
  medium: { color: "text-severity-medium", bg: "bg-severity-medium/10", border: "border-severity-medium/20", label: "Medium" },
  low: { color: "text-severity-safe", bg: "bg-severity-safe/10", border: "border-severity-safe/20", label: "Low" },
};

function ScoreGauge({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const color = value >= 80 ? "text-severity-safe" : value >= 50 ? "text-severity-medium" : "text-severity-critical";

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          className={color}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${color}`}>{value}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function VulnCard({ vuln }: { vuln: Vulnerability }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const config = severityConfig[vuln.severity];

  const handleCopy = () => {
    navigator.clipboard.writeText(vuln.fixRecommendation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-lg border ${config.border} ${config.bg} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/10 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <AlertTriangle className={`h-4 w-4 shrink-0 ${config.color}`} />
          <span className="font-mono text-sm font-medium truncate">{vuln.library}</span>
          <Badge variant="outline" className={`shrink-0 ${config.color} ${config.border} text-xs`}>
            {vuln.cveId}
          </Badge>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Description</h4>
                <p className="text-sm text-foreground/80">{vuln.description}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="h-3 w-3 text-primary" />
                    AI Fix Recommendation
                  </h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copied ? "Copied" : "Copy Snippet"}
                  </Button>
                </div>
                <pre className="rounded-md bg-background/80 border border-border p-3 text-xs font-mono text-foreground/80 overflow-x-auto whitespace-pre-wrap">
                  {vuln.fixRecommendation}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ScanResults() {
  const grouped = {
    critical: vulnerabilities.filter((v) => v.severity === "critical"),
    high: vulnerabilities.filter((v) => v.severity === "high"),
    medium: vulnerabilities.filter((v) => v.severity === "medium"),
    low: vulnerabilities.filter((v) => v.severity === "low"),
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <ScoreGauge value={score} />
        <div>
          <h1 className="text-2xl font-bold">Scan Report</h1>
          <p className="text-muted-foreground text-sm mt-1">
            frontend-app · Scanned 847 dependencies · 2 min ago
          </p>
          <div className="flex items-center gap-3 mt-3">
            <Badge className="bg-severity-critical/10 text-severity-critical border-severity-critical/20" variant="outline">
              {grouped.critical.length} Critical
            </Badge>
            <Badge className="bg-severity-high/10 text-severity-high border-severity-high/20" variant="outline">
              {grouped.high.length} High
            </Badge>
            <Badge className="bg-severity-medium/10 text-severity-medium border-severity-medium/20" variant="outline">
              {grouped.medium.length} Medium
            </Badge>
            <Badge className="bg-severity-safe/10 text-severity-safe border-severity-safe/20" variant="outline">
              {grouped.low.length} Low
            </Badge>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">AI Security Summary</h2>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">{aiSummary}</p>
      </div>

      {/* Vulnerabilities */}
      {(["critical", "high", "medium", "low"] as const).map((severity) => {
        const items = grouped[severity];
        if (items.length === 0) return null;
        const config = severityConfig[severity];
        return (
          <div key={severity}>
            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${config.color}`}>
              {config.label} ({items.length})
            </h2>
            <div className="space-y-2">
              {items.map((v) => (
                <VulnCard key={v.id} vuln={v} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
