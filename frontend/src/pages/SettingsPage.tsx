import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  ArrowLeft,
  Crown,
  Calendar,
  Shield,
  Fingerprint,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/api/axios";

// تحديث الـ Interface ليطابق الـ JSON تبعك تماماً
interface UserData {
  id: string;
  name: string;
  email: string;
  role: "FREE" | "PRO" | "ADMIN";
  createdAt: string;
  provider: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // الربط مع الباكند لجلب بياناتك الحقيقية
        const res = await api.get("/api/auth/me"); // افترضت أن هذا هو الـ endpoint
        if (res.data.success) {
          setUser(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      <p className="text-sm font-mono text-muted-foreground animate-pulse">LOADING PROFILE...</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)} size="sm" className="rounded-full h-10 w-10 p-0 hover:bg-primary hover:text-white transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Account Detail</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Profile Identity Management</p>
          </div>
        </div>
        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary font-bold">
          {user?.role === 'PRO' && <Crown className="h-3.5 w-3.5 mr-2 inline" />}
          {user?.role} ACCOUNT
        </Badge>
      </div>

      {/* Profile Card */}
      <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-br from-card to-muted/30 p-8 rounded-[2.5rem]">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <User size={120} />
        </div>
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl ring-2 ring-primary/20">
            <AvatarImage src="" /> {/* اتركها فارغة إذا ما في صورة بالـ JSON */}
            <AvatarFallback className="text-4xl font-black bg-primary text-primary-foreground">
                {user?.name?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-black tracking-tighter italic uppercase">{user?.name}</h2>
              <p className="text-muted-foreground font-mono text-sm">{user?.email}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DisplayItem icon={<Fingerprint/>} label="User Identifier" value={user?.id} />
              <DisplayItem icon={<Calendar/>} label="Member Since" value={new Date(user?.createdAt || "").toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} />
              <DisplayItem icon={<Shield/>} label="Account Role" value={user?.role} isBadge />
              <DisplayItem icon={<Info/>} label="Auth Provider" value={user?.provider} />
            </div>
          </div>
        </div>
      </Card>

      {/* Security Note */}
      <div className="flex items-start gap-4 p-6 bg-muted/20 border border-border rounded-3xl">
        <div className="p-3 bg-background rounded-2xl shadow-sm">
            <Fingerprint className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
            <h4 className="text-sm font-bold uppercase">System Verified Identity</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
                This account is verified via <b>{user?.provider}</b>. All security protocols and data encryption are active for this session.
            </p>
        </div>
      </div>
    </div>
  );
}

// مكون فرعي لعرض البيانات بشكل مرتب
const DisplayItem = ({ icon, label, value, isBadge }: any) => (
  <div className="bg-background/50 backdrop-blur-sm p-4 rounded-2xl border border-border/40 hover:border-primary/20 transition-colors">
    <div className="flex items-center gap-2 text-muted-foreground mb-1">
      <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-[0.1em]">{label}</span>
    </div>
    {isBadge ? (
        <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black tracking-widest px-2">
            {value}
        </Badge>
    ) : (
        <p className="text-sm font-bold truncate tracking-tight">{value}</p>
    )}
  </div>
);