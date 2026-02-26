import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileJson, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

type ScanState = "idle" | "scanning" | "done";

const scanSteps = [
  "Uploading package.json...",
  "Parsing dependencies...",
  "Reading dependency tree...",
  "Checking 847 packages against CVE databases...",
  "Running AI vulnerability analysis...",
  "Generating security report...",
];

export default function ScanPage() {
  const [state, setState] = useState<ScanState>("idle");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const startScan = useCallback(() => {
    setState("scanning");
    setProgress(0);
    setCurrentStep(0);

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
    }, 80);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Security Scan</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload your package.json to analyze dependencies</p>
      </div>

      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div
              onClick={startScan}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); startScan(); }}
              className={`rounded-xl border-2 border-dashed p-16 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-primary bg-primary/5 glow-primary-sm"
                  : "border-border hover:border-primary/40 hover:bg-accent/30"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <FileJson className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Drop your package.json here</h3>
              <p className="text-muted-foreground text-sm mb-5">or click to browse files</p>
              <Button className="gradient-primary text-primary-foreground font-semibold">
                <Upload className="mr-2 h-4 w-4" />
                Select File
              </Button>
            </div>
          </motion.div>
        )}

        {state === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-border bg-card p-10 text-center"
          >
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-6 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Scanning in progress...</h3>
            <p className="text-sm text-primary font-mono mb-6">{scanSteps[currentStep]}</p>
            <Progress value={progress} className="h-2 mb-3" />
            <p className="text-xs text-muted-foreground">{progress}% complete</p>
          </motion.div>
        )}

        {state === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-primary/30 bg-card p-10 text-center"
          >
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-6" />
            <h3 className="text-lg font-semibold mb-2">Scan Complete!</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Found 15 vulnerabilities across 847 dependencies
            </p>
            <Button
              onClick={() => navigate("/results")}
              className="gradient-primary text-primary-foreground font-semibold"
            >
              View Full Report
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
