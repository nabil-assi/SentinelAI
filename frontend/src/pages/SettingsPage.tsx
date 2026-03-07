// frontend/src/pages/SettingsPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Save,
  ArrowLeft,
  Shield,
  Crown,
  Calendar,
  Key,
  LogOut,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import api from "@/api/axios";

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
  
  // Profile form
  const [profile, setProfile] = useState({
    name: "",
    email: ""
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: "30"
  });

  // جلب بيانات المستخدم
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // هنا هتجيب بيانات المستخدم من API
        // const res = await api.get("/user/me");
        // setUser(res.data.user);
        
        // بيانات تجريبية مؤقتاً
        const mockUser: UserData = {
          id: "user_123",
          email: "ahmad.nabil@example.com",
          name: "Ahmad Nabil",
          provider: "EMAIL",
          role: "PRO",
          createdAt: new Date().toISOString()
        };
        
        setUser(mockUser);
        setProfile({
          name: mockUser.name || "",
          email: mockUser.email
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // هنا هتحفظ كل الإعدادات مرة واحدة
      // await api.put("/user/settings", { profile, security });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings saved",
        description: "Your profile and security settings have been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* User Info Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <div className="flex items-start gap-6">
          <Avatar className="h-20 w-20 border-4 border-primary/20">
            <AvatarImage src={user?.image} />
            <AvatarFallback className="bg-primary/10 text-2xl">
              {user?.name?.split(' ').map(n => n[0]).join('') || user?.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">{user?.name || "User"}</h2>
              <Badge className={`
                ${user?.role === 'PRO' ? 'bg-purple-500' : ''}
                ${user?.role === 'ADMIN' ? 'bg-amber-500' : ''}
                ${user?.role === 'FREE' ? 'bg-blue-500' : ''}
              `}>
                {user?.role === 'PRO' && <Crown className="h-3 w-3 mr-1" />}
                {user?.role}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email
                </p>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Key className="h-3 w-3" /> Provider
                </p>
                <p className="text-sm font-medium">{user?.provider}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Member since
                </p>
                <p className="text-sm font-medium">
                  {new Date(user?.createdAt || "").toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Profile Information</h3>
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              placeholder="Enter your name"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              placeholder="Enter your email"
              className="mt-1"
              disabled={user?.provider !== 'EMAIL'}
            />
            {user?.provider !== 'EMAIL' && (
              <p className="text-xs text-muted-foreground mt-1">
                Email managed by {user?.provider}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Security Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Security Settings</h3>
        </div>

        <div className="space-y-6 max-w-md">
          {/* Password (للمستخدمين العاديين) */}
          {user?.provider === 'EMAIL' && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="mt-1"
              />
              <Button variant="link" className="px-0 text-xs h-auto mt-1">
                Change password
              </Button>
            </div>
          )}

          <Separator />

          {/* Two Factor Authentication */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
            <Switch
              checked={security.twoFactor}
              onCheckedChange={(checked) => setSecurity({...security, twoFactor: checked})}
            />
          </div>

          {/* Session Timeout */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Session Timeout</Label>
              <p className="text-sm text-muted-foreground">
                Auto logout after inactivity
              </p>
            </div>
            <select
              value={security.sessionTimeout}
              onChange={(e) => setSecurity({...security, sessionTimeout: e.target.value})}
              className="bg-background border rounded px-3 py-1 text-sm"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          {/* Danger Zone */}
          <Separator className="border-destructive/20" />
          
          <div>
            <h4 className="font-bold text-destructive mb-3">Danger Zone</h4>
            <Button variant="destructive" className="w-full sm:w-auto">
              <LogOut className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}