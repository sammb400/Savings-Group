import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Wallet, ArrowRight, UserPlus, Mail, Lock, Key } from "lucide-react";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { SiGoogle } from "react-icons/si";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"join" | "create">("join");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-[100dvh] w-full relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-50 to-background dark:from-emerald-950/20 dark:to-background p-4 md:p-8">
      
      {/* Background decoration for desktop */}
      <div className="hidden md:block absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="hidden md:block absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Logo Section */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-20 h-20 md:w-24 md:h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 relative"
        >
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <Wallet className="w-10 h-10 md:w-12 md:h-12 text-primary relative z-10" />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-foreground mb-2"
        >
          GroupSave
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground text-center text-sm md:text-base mb-8 max-w-[280px]"
        >
          Reach your savings goals together, faster and easier.
        </motion.p>

        {/* Auth Card */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.3 }}
          className="bg-card w-full rounded-[2.5rem] shadow-xl md:shadow-2xl border border-border/60 p-6 md:p-8 z-20 overflow-hidden relative"
        >
          <div className="flex bg-secondary/50 p-1 rounded-2xl mb-6">
            <button 
              className={`flex-1 min-h-[44px] rounded-xl font-bold text-sm transition-all ${
                activeTab === "join" 
                  ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("join")}
            >
              Join Group
            </button>
            <button 
              className={`flex-1 min-h-[44px] rounded-xl font-bold text-sm transition-all ${
                activeTab === "create" 
                  ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("create")}
            >
              Create Group
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold ml-1 text-muted-foreground uppercase tracking-wider">Email Address</label>
                <Input 
                  type="email"
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-5 h-5" />}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold ml-1 text-muted-foreground uppercase tracking-wider">Password</label>
                <Input 
                  type="password"
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-5 h-5" />}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold ml-1 text-muted-foreground uppercase tracking-wider">
                  {activeTab === "join" ? "Invitation Code" : "Initial Target"}
                </label>
                <Input 
                  placeholder={activeTab === "join" ? "e.g. MIA2024" : "e.g. 5000"} 
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  icon={activeTab === "join" ? <Key className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full min-h-[52px] mt-2" isLoading={isLoading}>
              {activeTab === "join" ? "Join Savings Group" : "Create New Group"} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-bold tracking-widest">Or continue with</span>
              </div>
            </div>

            <button 
              type="button"
              className="w-full min-h-[52px] flex items-center justify-center gap-3 bg-white dark:bg-zinc-900 border border-border/80 rounded-2xl font-bold text-foreground hover:bg-secondary/30 transition-all active:scale-[0.98]"
            >
              <SiGoogle className="w-5 h-5" />
              Sign in with Google
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
