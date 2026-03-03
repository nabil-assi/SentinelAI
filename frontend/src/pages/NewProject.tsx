import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { FolderPlus, Search, LayoutGrid, ArrowRight } from "lucide-react";
import api from "@/api/axios";

export default function NewProject() {
  const [activeTab, setActiveTab] = useState<"create" | "select">("create");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoaging] = useState(false);
  const [error, setError] = useState("");

  // Form States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === "select") {
      const fetchProjects = async () => {
        try {
          const res = await api.get("projects/");
          setProjects(res.data.projects);
        } catch (err) {
          setError("Failed to load existing projects.");
        }
      };
      fetchProjects();
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !description.trim() || !githubUrl.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (!githubUrl.startsWith("https://github.com/")) {
      setError("URL must start with https://github.com/");
      return;
    }

    try {
      setLoaging(true);
      const response = await api.post("projects/", {
        name: name,
        description: description,
        github: githubUrl,
      });

      if (response.data?.success) {
        navigate(`/scan/${response.data.project.id}`);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Error creating project");
    } finally {
      setLoaging(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Project Security</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Start a new scan by creating or selecting a project
        </p>
      </div>

      {/* --- Tabs Switcher --- */}
      <div className="flex p-1 bg-secondary/50 rounded-xl mb-8 border border-border">
        <button
          onClick={() => setActiveTab("create")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === "create"
              ? "bg-background shadow-sm text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FolderPlus className="h-4 w-4" />
          Create New
        </button>
        <button
          onClick={() => setActiveTab("select")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === "select"
              ? "bg-background shadow-sm text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="h-4 w-4" />
          Select Existing
        </button>
      </div>

      {activeTab === "create" ? (
        <motion.form
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm">
            <div>
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Project Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="sentinel-core-api"
                className="mt-1.5 bg-secondary/30 border-border h-11 font-mono"
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Description
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Backend services for code analysis..."
                className="mt-1.5 bg-secondary/30 border-border resize-none"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                GitHub URL
              </Label>
              <Input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/organization/repo"
                className="mt-1.5 bg-secondary/30 border-border h-11 font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="text-destructive text-xs text-center font-medium">
              {error}
            </div>
          )}

          <Button
            disabled={loading}
            className="gradient-primary text-primary-foreground font-bold h-12 w-full rounded-xl"
          >
            {loading ? "Creating..." : "Create and Continue"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.form>
      ) : (
        /* --- Select Existing Project Tab --- */
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {projects.length > 0 ? (
              projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/scan/${proj.id}`)}
                  className="group flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10">
                      <LayoutGrid className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{proj.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {proj.repoUrl}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-2xl">
                No projects found. Create one first!
              </div>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setActiveTab("create")}
            className="w-full h-11 border-dashed"
          >
            + Create New Project Instead
          </Button>
        </motion.div>
      )}
    </div>
  );
}
