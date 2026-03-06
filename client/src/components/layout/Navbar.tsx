import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Users, Settings } from "lucide-react";
import { clsx } from "clsx";

export function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/members", icon: Users, label: "Members" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
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
                  
                  {/* Active Indicator */}
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
  );
}
