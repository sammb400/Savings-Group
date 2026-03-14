import React, { useState, useEffect } from 'react';
import { MobilePage } from "@/components/layout/MobilePage";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { User, Mail, Key, Hash, Loader2, Wallet } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useDatabase } from "@/lib/DatabaseContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useDashboard } from "@/hooks/use-savings";

const ProfileDetailsPage = () => {
  const { currentUser, updateProfile } = useAuth();
  const { getUserDocument } = useDatabase();
  const { data: dashboardData } = useDashboard();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [userData, setUserData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch additional Firestore data (Group ID, Verification Code)
  useEffect(() => {
    async function fetchUserData() {
      if (currentUser) {
        try {
          const data = await getUserDocument(currentUser.uid);
          setUserData(data);
          if (data?.displayName) setDisplayName(data.displayName);
        } catch (error) {
          console.error("Error fetching user doc:", error);
        } finally {
          setIsFetching(false);
        }
      }
    }
    fetchUserData();
  }, [currentUser, getUserDocument]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateProfile({ displayName });
      toast({
        title: "Profile Updated",
        description: "Your information has been saved successfully.",
      });
      navigate("/settings");
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching || !dashboardData) {
    return (
      <MobilePage title="Profile Details">
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobilePage>
    );
  }

  return (
    <MobilePage title="Profile Details">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold ml-1 text-muted-foreground uppercase tracking-wider">Display Name</label>
            <Input
              placeholder="Your Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              icon={<User className="w-5 h-5" />}
              required
            />
          </div>

          <div className="space-y-1.5 opacity-70">
            <label className="text-xs font-bold ml-1 text-muted-foreground uppercase tracking-wider">Email Address</label>
            <Input type="email" value={currentUser?.email || ""} icon={<Mail className="w-5 h-5" />} disabled />
          </div>

          <div className="space-y-1.5 opacity-70">
            <label className="text-xs font-bold ml-1 text-muted-foreground uppercase tracking-wider">Verification Code</label>
            <Input value={userData?.verificationCode || "---"} icon={<Key className="w-5 h-5" />} disabled />
          </div>

          <Button type="submit" className="w-full min-h-[52px] mt-2" isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </form>

      <div className="mt-10 pt-8 border-t border-border/50">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 px-1">
          Contribution Summary
        </h3>
        <div className="glass-card p-6 rounded-[2rem] flex items-center justify-between bg-primary/5 border-primary/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">Total Contributions</p>
              <p className="text-2xl font-bold font-display text-foreground">
                Kes {(dashboardData?.myTotal || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobilePage>
  );
};

export default ProfileDetailsPage;