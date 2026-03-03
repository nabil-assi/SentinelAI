import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Upload, FileJson, Loader2, CheckCircle2, 
  Github, ShieldCheck, Play, FileCode, X, ArrowLeft, Globe, Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/axios";

type ScanState = "idle" | "scanning" | "done";

export default function ScanPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [project, setProject] = useState<any>(null);
  const [state, setState] = useState<ScanState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");

  const scanSteps = [
    selectedFile ? "Reading uploaded file..." : "Connecting to GitHub API...",
    "Fetching package.json contents...",
    "Parsing dependencies tree...",
    "Comparing versions with CVE database...",
    "AI-powered vulnerability assessment...",
    "Finalizing security report..."
  ];

  // 1. جلب بيانات المشروع (عشان نعرف رابط الجيت هب)
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${projectId}`);
        setProject(res.data.project);
      } catch (err: any) {
        setError("تعذر جلب بيانات المشروع. تأكد من اتصالك بالإنترنت.");
      }
    };
    if (projectId) fetchProject();
  }, [projectId]);

  // 2. معالجة اختيار الملف يدوياً
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name !== "package.json") {
        alert("يرجى اختيار ملف package.json فقط!");
        return;
      }
      setSelectedFile(file);
    }
  };

  // 3. دالة بدء الفحص (المنطق الذكي)
  const startScan = useCallback(async () => {
    setState("scanning");
    setProgress(0);
    setCurrentStep(0);

    // هنا المحاكاة (في الحقيقة سنرسل الطلب للباكيند)
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + 2;
        const stepIndex = Math.min(Math.floor(next / (100 / scanSteps.length)), scanSteps.length - 1);
        setCurrentStep(stepIndex);
        if (next >= 100) {
          clearInterval(interval);
          setState("done");
          return 100;
        }
        return next;
      });
    }, 70);
  }, [selectedFile]);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />

      <Link to="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-8 w-fit transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Link>

      {/* Project Card Header */}
      <div className="mb-10 p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-md flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Target Project</p>
            <h2 className="text-2xl font-bold tracking-tight">{project?.name || "Loading..."}</h2>
          </div>
        </div>
        {project?.github && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-[10px] font-mono">
            <Github className="h-3 w-3" /> {project.github.split('/').pop()}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
            
            {/* Upload Zone */}
            <div className={`rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-500 ${
              selectedFile ? "border-primary/40 bg-primary/5" : "border-border hover:bg-secondary/20"
            }`}>
              {!selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-5">
                    <FileJson className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Option 1: Manual Upload</h3>
                  <p className="text-muted-foreground text-xs mb-6 max-w-[250px] mx-auto leading-relaxed">
                    Upload your <code className="text-primary">package.json</code> file directly from your computer.
                  </p>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-11 px-8 rounded-xl border-primary/50 text-primary">
                    <Upload className="mr-2 h-4 w-4" /> Select File
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center animate-in zoom-in-95">
                  <div className="flex items-center gap-4 bg-background p-4 rounded-xl border border-primary/30 shadow-sm">
                    <FileCode className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Ready to analyze</p>
                      <span className="font-mono text-sm font-bold">{selectedFile.name}</span>
                    </div>
                    <button onClick={() => setSelectedFile(null)} className="ml-2 p-1 hover:text-destructive transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative py-4">
               <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
               <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-muted-foreground font-bold">OR</span></div>
            </div>

            {/* GitHub Option Info */}
            <div className="p-6 rounded-2xl bg-secondary/30 border border-border flex items-start gap-4">
                <Globe className="h-5 w-5 text-primary mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold">Option 2: GitHub Auto-Fetch</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        If no file is uploaded, we will automatically try to fetch the <code className="text-foreground">package.json</code> from your linked repository.
                    </p>
                </div>
            </div>

            {/* Smart Start Button */}
            <Button 
              onClick={startScan}
              className="w-full h-14 gradient-primary text-primary-foreground font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
            >
              {selectedFile ? <Cpu className="mr-2 h-5 w-5 animate-pulse" /> : <Play className="mr-2 h-5 w-5 fill-current" />}
              {selectedFile ? "Scan Uploaded File" : "Start Auto-Scan from GitHub"}
            </Button>
          </motion.div>
        )}

        {state === "scanning" && (
          <motion.div key="scanning" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-border bg-card p-12 text-center shadow-xl">
             <div className="relative w-24 h-24 mx-auto mb-10">
                <Loader2 className="h-24 w-24 text-primary animate-spin absolute inset-0 opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xl">{progress}%</div>
             </div>
             <h3 className="text-xl font-bold mb-3 tracking-tight">System Analysis Running</h3>
             <p className="text-sm text-primary font-mono mb-8 italic">{scanSteps[currentStep]}</p>
             <Progress value={progress} className="h-3 rounded-full" />
          </motion.div>
        )}

        {state === "done" && (
          <motion.div key="done" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-primary/30 bg-card p-12 text-center shadow-2xl">
             <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-6" />
             <h3 className="text-3xl font-bold mb-4">Scan Complete</h3>
             <p className="text-muted-foreground text-sm mb-12 max-w-sm mx-auto">
               Analysis finished for <span className="text-foreground font-bold">{project?.name}</span>. 
               The report is ready for your review.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Button onClick={() => navigate(`/results/${projectId}`)} className="gradient-primary text-primary-foreground font-bold h-14 px-12 rounded-2xl">View Results</Button>
               <Button variant="outline" onClick={() => { setState("idle"); setSelectedFile(null); }} className="h-14 px-8 rounded-2xl border-2">Try Again</Button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}