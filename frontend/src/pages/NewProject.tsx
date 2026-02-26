import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FolderPlus } from "lucide-react";

export default function NewProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create Project</h1>
        <p className="text-muted-foreground text-sm mt-1">Add a new project to start scanning</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div>
            <Label htmlFor="name" className="text-sm text-muted-foreground">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-awesome-app"
              className="mt-1.5 bg-secondary border-border h-10 font-mono"
            />
          </div>
          <div>
            <Label htmlFor="desc" className="text-sm text-muted-foreground">Description</Label>
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
            <Label htmlFor="github" className="text-sm text-muted-foreground">GitHub URL</Label>
            <Input
              id="github"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
              className="mt-1.5 bg-secondary border-border h-10 font-mono"
            />
          </div>
        </div>

        <Button type="submit" className="gradient-primary text-primary-foreground font-semibold h-11 w-full">
          <FolderPlus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </form>
    </div>
  );
}
