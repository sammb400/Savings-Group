import React, { useState } from "react";
import { Drawer } from "vaul";
import { Plus, UploadCloud } from "lucide-react";
import { Input } from "../shared/Input";
import { Button } from "../shared/Button";
import { useAddTransaction } from "@/hooks/use-savings";
import { useToast } from "@/hooks/use-toast";

interface DepositDrawerProps {
  groupId: number;
}

export function DepositDrawer({ groupId }: DepositDrawerProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");
  const [proof, setProof] = useState("");
  
  const { mutate: addTx, isPending } = useAddTransaction();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    addTx(
      { 
        groupId, 
        amount: Number(amount), 
        depositType: type, 
        proofText: proof || "Manual Entry" 
      },
      {
        onSuccess: () => {
          setOpen(false);
          setAmount("");
          setProof("");
          toast({
            title: "Deposit Successful",
            description: `$${amount} added to the group fund.`,
          });
        }
      }
    );
  };

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button 
          className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          aria-label="Add Deposit"
        >
          <Plus className="w-6 h-6" strokeWidth={3} />
        </button>
      </Drawer.Trigger>
      
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-background flex flex-col rounded-t-[2.5rem] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto shadow-2xl border-t border-border">
          <div className="p-4 bg-background rounded-t-[2.5rem] flex-1 overflow-y-auto hide-scrollbar">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
            
            <div className="px-4">
              <Drawer.Title className="text-2xl font-bold font-display mb-1">Make a Deposit</Drawer.Title>
              <Drawer.Description className="text-muted-foreground mb-6">
                Add funds to your group's target goal.
              </Drawer.Description>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1 text-foreground">Amount</label>
                  <Input 
                    type="number"
                    prefix="$"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="text-2xl font-bold py-6 font-display"
                  />
                </div>

                {/* Type Toggle Chips */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1 text-foreground">Frequency</label>
                  <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl border border-border/50">
                    {["Daily", "Weekly", "Monthly"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t as any)}
                        className={`flex-1 tap-target rounded-xl text-sm font-semibold transition-all ${
                          type === t 
                            ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Proof Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1 text-foreground">Proof / Reference</label>
                  <div className="relative">
                    <UploadCloud className="absolute left-4 top-4 text-muted-foreground w-5 h-5 pointer-events-none" />
                    <textarea
                      value={proof}
                      onChange={(e) => setProof(e.target.value)}
                      placeholder="e.g. Venmo #1234 or transaction note"
                      className="w-full min-h-[100px] pl-11 pr-4 py-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-white/40 dark:border-zinc-800 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 backdrop-blur-md resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 pb-8">
                  <Button 
                    type="submit" 
                    className="w-full py-4 text-lg rounded-2xl" 
                    isLoading={isPending}
                    disabled={!amount}
                  >
                    Confirm Deposit
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
