import React from "react";
import { type Transaction } from "@shared/schema";
import { Receipt, Calendar, Clock, ArrowUpRight } from "lucide-react";

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
        <button className="text-sm font-bold text-primary hover:underline tap-target px-2 py-1 -mr-2 flex items-center gap-1">
          View All <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Mobile: Simple List Cards */}
      <div className="flex flex-col gap-3 md:hidden">
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
                  <span className="text-xs font-bold bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">
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
                +Kes{tx.amount}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                {new Date(tx.date || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Proper Table View */}
      <div className="hidden md:block glass rounded-2xl overflow-hidden border border-border/40">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-secondary/30 border-b border-border/40">
              <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">Member</th>
              <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">Type</th>
              <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">Proof</th>
              <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {getIcon(tx.depositType)}
                    </div>
                    <span className="font-bold text-sm text-foreground">{tx.memberName}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-[10px] font-bold bg-secondary text-secondary-foreground px-2 py-1 rounded-md uppercase tracking-wider">
                    {tx.depositType}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-xs text-muted-foreground line-clamp-1 max-w-[120px]">
                    {tx.proofText}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <p className="font-bold font-display text-emerald-600 dark:text-emerald-400 text-sm">
                    +Kes{tx.amount}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {new Date(tx.date || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
