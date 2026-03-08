import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Save,
  ArrowLeft,
  Crown,
  Calendar,
  Key,
  LogOut,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

interface UserData {
  id: string;
  email: string;
  name?: string;
  image?: string;
  provider: "EMAIL" | "GOOGLE" | "GITHUB";
  role: "FREE" | "PRO" | "ADMIN";
  createdAt: string;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  
  const [profile, setProfile] = useState({ name: "", email: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Mock Data
        const mockUser: UserData = {
          id: "user_123",
          email: "ahmad.nabil@example.com",
          name: "Ahmad Nabil",
          provider: "EMAIL",
          role: "PRO",
          createdAt: new Date().toISOString()
        };
        
        setUser(mockUser);
        setProfile({ name: mockUser.name || "", email: mockUser.email });
      } catch (error) {
        toast({ title: "Error", description: "Failed to load settings", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Logic لحفظ الـ Profile فقط
      await new Promise(resolve => setTimeout(resolve, 800));
      toast({ title: "Updated", description: "Profile saved successfully" });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Profile Info Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-none shadow-sm">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20 border-2 border-primary/10">
            <AvatarImage src={user?.image} />
            <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {user?.role === 'PRO' && <Crown className="h-3 w-3 mr-1" />}
                {user?.role}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={<Mail/>} label="Email" value={user?.email} />
              <InfoItem icon={<Calendar/>} label="Joined" value={new Date(user?.createdAt || "").toLocaleDateString()} />
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Profile Section */}
      <Card className="p-6 space-y-4">
        <SectionHeader icon={<User/>} title="Public Profile" />
        <div className="grid gap-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={profile.name} 
              onChange={(e) => setProfile({...profile, name: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              value={profile.email} 
              disabled={user?.provider !== 'EMAIL'} 
            />
          </div>
        </div>
      </Card>

      {/* Account Security Section */}
      <Card className="p-6 space-y-6">
        <SectionHeader icon={<Lock/>} title="Account Security" />
        <div className="max-w-md space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div>
              <p className="text-sm font-medium">Authentication</p>
              <p className="text-xs text-muted-foreground">Logged in via {user?.provider}</p>
            </div>
            <Key className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="pt-2">
            <Button variant="destructive" variant="outline" className="w-full text-destructive hover:bg-destructive/5 gap-2 border-destructive/20">
              <LogOut className="h-4 w-4" /> Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

const InfoItem = ({ icon, label, value }: any) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
      <span className="[&>svg]:h-3 [&>svg]:w-3">{icon}</span> {label}
    </p>
    <p className="text-sm font-semibold">{value}</p>
  </div>
);

const SectionHeader = ({ icon, title }: any) => (
  <div className="flex items-center gap-3">
    <div className="p-2 bg-primary/10 rounded-lg text-primary [&>svg]:h-5 [&>svg]:w-5">
      {icon}
    </div>
    <h3 className="text-lg font-semibold">{title}</h3>
  </div>
);