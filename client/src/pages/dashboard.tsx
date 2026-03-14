import React from "react";
import { MobilePage } from "@/components/layout/MobilePage";
import { ProgressCircle } from "@/components/dashboard/ProgressCircle";
import { StatCards } from "@/components/dashboard/StatCards";
import { TransactionFeed } from "@/components/dashboard/TransactionFeed";
import { DepositDrawer } from "@/components/dashboard/DepositDrawer";
import { useDashboard } from "@/hooks/use-savings";
import { Loader2, Target, Plus } from "lucide-react";
import { PlanSettingsDrawer } from "@/components/dashboard/PlanSettingsDrawer";
import { Button } from "@/components/shared/Button";

function CreatePlanCTA({ groupId, currentTitle }: { groupId: string, currentTitle?: string }) {
  return (
    <div className="glass rounded-[2rem] p-6 md:p-8 relative overflow-hidden text-center mb-8">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Target className="w-8 h-8 text-primary" />
      </div>
      <div className="space-y-1">
        <h2 className="text-2xl font-bold font-display">Create a Savings Plan</h2>
        <p className="text-muted-foreground max-w-xs mx-auto">
          Set a goal title, target amount, and timeline to start saving.
        </p>
      </div>
      <PlanSettingsDrawer groupId={groupId} currentTitle={currentTitle}>
        <Button className="mt-6 h-11 rounded-md px-8">
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
      </PlanSettingsDrawer>
    </div>
  );
}

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
      
      {/* This section allows creating a savings plan. */}
      <CreatePlanCTA groupId={String(group.id)} currentTitle={group.name} />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Left Column: Stats and Progress */}
        <div className="md:col-span-7 space-y-6 md:space-y-8">
          {/* Scrollable Stats */}
          <div className="-mt-2">
            <StatCards 
              myTotal={myTotal} 
              groupTotal={group.currentAmount} 
              target={group.targetAmount} 
            />
          </div>

          {/* Main Progress Indicator */}
          <div className="glass rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none" />
            
            <h2 className="text-center font-bold font-display text-lg md:text-xl mb-4 relative z-10">Monthly Goal</h2>
            <ProgressCircle 
              current={group.currentAmount} 
              target={group.targetAmount} 
              daysLeft={group.daysLeft} 
            />
          </div>
        </div>

        {/* Right Column: Transactions */}
        <div className="md:col-span-5">
          <TransactionFeed transactions={recentTransactions} />
        </div>
      </div>

      {/* Floating Action Button / Bottom Sheet Trigger */}
      <DepositDrawer groupId={group.id} />
      
    </MobilePage>
  );
}
