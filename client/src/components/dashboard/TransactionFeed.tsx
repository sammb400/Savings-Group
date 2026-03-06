import React from "react";
import { type Transaction } from "@shared/schema";
import { Receipt, Calendar, Clock } from "lucide-react";

interface TransactionFeedProps {
  transactions: Transaction[];
}

export function TransactionFeed({ transactions }: TransactionFeedProps) {
  
  const getIcon = (type: string) => {
    if (type === "Daily") return <Clock className="w-4 h-4" />;
    if (type === "Weekly") return <Calendar className="w-4 h-4" />;
    return <Receipt className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold font-display">Recent Deposits</h3>
        <button className="text-sm font-medium text-primary hover:underline tap-target px-2 py-1 -mr-2">
          View All
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {transactions.map((tx) => (
          <div 
            key={tx.id} 
            className="glass-card p-4 rounded-2xl flex items-center justify-between transition-transform active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {getIcon(tx.depositType)}
              </div>
              <div>
                <p className="font-bold text-foreground">{tx.memberName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">
                    {tx.depositType}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                    {tx.proofText}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-bold font-display text-emerald-600 dark:text-emerald-400">
                +${tx.amount}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(tx.date || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
