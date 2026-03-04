import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, Calendar, ShieldAlert, ArrowRight, 
  AlertCircle, ChevronLeft, Loader2 
} from "lucide-react";
import api from "@/api/axios";
import { motion } from "framer-motion";

export default function HistoryPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // صمام أمان 1: تهيئة الحالة بمصفوفة فارغة دائماً لضمان عدم حدوث undefined
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(""); // تصقير الخطأ عند المحاولة الجديدة
        
        const res = await api.get(`/scan/project/${projectId}/history`);
        
        console.log("📥 Raw History Response:", res.data);

        // صمام أمان 2: استخراج المصفوفة بذكاء مهما كان شكل رد الباكيند
        // نبحث عن scans، ثم data، ثم نتحقق إذا كان الرد نفسه هو المصفوفة
        const rawData = res.data?.scans || res.data?.data || res.data;
        const finalArray = Array.isArray(rawData) ? rawData : [];
        
        setScans(finalArray);
      } catch (err: any) {
        console.error("❌ History Page Critical Error:", err);
        setError("فشل تحميل سجل الفحوصات. تأكد من اتصالك بالخادم.");
        setScans([]); // ضمان بقاء الحالة مصفوفة حتى عند الخطأ
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchHistory();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 bg-background">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-mono text-sm uppercase tracking-widest">Retrieving archives...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-10 text-center space-y-6">
        <div className="p-4 bg-destructive/10 rounded-full">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <div className="space-y-2">
          <p className="text-destructive font-black text-xl">System Failure</p>
          <p className="text-muted-foreground max-w-xs mx-auto text-sm">{error}</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
           إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pb-20">
      {/* Breadcrumbs */}
      <Link to="/dashboard" className="group flex items-center text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" /> Back to Projects
      </Link>

      <div className="flex items-end justify-between border-b border-border pb-8">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 italic uppercase">Scan History</h1>
          <p className="text-muted-foreground text-sm font-medium">
            Timeline of security assessments for project: <span className="text-primary font-mono">{projectId}</span>
          </p>
        </div>
        <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10 shadow-inner">
           <FileText className="h-10 w-10 text-primary opacity-80" />
        </div>
      </div>

      {/* Table Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-border bg-card/30 shadow-2xl overflow-hidden backdrop-blur-md"
      >
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="py-6 px-6 font-black uppercase text-[10px] tracking-widest">Date & Time</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Analyzed File</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Security Status</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Findings</TableHead>
              <TableHead className="text-right px-6 font-black uppercase text-[10px] tracking-widest">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* صمام أمان 3: التحقق من وجود بيانات قبل عمل map */}
            {!scans || scans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-32">
                  <div className="flex flex-col items-center gap-4 opacity-40">
                    <ShieldAlert className="h-16 w-16 mb-2" />
                    <div className="space-y-1">
                      <p className="font-black text-xl uppercase tracking-tighter">Zero Records Found</p>
                      <p className="text-xs font-medium">This project has no previous security logs.</p>
                    </div>
                    <Button variant="secondary" className="mt-4 rounded-full" onClick={() => navigate(`/scan/${projectId}`)}>
                      Launch First Scan
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              scans.map((scan: any) => (
                <TableRow key={scan.id} className="group hover:bg-primary/[0.03] transition-all border-b border-border/30 last:border-0">
                  <TableCell className="py-5 px-6 font-medium">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 font-mono text-sm">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {new Date(scan.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-5 font-bold uppercase tracking-tighter">
                        at {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-[10px] bg-black text-emerald-500 font-mono px-3 py-1.5 rounded-lg border border-white/5 shadow-inner">
                      {scan.fileName || "unnamed_file"}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`
                        px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-none
                        ${scan.status === "COMPLETED" 
                          ? "bg-emerald-500/10 text-emerald-500" 
                          : "bg-amber-500/10 text-amber-500 animate-pulse"}
                      `}
                    >
                      {scan.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {scan.status === "COMPLETED" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black tracking-tighter">
                          {scan._count?.vulnerabilities ?? 0}
                        </span>
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter leading-none">
                          Identified<br/>Issues
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">Processing...</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all px-6 border border-border/50"
                      onClick={() => navigate(`/results/${scan.id}`)}
                    >
                      Audit Report <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}