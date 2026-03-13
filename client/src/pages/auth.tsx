import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowRight, Mail, Lock, Key, Users, Target } from "lucide-react";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { SiGoogle } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { useDatabase } from "@/lib/DatabaseContext";
import { FirebaseError } from "firebase/app";

export default function AuthPage() {
  const { toast } = useToast();
  const { login, signup, googleLogin, logout } = useAuth();
  const { doesGroupExist, createGroupAndUser, joinGroupAndCreateUser, getUserDocument } = useDatabase();

  const [activeTab, setActiveTab] = useState<"login" | "join" | "create">("login");

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [initialTarget, setInitialTarget] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthError = (error: any, action: "Login" | "Signup") => {
    let description = "An unknown error occurred. Please try again.";
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          description = "Invalid email or password. Please try again.";
          break;
        case 'auth/email-already-in-use':
          description = `This email is already in use. Try logging in.`;
          break;
        case 'auth/weak-password':
          description = "The password is too weak. Please use at least 6 characters.";
          break;
        default:
          description = error.message;
      }
    }
    toast({ title: `${action} Failed`, description, variant: "destructive" });
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const userCredential = await googleLogin();
      const user = userCredential.user;

      // Check if user document already exists in Firestore. If so, they are a returning user.
      const userDoc = await getUserDocument(user.uid);
      if (userDoc) {
        // Returning user, AuthProvider will handle the redirect.
        setIsLoading(false);
        return;
      }

      // New user for our app.
      if (activeTab === 'login') {
        // New user trying to log in via Google. This is an invalid action.
        // They must either create or join a group. We sign them out of Firebase
        // auth to prevent a weird state where they are auth'd but have no user doc.
        await logout();
        toast({
          title: "New User",
          description: "This Google account is not associated with any group. Please use the 'Join Group' or 'Create Group' tab.",
          variant: "destructive"
        });
        return;
      }

      // This is a new user for our app. Proceed with group creation or joining.
      if (activeTab === 'create') {
        if (!groupName || !inviteCode) {
          toast({ title: "Missing Fields", description: "Group Name and Invitation Code are required to create a group.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        const groupExists = await doesGroupExist(inviteCode);
        if (groupExists) {
          toast({ title: "Invitation Code Taken", description: "This invitation code is already in use. Please choose another.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        await createGroupAndUser(user, groupName, inviteCode, Number(initialTarget));
      } else { // Join group
        if (!inviteCode) {
          toast({ title: "Invitation Code Required", description: "Please enter an invitation code to join a group.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        const groupExists = await doesGroupExist(inviteCode);
        if (!groupExists) {
          toast({ title: "Invalid Code", description: "No group found with this invitation code.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        await joinGroupAndCreateUser(user, inviteCode);
      }
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        handleAuthError(error, "Login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (activeTab === 'login') {
      try {
        await login(email, password);
        // AuthProvider handles redirect
      } catch (error: any) {
        handleAuthError(error, "Login");
      }
    } else if (activeTab === 'create') {
      if (!groupName || !inviteCode) {
        toast({ title: "Missing Fields", description: "Group Name and Invitation Code are required.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      try {
        const groupExists = await doesGroupExist(inviteCode);
        if (groupExists) {
          toast({ title: "Invitation Code Taken", description: "This invitation code is already in use. Please choose another.", variant: "destructive" });
          return;
        }
        const userCredential = await signup(email, password);
        await createGroupAndUser(userCredential.user, groupName, inviteCode, Number(initialTarget));
      } catch (error: any) {
        handleAuthError(error, "Signup");
      }
    } else { // 'join'
      if (!inviteCode) {
        toast({ title: "Invitation Code Required", description: "Please enter an invitation code to join.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      // Try to sign up first. If email is in use, then try to log in.
      try {
        const groupExists = await doesGroupExist(inviteCode);
        if (!groupExists) {
          toast({ title: "Invalid Code", description: "No group found with this invitation code.", variant: "destructive" });
          return;
        }
        const userCredential = await signup(email, password);
        await joinGroupAndCreateUser(userCredential.user, inviteCode);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          // Email already exists, tell them to go to the login tab.
          toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please go to the 'Log In' tab.",
            variant: "destructive"
          });
        } else {
          handleAuthError(error, "Signup");
        }
      }
    }
    setIsLoading(false);
  };

  // Separate render functions for clarity
  const CreateGroupFields = () => (
    <>
      <div className="space-y-1.5">
        <label className="text-xs font-bold ml-1 text-muted-foreground uppercase tracking-wider">Group Name</label>
        <Input
          placeholder="e.g. Holiday Fund"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          icon={<Users className="w-5 h-5" />}
          required
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold ml-1 text-muted-foreground uppercase tracking-wider">Create Invitation Code</label>
        <Input
          placeholder="e.g. MWC2025"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          icon={<Key className="w-5 h-5" />}
          required
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold ml-1 text-muted-foreground uppercase tracking-wider">Initial Target (Optional)</label>
        <Input
          type="number"
          placeholder="e.g. 5000"
          value={initialTarget}
          onChange={(e) => setInitialTarget(e.target.value)}
          icon={<Target className="w-5 h-5" />}
        />
      </div>
    </>
  );

  const JoinGroupFields = () => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold ml-1 text-muted-foreground uppercase tracking-wider">
        Invitation Code
      </label>
      <Input
        placeholder="Enter group code"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        icon={<Key className="w-5 h-5" />}
        required
      />
    </div>
  );

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
                activeTab === "login" 
                  ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("login")}
            >
              Log In
            </button>
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
              
              {activeTab === 'create' ? CreateGroupFields() : activeTab === 'join' ? JoinGroupFields() : null}

            </div>

            <Button type="submit" className="w-full min-h-[52px] mt-2" isLoading={isLoading}>
              {activeTab === 'login' ? 'Log In' : activeTab === 'join' ? 'Join Savings Group' : 'Create New Group'} <ArrowRight className="w-4 h-4 ml-1" />
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
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full min-h-[52px] flex items-center justify-center gap-3 bg-white dark:bg-zinc-900 border border-border/80 rounded-2xl font-bold text-foreground hover:bg-secondary/30 transition-all active:scale-[0.98] disabled:opacity-50"
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
