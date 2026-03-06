import React from "react";
import { MobilePage } from "@/components/layout/MobilePage";
import { ProgressCircle } from "@/components/dashboard/ProgressCircle";
import { StatCards } from "@/components/dashboard/StatCards";
import { TransactionFeed } from "@/components/dashboard/TransactionFeed";
import { DepositDrawer } from "@/components/dashboard/DepositDrawer";
import { useDashboard } from "@/hooks/use-savings";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return (
      <MobilePage showNav={true}>
        <div className="flex-1 flex items-center justify-center h-[70vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobilePage>
    );
  }

  const { group, myTotal, recentTransactions } = data;

  return (
    <MobilePage showNav={true} title={group.name}>
      
      {/* Scrollable Stats */}
      <div className="-mt-2 mb-4">
        <StatCards 
          myTotal={myTotal} 
          groupTotal={group.currentAmount} 
          target={group.targetAmount} 
        />
      </div>

      {/* Main Progress Indicator */}
      <div className="glass rounded-[2rem] p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none" />
        
        <h2 className="text-center font-bold font-display text-lg mb-2 relative z-10">Monthly Goal</h2>
        <ProgressCircle 
          current={group.currentAmount} 
          target={group.targetAmount} 
          daysLeft={group.daysLeft} 
        />
      </div>

      {/* Feed */}
      <TransactionFeed transactions={recentTransactions} />

      {/* Floating Action Button / Bottom Sheet Trigger */}
      <DepositDrawer groupId={group.id} />
      
    </MobilePage>
  );
}
