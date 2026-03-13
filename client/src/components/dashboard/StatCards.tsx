import React from "react";

interface StatCardsProps {
  myTotal: number;
  groupTotal: number;
  target: number;
}

export function StatCards({ myTotal, groupTotal, target }: StatCardsProps) {
  const cards = [
    {
      title: "My Total",
      amount: myTotal,
      highlight: true,
    },
    {
      title: "Group Target",
      amount: target,
      highlight: false,
    },
    {
      title: "Remaining",
      amount: Math.max(target - groupTotal, 0),
      highlight: false,
    }
  ];

  return (
    <div className="flex overflow-x-auto gap-4 pb-6 pt-2 snap-x px-1 -mx-1 hide-scrollbar">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className={`min-w-[140px] flex-shrink-0 snap-start rounded-3xl p-5 ${
            card.highlight 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
              : "glass-card text-foreground"
          }`}
        >
          <p className={`text-sm font-medium mb-2 ${card.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
            {card.title}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold opacity-80">Kes</span>
            <span className="text-2xl font-extrabold font-display">
              {card.amount.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
