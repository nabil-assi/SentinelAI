import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FolderPlus } from "lucide-react";
import api from "@/api/axios";

export default function NewProject() {
  const [loading, setLoaging] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !description.trim() || !githubUrl.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (!githubUrl.startsWith("https://github.com/")) {
      setError("https://github.com/ must be the start of the GitHub URL. Please fix it.");
      return;
    }
    try {
      setLoaging(true);

      console.log("Sending form request:", {
        email: name,
        description: description,
        githubUrl: githubUrl,
      });
      const response = await api.post("projects/", {
        name: name,
        description: description,
        github: githubUrl,
      });

      if (response.data) {
        if (response.data.success === true) {
          navigate("/dashboard");
        } else {
          setError(response.data.message);
        }
      }
    } catch (error) {
      console.log(`Error: ${error}`);
      const message = error.response.data.message;
      setError(message);
    } finally {
      setLoaging(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create Project</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Add a new project to start scanning
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div>
            <Label htmlFor="name" className="text-sm text-muted-foreground">
              Project Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-awesome-app"
              className="mt-1.5 bg-secondary border-border h-10 font-mono"
            />
          </div>
          <div>
            <Label htmlFor="desc" className="text-sm text-muted-foreground">
              Description
            </Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your project..."
              className="mt-1.5 bg-secondary border-border resize-none"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="github" className="text-sm text-muted-foreground">
              GitHub URL
            </Label>
            <Input
              id="github"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
              className="mt-1.5 bg-secondary border-border h-10 font-mono"
            />
          </div>
        </div>
{error && (
  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg mb-4 text-center animate-shake">
    {error}
  </div>
)}
        <Button
          type="submit"
          disabled={loading}
          className="gradient-primary text-primary-foreground font-semibold h-11 w-full"
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </form>
    </div>
  );
}
