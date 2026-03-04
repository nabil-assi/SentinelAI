// import { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import { 
//   Shield, AlertTriangle, Copy, Check, X, ChevronDown, ChevronUp, 
//   Loader2, ArrowLeft, Terminal, ShieldAlert 
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { motion, AnimatePresence } from "framer-motion";
// import api from "@/api/axios";

// // --- التقييم الديناميكي ---
// const calculateScore = (vulns: any[]) => {
//   if (vulns.length === 0) return 100;
//   const weights = { CRITICAL: 20, HIGH: 10, MEDIUM: 5, LOW: 2 };
//   const totalDeduction = vulns.reduce((acc, v) => acc + (weights[v.severity as keyof typeof weights] || 0), 0);
//   return Math.max(0, 100 - totalDeduction);
// };

// export default function ResultsPage() {
//   const { scanId } = useParams();
//   const [scan, setScan] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchResults = async () => {
//       try {
//         const res = await api.get(`/scan/results/${scanId}`);
//         setScan(res.data.data);
//       } catch (err: any) {
//         setError("Failed to fetch security report.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchResults();
//   }, [scanId]);

//   if (loading) return (
//     <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
//       <Loader2 className="h-10 w-10 text-primary animate-spin" />
//       <p className="text-muted-foreground font-mono italic">Parsing AI Security Report...</p>
//     </div>
//   );

//   if (error || !scan) return <div className="p-20 text-center text-destructive">{error || "Report not found"}</div>;

//   const vulns = scan.vulnerabilities || [];
//   const score = calculateScore(vulns);
  
//   const grouped = {
//     CRITICAL: vulns.filter((v: any) => v.severity === "CRITICAL"),
//     HIGH: vulns.filter((v: any) => v.severity === "HIGH"),
//     MEDIUM: vulns.filter((v: any) => v.severity === "MEDIUM"),
//     LOW: vulns.filter((v: any) => v.severity === "LOW"),
//   };

//   return (
//     <div className="max-w-5xl mx-auto p-6 space-y-8">
//       {/* Navigation */}
//       <Button variant="ghost" asChild className="mb-4">
//         <Link to={`/history/${scan.projectId}`} className="flex items-center gap-2">
//           <ArrowLeft className="h-4 w-4" /> Back to History
//         </Link>
//       </Button>

//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row items-start md:items-center gap-8 bg-card p-8 rounded-3xl border border-border shadow-sm">
//         <ScoreGauge value={score} />
//         <div className="flex-1">
//           <div className="flex items-center gap-3 mb-2">
//             <h1 className="text-3xl font-black tracking-tight">Security Scan Report</h1>
//             <Badge variant="outline" className="font-mono text-[10px]">{scan.id.slice(0,8)}</Badge>
//           </div>
//           <p className="text-muted-foreground text-sm">
//             Analyzed: <span className="text-foreground font-semibold">{scan.fileName}</span> • 
//             Status: <span className="text-emerald-500 font-bold ml-1">COMPLETED</span>
//           </p>
          
//           <div className="flex flex-wrap items-center gap-3 mt-4">
//             {Object.entries(grouped).map(([sev, list]) => (
//               list.length > 0 && (
//                 <Badge key={sev} className={`${getSeverityConfig(sev).bg} ${getSeverityConfig(sev).color} border-none`}>
//                   {list.length} {sev}
//                 </Badge>
//               )
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* AI Insights Card */}
//       <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-6 backdrop-blur-sm">
//         <div className="flex items-center gap-2 mb-3">
//           <Shield className="h-5 w-5 text-primary" />
//           <h2 className="font-bold text-lg">AI Security Insights</h2>
//         </div>
//         <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium">
//           {scan.aiInsights || "No additional insights provided for this scan."}
//         </div>
//       </div>

//       {/* Vulnerabilities List */}
//       <div className="space-y-6">
//         {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((severity) => {
//           const items = grouped[severity];
//           if (items.length === 0) return null;
//           const config = getSeverityConfig(severity);
          
//           return (
//             <div key={severity} className="space-y-3">
//               <h2 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${config.color}`}>
//                 <span className={`w-2 h-2 rounded-full ${config.dot}`} />
//                 {severity} ({items.length})
//               </h2>
//               <div className="grid gap-3">
//                 {items.map((v: any) => <VulnCard key={v.id} vuln={v} />)}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// // --- مكونات مساعدة (Sub-components) ---

// function ScoreGauge({ value }: { value: number }) {
//   const circumference = 2 * Math.PI * 45;
//   const strokeDashoffset = circumference - (value / 100) * circumference;
//   const color = value >= 80 ? "text-emerald-500" : value >= 50 ? "text-amber-500" : "text-rose-500";

//   return (
//     <div className="relative w-32 h-32 shrink-0">
//       <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
//         <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
//         <motion.circle
//           cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
//           className={color}
//           initial={{ strokeDashoffset: circumference }}
//           animate={{ strokeDashoffset }}
//           transition={{ duration: 2, ease: "backOut" }}
//           strokeDasharray={circumference}
//         />
//       </svg>
//       <div className="absolute inset-0 flex flex-col items-center justify-center">
//         <span className={`text-3xl font-black ${color}`}>{value}</span>
//         <span className="text-[10px] uppercase font-bold text-muted-foreground">Score</span>
//       </div>
//     </div>
//   );
// }

// function VulnCard({ vuln }: { vuln: any }) {
//   const [expanded, setExpanded] = useState(false);
//   const config = getSeverityConfig(vuln.severity);

//   return (
//     <div className={`rounded-xl border border-border bg-card hover:border-primary/30 transition-all overflow-hidden`}>
//       <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-5 text-left">
//         <div className="flex items-center gap-4 min-w-0">
//           <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
//              <AlertTriangle className="h-4 w-4" />
//           </div>
//           <div className="flex flex-col">
//             <span className="font-mono text-sm font-bold truncate">{vuln.libraryName}</span>
//             <span className="text-xs text-muted-foreground truncate max-w-[300px]">{vuln.title}</span>
//           </div>
//         </div>
//         <div className="flex items-center gap-3">
//           <Badge variant="outline" className="font-mono text-[10px] hidden md:block">{vuln.cveId || "NO-CVE"}</Badge>
//           {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
//         </div>
//       </button>

//       <AnimatePresence>
//         {expanded && (
//           <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-muted/30">
//             <div className="p-5 border-t border-border space-y-4">
//               <p className="text-sm text-foreground/80 leading-relaxed">{vuln.description}</p>
//               <div className="space-y-2">
//                 <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase">
//                   <Terminal className="h-3 w-3" /> Fix Recommendation
//                 </div>
//                 <pre className="p-4 rounded-lg bg-black text-emerald-400 text-xs font-mono overflow-x-auto">
//                   {vuln.recommendation}
//                 </pre>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// const getSeverityConfig = (severity: string) => {
//   const s = severity.toUpperCase();
//   if (s === "CRITICAL") return { color: "text-rose-500", bg: "bg-rose-500/10", dot: "bg-rose-500" };
//   if (s === "HIGH") return { color: "text-orange-500", bg: "bg-orange-500/10", dot: "bg-orange-500" };
//   if (s === "MEDIUM") return { color: "text-amber-500", bg: "bg-amber-500/10", dot: "bg-amber-500" };
//   return { color: "text-blue-500", bg: "bg-blue-500/10", dot: "bg-blue-500" };
// };