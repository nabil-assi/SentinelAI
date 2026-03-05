import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Upload,
  FileJson,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Play,
  FileCode,
  X,
  ArrowLeft,
  Globe,
  Cpu,
  AlertCircle,
  FileLock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/axios";

type ScanState = "idle" | "scanning" | "done" | "error";

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
  const [finalScanId, setFinalScanId] = useState<string | null>(null);

  const scanSteps = [
    selectedFile ? "Reading uploaded file..." : "Connecting to GitHub API...",
    "Fetching package.json contents...",
    "Parsing dependencies tree...",
    "AI-powered vulnerability assessment...",
    "Finalizing security report...",
  ];

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${projectId}`);
        setProject(res.data.project);
      } catch (err: any) {
        setError("Could not fetch project data. Check your connection.");
      }
    };
    if (projectId) fetchProject();
  }, [projectId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name !== "package.json" && file.name !== "package-lock.json") {
        setError("Please select a valid package.json or package-lock.json file!");
        return;
      }
      setSelectedFile(file);
      setError("");
    }
  };

  const startScan = useCallback(async () => {
    if (!selectedFile) {
      setError("File is mandatory! Please select a file to scan.");
      return;
    }

    setState("scanning");
    setProgress(10);
    setCurrentStep(0);
    setError("");

    // محاكاة التقدم البصري
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) {
          // تحديث الخطوة كل 20%
          if (prev === 30) setCurrentStep(1);
          if (prev === 50) setCurrentStep(2);
          if (prev === 70) setCurrentStep(3);
          if (prev === 85) setCurrentStep(4);
          return prev + 2;
        }
        return prev;
      });
    }, 2000);

    try {
      const formData = new FormData();
      formData.append("packageLock", selectedFile);

      // زيادة وقت الانتظار إلى 10 دقائق (600000ms)
      const response = await api.post(`/scan/analyze/${projectId}`, formData, {
        timeout: 600000, // 10 دقائق
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      clearInterval(interval);
      
      if (response.data?.success) {
        setProgress(100);
        setFinalScanId(response.data.scanId);
        setState("done");
      } else {
        throw new Error(response.data?.error || "Scan failed");
      }
      
    } catch (err: any) {
      clearInterval(interval);
      setState("error");
      
      // معالجة الأخطاء بشكل مفهوم
      if (err.code === 'ECONNABORTED') {
        setError("Scan is taking longer than expected. The server is still processing your request. Please check the results later.");
      } else if (err.message === "Network Error") {
        setError("Cannot connect to server. Please make sure the backend is running.");
      } else if (err.response?.status === 429) {
        setError("Too many scans. Please wait a few minutes before trying again.");
      } else if (err.response?.status === 413) {
        setError("File too large. Maximum file size is 10MB.");
      } else {
        setError(err.response?.data?.error || err.message || "Analysis failed. Please try again.");
      }
      
      console.error("Scan error:", err);
    }
  }, [projectId, selectedFile]);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />

      <Link
        to="/dashboard"
        className="flex items-center text-sm text-muted-foreground hover:text-primary mb-8 w-fit transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Link>

      {/* Project Card Header */}
      <div className="mb-10 p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-md flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
              Target Project
            </p>
            <h2 className="text-2xl font-bold tracking-tight">
              {project?.name || "Loading..."}
            </h2>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div
              className={`rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-500 ${
                selectedFile 
                  ? "border-primary/40 bg-primary/5" 
                  : "border-border hover:bg-secondary/20"
              }`}
            >
              {!selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-5">
                    <FileJson className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">
                    Upload package.json or package-lock.json
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Maximum file size: 10MB
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-11 px-8 rounded-xl border-primary/50 text-primary"
                  >
                    <Upload className="mr-2 h-4 w-4" /> Select File
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-4 bg-background p-4 rounded-xl border border-primary/30">
                    {selectedFile.name === "package-lock.json" ? (
                      <FileLock className="h-6 w-6 text-primary" />
                    ) : (
                      <FileCode className="h-6 w-6 text-primary" />
                    )}
                    <span className="font-mono text-sm font-bold">
                      {selectedFile.name}
                    </span>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="ml-2 p-1 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {selectedFile.name === "package-lock.json"
                      ? "📦 Using package-lock.json for exact versions"
                      : "📦 Using package.json for dependency list"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Size: {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-secondary/30 border border-border flex items-start gap-4">
              <Globe className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">GitHub Auto-Fetch</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  If no file is selected, we'll fetch package.json and
                  package-lock.json from your repository automatically.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button
              onClick={startScan}
              className="w-full h-14 bg-primary text-primary-foreground font-bold text-lg rounded-2xl shadow-xl hover:opacity-90 transition-all disabled:opacity-50"
              disabled={!selectedFile}
            >
              {selectedFile ? (
                <Cpu className="mr-2 h-5 w-5" />
              ) : (
                <Play className="mr-2 h-5 w-5" />
              )}
              {selectedFile ? `Scan ${selectedFile.name}` : "Select a file to start"}
            </Button>
          </motion.div>
        )}

        {state === "scanning" && (
          <motion.div
            key="scanning"
            className="rounded-3xl border border-border bg-card p-12 text-center shadow-xl"
          >
            <div className="relative w-24 h-24 mx-auto mb-10">
              <Loader2 className="h-24 w-24 text-primary animate-spin absolute inset-0 opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xl">
                {progress}%
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3">Security Analysis in Progress</h3>
            <p className="text-sm text-primary font-mono mb-4 italic">
              {scanSteps[currentStep]}
            </p>
            <p className="text-xs text-muted-foreground mb-8">
              This may take 2-5 minutes depending on project size
            </p>
            <Progress value={progress} className="h-3 rounded-full" />
          </motion.div>
        )}

        {state === "done" && (
          <motion.div
            key="done"
            className="rounded-3xl border border-primary/30 bg-card p-12 text-center shadow-2xl"
          >
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4">Scan Complete!</h3>
            <p className="text-muted-foreground mb-8">
              Your security report is ready to view
            </p>
            <Button
              onClick={() => navigate(`/results/${finalScanId}`)}
              className="bg-primary text-primary-foreground font-bold h-14 px-12 rounded-2xl"
            >
              View Results
            </Button>
          </motion.div>
        )}

        {state === "error" && (
          <motion.div
            key="error"
            className="rounded-3xl border border-destructive/30 bg-card p-12 text-center shadow-2xl"
          >
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-destructive">
              Scan Failed
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setState("idle")}
                variant="outline"
                className="h-12 px-6 rounded-xl"
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="ghost"
                className="h-12 px-6 rounded-xl"
              >
                Dashboard
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}