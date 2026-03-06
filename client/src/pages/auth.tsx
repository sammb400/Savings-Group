import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Wallet, ArrowRight, UserPlus } from "lucide-react";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"join" | "create">("join");
  const [groupId, setGroupId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto relative flex flex-col sm:border-x sm:border-border overflow-hidden bg-gradient-to-b from-emerald-50 to-background dark:from-emerald-950/20 dark:to-background">
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-12">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 relative"
        >
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <Wallet className="w-12 h-12 text-primary relative z-10" />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl font-extrabold font-display tracking-tight text-foreground mb-3"
        >
          GroupSave
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground text-lg mb-12 max-w-[280px]"
        >
          Reach your savings goals together, faster and easier.
        </motion.p>
      </div>

      {/* Auth Card */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.3 }}
        className="bg-card w-full rounded-t-[2.5rem] shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.1)] border-t border-border p-6 pt-8 pb-12 z-20"
      >
        <div className="flex bg-secondary/50 p-1 rounded-2xl mb-8">
          <button 
            className={`flex-1 tap-target rounded-xl font-semibold text-sm transition-all ${
              activeTab === "join" 
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm" 
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("join")}
          >
            Join Group
          </button>
          <button 
            className={`flex-1 tap-target rounded-xl font-semibold text-sm transition-all ${
              activeTab === "create" 
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm" 
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("create")}
          >
            Create Group
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === "join" ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1 text-foreground">Invite ID</label>
                <Input 
                  placeholder="e.g. MIA2024" 
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  icon={<UserPlus className="w-5 h-5" />}
                  required
                />
              </div>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Join Group <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1 text-foreground">Group Name</label>
                <Input placeholder="e.g. Summer Vacation" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1 text-foreground">Target Amount</label>
                <Input placeholder="0.00" type="number" prefix="$" required />
              </div>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Create & Invite <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
