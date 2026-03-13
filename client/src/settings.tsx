import React from "react";
import { MobilePage } from "@/components/layout/MobilePage";
import { Bell, Shield, LogOut, Moon, HelpCircle, ChevronRight, User } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function Settings() {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const menuGroups = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Profile Details", action: () => {} },
        { icon: Shield, label: "Security & Privacy", action: () => {} },
      ]
    },
    {
      title: "Preferences",
      items: [
        { icon: Bell, label: "Notifications", action: () => {} },
        { icon: Moon, label: "Appearance", action: () => {} },
      ]
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", action: () => {} },
      ]
    }
  ];

  return (
    <MobilePage title="Settings">
      
      {/* Profile Header */}
      <div className="glass rounded-[2rem] p-6 mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <span className="text-xl font-display font-bold text-primary-foreground">{currentUser?.email?.[0].toUpperCase()}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">{currentUser?.displayName || "User"}</h2>
          <p className="text-muted-foreground text-sm font-medium">{currentUser?.email}</p>
        </div>
      </div>

      {/* Menu Groups */}
      <div className="space-y-6 mb-12">
        {menuGroups.map((group, i) => (
          <div key={i} className="space-y-2">
            <h3 className="text-sm font-bold text-muted-foreground ml-4 uppercase tracking-wider">
              {group.title}
            </h3>
            <div className="glass-card rounded-3xl overflow-hidden">
              {group.items.map((item, j) => {
                const Icon = item.icon;
                return (
                  <button
                    key={j}
                    onClick={item.action}
                    className={`w-full flex items-center justify-between p-4 tap-target transition-colors hover:bg-white/40 dark:hover:bg-zinc-800/40 active:bg-black/5 ${
                      j !== group.items.length - 1 ? "border-b border-border/50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-foreground/80" />
                      </div>
                      <span className="font-semibold text-foreground">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-4 tap-target rounded-2xl text-destructive font-bold bg-destructive/10 hover:bg-destructive/20 active:scale-[0.98] transition-all"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </button>

      <p className="text-center text-xs text-muted-foreground mt-8 mb-4">
        GroupSave v1.0.0
      </p>

    </MobilePage>
  );
}
