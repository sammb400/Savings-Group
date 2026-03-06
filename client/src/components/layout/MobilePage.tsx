import React from "react";
import { Navbar } from "./Navbar";
import { motion } from "framer-motion";

interface MobilePageProps {
  children: React.ReactNode;
  showNav?: boolean;
  className?: string;
  title?: string;
}

export function MobilePage({ children, showNav = true, className = "", title }: MobilePageProps) {
  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto relative flex flex-col shadow-2xl bg-transparent sm:border-x sm:border-border overflow-hidden">
      
      {title && (
        <header className="sticky top-0 z-30 px-6 pt-12 pb-4 bg-background/60 backdrop-blur-xl border-b border-border/40">
          <h1 className="text-2xl font-bold font-display tracking-tight">{title}</h1>
        </header>
      )}

      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`flex-1 w-full px-4 pt-6 pb-32 ${className}`}
      >
        {children}
      </motion.main>
      
      {showNav && <Navbar />}
    </div>
  );
}
