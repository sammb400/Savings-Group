import React from "react";
import { motion } from "framer-motion";

interface ProgressCircleProps {
  current: number;
  target: number;
  daysLeft: number;
}

export function ProgressCircle({ current, target, daysLeft }: ProgressCircleProps) {
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
  
  const radius = 110;
  const strokeWidth = 24;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center my-8">
      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full scale-75 pointer-events-none" />
      
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 drop-shadow-xl"
      >
        {/* Track */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-primary/10 dark:text-primary/5"
          strokeLinecap="round"
        />
        {/* Progress */}
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + " " + circumference}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-primary"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 4px 6px rgba(16,185,129,0.3))" }}
        />
      </svg>
      
      {/* Inner Content */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
          {daysLeft} Days Left
        </span>
        <div className="flex items-start">
          <span className="text-2xl font-bold text-foreground mt-1">Kes</span>
          <span className="text-5xl font-extrabold font-display tracking-tight text-foreground">
            {current.toLocaleString()}
          </span>
        </div>
        <span className="text-sm font-medium text-primary mt-1 bg-primary/10 px-3 py-1 rounded-full">
          {percentage}% Funded
        </span>
      </div>
    </div>
  );
}
