import React, { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { Settings, Calendar as CalendarIcon, Target, Type } from "lucide-react";
import { Input } from "../shared/Input";
import { Button } from "../shared/Button";
import { useSavePlan } from "@/hooks/use-savings";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlanSettingsDrawerProps {
  children?: React.ReactNode;
  groupId: string;
  currentTitle?: string;
  currentTarget?: number;
  currentTargetDate?: Date | null;
}

// Helper to format a Date object into a 'YYYY-MM-DD' string for date inputs
const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return "";
    // Using getFullYear, getMonth, and getDate ensures we use the local date parts,
    // avoiding timezone conversion issues that can arise with toISOString().
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export function PlanSettingsDrawer({ children, groupId, currentTitle, currentTarget, currentTargetDate }: PlanSettingsDrawerProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(currentTitle || "");
  const [targetAmount, setTargetAmount] = useState(currentTarget?.toString() || "");
  const [date, setDate] = useState("");

  const isMobile = useIsMobile();
  const { mutate: savePlan, isPending } = useSavePlan();
  const { toast } = useToast();

  // When the drawer opens, sync the state with the current props
  useEffect(() => {
    if (open) {
      setTitle(currentTitle || "");
      setTargetAmount(currentTarget?.toString() || "");
      setDate(formatDateForInput(currentTargetDate));
    }
  }, [open, currentTitle, currentTarget, currentTargetDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount || !date) {
        toast({ title: "All fields are required", variant: "destructive" });
        return;
    }

    // The date string from the input is 'YYYY-MM-DD'. new Date() will parse this
    // as UTC midnight, which can cause off-by-one day errors depending on the user's timezone.
    // To ensure we get the date the user *intended*, we can split it and construct it locally.
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);

    savePlan(
      {
        groupId,
        goalTitle: title,
        targetAmount: Number(targetAmount),
        targetDate: targetDate,
      },
      {
        onSuccess: () => {
          setOpen(false);
          toast({
            title: "Plan Updated",
            description: "Your savings goal has been updated.",
          });
        },
        onError: (error) => {
            toast({
                title: "Update Failed",
                description: error.message || "Could not update the plan.",
                variant: "destructive",
            });
        }
      }
    );
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold ml-1 text-muted-foreground uppercase tracking-widest">Goal Title</label>
        <Input
          placeholder="e.g. Dream Vacation"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          icon={<Type className="w-5 h-5" />}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold ml-1 text-muted-foreground uppercase tracking-widest">Target Amount</label>
        <Input
          type="number"
          prefix="Kes"
          placeholder="0.00"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          icon={<Target className="w-5 h-5" />}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold ml-1 text-muted-foreground uppercase tracking-widest">Target Date</label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          icon={<CalendarIcon className="w-5 h-5" />}
          required
        />
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full py-6 text-lg rounded-2xl font-bold"
          isLoading={isPending}
        >
          Save Plan
        </Button>
      </div>
    </form>
  );

  const trigger = (
    <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors" aria-label="Plan Settings">
      <Settings className="w-5 h-5 text-muted-foreground" />
    </button>
  );

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children || trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold font-display">Plan Settings</DialogTitle>
            <DialogDescription>
              Customize your savings goal and timeline.
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>{children || trigger}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-background flex flex-col rounded-t-[2.5rem] mt-24 fixed bottom-0 left-0 right-0 z-50 h-[80vh] max-w-md mx-auto shadow-2xl border-t border-border">
          <div className="p-4 bg-background rounded-t-[2.5rem] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
            <div className="px-4">
              <div className="mb-6">
                <Drawer.Title className="text-2xl font-bold font-display">Plan Settings</Drawer.Title>
                <Drawer.Description className="text-muted-foreground">
                  Customize your savings goal and timeline.
                </Drawer.Description>
              </div>
              {formContent}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}