import React, { useState } from "react";
import { Drawer } from "vaul";
import { Plus, UploadCloud, X } from "lucide-react";
import { Input } from "../shared/Input";
import { Button } from "../shared/Button";
import { useAddTransaction } from "@/hooks/use-savings";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface DepositDrawerProps {
  groupId: number;
}

export function DepositDrawer({ groupId }: DepositDrawerProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");
  const [proof, setProof] = useState("");
  
  const isMobile = useIsMobile();
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

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold ml-1 text-muted-foreground uppercase tracking-widest">Amount</label>
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
        <label className="text-xs font-bold ml-1 text-muted-foreground uppercase tracking-widest">Frequency</label>
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl border border-border/50">
          {["Daily", "Weekly", "Monthly"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t as any)}
              className={`flex-1 min-h-[44px] rounded-xl text-sm font-bold transition-all ${
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
        <label className="text-xs font-bold ml-1 text-muted-foreground uppercase tracking-widest">Proof / Reference</label>
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

      <div className="pt-4">
        <Button 
          type="submit" 
          className="w-full py-6 text-lg rounded-2xl font-bold shadow-lg shadow-primary/20" 
          isLoading={isPending}
          disabled={!amount}
        >
          Confirm Deposit
        </Button>
      </div>
    </form>
  );

  const trigger = (
    <button 
      className="fixed bottom-24 md:bottom-8 right-6 md:right-8 z-40 w-14 h-14 md:w-16 md:h-16 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all md:hover:rotate-90"
      aria-label="Add Deposit"
      onClick={() => setOpen(true)}
    >
      <Plus className="w-6 h-6 md:w-7 md:h-7" strokeWidth={3} />
    </button>
  );

  if (!isMobile) {
    return (
      <>
        {trigger}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-8">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-3xl font-bold font-display">Make a Deposit</DialogTitle>
              <DialogDescription className="text-muted-foreground text-base">
                Add funds to your group's target goal.
              </DialogDescription>
            </DialogHeader>
            {formContent}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        {trigger}
      </Drawer.Trigger>
      
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-background flex flex-col rounded-t-[2.5rem] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto shadow-2xl border-t border-border">
          <div className="p-4 bg-background rounded-t-[2.5rem] flex-1 overflow-y-auto hide-scrollbar">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
            
            <div className="px-4">
              <div className="flex items-center justify-between mb-1">
                <Drawer.Title className="text-2xl font-bold font-display">Make a Deposit</Drawer.Title>
                <Drawer.Close asChild>
                  <button className="p-2 rounded-full hover:bg-secondary transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </Drawer.Close>
              </div>
              <Drawer.Description className="text-muted-foreground mb-6">
                Add funds to your group's target goal.
              </Drawer.Description>
              {formContent}
              <div className="h-8" />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
