import React from "react";
import { MobilePage } from "@/components/layout/MobilePage";
import { useMembers, useDashboard } from "@/hooks/use-savings";
import { Loader2, Crown, User, Share2 } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useToast } from "@/hooks/use-toast";

export default function Members() {
  const { data: members, isLoading: membersLoading } = useMembers();
  const { data: dashboard, isLoading: dashLoading } = useDashboard();
  const { toast } = useToast();

  const handleInvite = () => {
    if (dashboard?.group?.inviteId) {
      navigator.clipboard.writeText(dashboard.group.inviteId);
      toast({
        title: "Copied Invite ID!",
        description: `Code: ${dashboard.group.inviteId} copied to clipboard.`
      });
    }
  };

  if (membersLoading || dashLoading || !members) {
    return (
      <MobilePage title="Group Members">
        <div className="flex-1 flex items-center justify-center h-[70vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobilePage>
    );
  }

  // Sort: Me first, then by deposited amount
  const sortedMembers = [...members].sort((a, b) => {
    if (a.isMe) return -1;
    if (b.isMe) return 1;
    return b.totalDeposited - a.totalDeposited;
  });

  return (
    <MobilePage title="Group Members">
      
      {/* Group Invite Card */}
      <div className="glass rounded-[2rem] p-6 mb-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Crown className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold font-display mb-1">{dashboard?.group.name}</h2>
        <p className="text-muted-foreground text-sm mb-6">
          {members.length} active members contributing
        </p>
        
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 bg-secondary/50 border border-border rounded-2xl py-3 px-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">ID</span>
            <span className="font-bold font-mono tracking-widest text-foreground">
              {dashboard?.group.inviteId}
            </span>
          </div>
          <Button variant="primary" className="px-4" onClick={handleInvite}>
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Leaderboard / Roster */}
      <h3 className="text-lg font-bold font-display mb-4 px-1">Leaderboard</h3>
      <div className="space-y-3">
        {sortedMembers.map((member, index) => (
          <div 
            key={member.id} 
            className={`glass-card p-4 rounded-2xl flex items-center justify-between transition-all ${
              member.isMe ? "border-primary/30 bg-primary/5" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                {index === 0 && !member.isMe && (
                  <div className="absolute -top-2 -right-2 text-yellow-500 bg-yellow-100 dark:bg-yellow-900/50 rounded-full p-1 shadow-sm">
                    <Crown className="w-3 h-3" />
                  </div>
                )}
              </div>
              
              <div>
                <p className="font-bold text-foreground flex items-center gap-2">
                  {member.name}
                  {member.isMe && (
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase font-bold">
                      You
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Joined recently
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-bold font-display text-lg text-foreground">
                Kes{member.totalDeposited.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Total
              </p>
            </div>
          </div>
        ))}
      </div>
      
    </MobilePage>
  );
}
