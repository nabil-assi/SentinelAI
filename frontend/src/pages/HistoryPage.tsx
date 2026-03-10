import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // تأكد من وجود هذا المكون
import { 
  FileText, Calendar, ShieldAlert, ArrowRight, 
  AlertCircle, ChevronLeft, Loader2, Search, Filter, Activity, ShieldCheck
} from "lucide-react";
import api from "@/api/axios";
import { motion, AnimatePresence } from "framer-motion";

export default function HistoryPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(""); 
        const res = await api.get(`/api/scan/project/${projectId}/history`);
        const rawData = res.data?.scans || res.data?.data || res.data;
        setScans(Array.isArray(rawData) ? rawData : []);
      } catch (err: any) {
        setError("Failed to retrieve scan archives. Check server connection.");
        setScans([]);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchHistory();
  }, [projectId]);

  // Filtering Logic
  const filteredScans = scans.filter(scan => 
    scan.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scan.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats Calculation
  const totalScans = scans.length;
  const avgVulns = totalScans > 0 
    ? (scans.reduce((acc, s) => acc + (s._count?.vulnerabilities || 0), 0) / totalScans).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-mono text-xs uppercase tracking-widest">Decrypting Logs...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Navigation & Header */}
      <div className="space-y-6">
        <Link to="/dashboard" className="group inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-3 w-3 mr-1 transition-transform group-hover:-translate-x-1" /> Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Scan <span className="text-primary">Archives</span></h1>
            <p className="text-muted-foreground text-sm font-medium">
              Historical security data for: <span className="text-primary font-mono">{projectId}</span>
            </p>
          </div>
          
          {/* Quick Stats Mini-Cards */}
          <div className="flex gap-4">
            <div className="bg-card border border-border px-6 py-3 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Runs</p>
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-xl font-black">{totalScans}</span>
                </div>
            </div>
            <div className="bg-card border border-border px-6 py-3 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Avg Issues</p>
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-destructive" />
                    <span className="text-xl font-black">{avgVulns}</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border/50">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by filename or status..." 
            className="pl-10 bg-background border-border/50 rounded-xl focus-visible:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Button variant="outline" className="rounded-xl gap-2 text-xs font-bold uppercase w-full md:w-auto">
              <Filter className="h-3.5 w-3.5" /> Filter
           </Button>
           <Button onClick={() => navigate(`/scan/${projectId}`)} className="rounded-xl gap-2 text-xs font-bold uppercase w-full md:w-auto shadow-lg shadow-primary/20">
              <ShieldCheck className="h-3.5 w-3.5" /> Run New Scan
           </Button>
        </div>
      </div>

      {/* Table Section */}
      <AnimatePresence mode="wait">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-border bg-card shadow-sm overflow-hidden"
        >
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-5 px-8 font-black uppercase text-[10px] tracking-widest">Timestamp</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest">Target Asset</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">Issues</TableHead>
                <TableHead className="text-right px-8 font-black uppercase text-[10px] tracking-widest">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-24">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <Search className="h-12 w-12" />
                      <p className="font-bold text-sm uppercase">No matching records found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredScans.map((scan: any) => (
                  <TableRow key={scan.id} className="group hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0">
                    <TableCell className="py-5 px-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <Calendar className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm tracking-tight">
                            {new Date(scan.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase">
                            {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-[11px] bg-muted px-3 py-1.5 rounded-md font-mono border border-border group-hover:border-primary/30 transition-colors">
                        {scan.fileName || "root_source"}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={`
                          px-3 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border
                          ${scan.status === "COMPLETED" 
                            ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/10" 
                            : "bg-amber-500/5 text-amber-600 border-amber-500/10 animate-pulse"}
                        `}
                      >
                        {scan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`text-lg font-black ${scan._count?.vulnerabilities > 0 ? "text-destructive" : "text-emerald-500"}`}>
                        {scan._count?.vulnerabilities ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white border border-transparent hover:border-primary transition-all"
                        onClick={() => navigate(`/results/${scan.id}`)}
                      >
                        Details <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}