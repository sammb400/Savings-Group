import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Home, Users, Settings } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useDatabase } from "@/lib/DatabaseContext";
import { clsx } from "clsx";

const navItems = [

  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/members", icon: Users, label: "Members" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function Navbar() {
  const [location] = useLocation();
  const { currentUser } = useAuth();
  const { getUserDocument } = useDatabase();
  const [displayName, setDisplayName] = useState<string | null>(currentUser?.displayName || null);

  useEffect(() => {
    async function fetchUserData() {
      if (currentUser?.uid) {
        const data = await getUserDocument(currentUser.uid);
        if (data?.displayName) {
          setDisplayName(data.displayName);
        }
      }
    }
    fetchUserData();
  }, [currentUser, getUserDocument]);


  return (
    <>
      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe md:hidden">
        <div className="mx-4 mb-4">
          <nav className="glass rounded-3xl p-2 flex items-center justify-around tap-target">
            {navItems.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} href={item.path} className="flex-1">
                  <div 
                    className={clsx(
                      "flex flex-col items-center justify-center gap-1 py-2 tap-target rounded-2xl transition-all duration-300",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon 
                      className={clsx(
                        "w-6 h-6 transition-transform duration-300",
                        isActive ? "scale-110 drop-shadow-md" : "scale-100"
                      )} 
                      strokeWidth={isActive ? 2.5 : 2} 
                    />
                    <span className="text-[10px] font-medium font-display">{item.label}</span>
                    
                    {isActive && (
                      <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 glass border-r border-border/40 z-40 flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Home className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold font-display tracking-tight text-foreground">GroupSave</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.path} href={item.path}>
                <div 
                  className={clsx(
                    "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer min-h-[48px]",
                    isActive 
                      ? "bg-primary/10 text-primary shadow-sm shadow-primary/5" 
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <Icon className={clsx("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                  <span className="font-semibold text-sm">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 bg-secondary/30 rounded-2xl border border-border/50">
          <p className="text-xs text-muted-foreground font-medium mb-1">Signed in as</p>
          <p className="text-sm font-bold text-foreground truncate">
            {displayName ? displayName.split(" ")[0] : "User"}
          </p>
        </div>
      </aside>
    </>
  );
}
