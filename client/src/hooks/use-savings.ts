import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type DashboardData, type Member, type Transaction, type InsertTransaction } from "@shared/schema";

// --- MOCK DATA ---
const MOCK_GROUP = {
  id: 1,
  name: "Miami Trip Fund",
  inviteId: "MIA2024",
  targetAmount: 5000,
  currentAmount: 3250,
  daysLeft: 14,
};

const MOCK_MEMBERS: Member[] = [
  { id: 1, groupId: 1, name: "Sarah (Me)", totalDeposited: 1200, avatarUrl: null, isMe: true },
  { id: 2, groupId: 1, name: "Alex P.", totalDeposited: 1050, avatarUrl: null, isMe: false },
  { id: 3, groupId: 1, name: "Jordan M.", totalDeposited: 1000, avatarUrl: null, isMe: false },
];

let MOCK_TRANSACTIONS: Transaction[] = [
  { id: 101, groupId: 1, memberName: "Alex P.", amount: 150, depositType: "Weekly", proofText: "Venmo #8821", date: new Date(Date.now() - 3600000) },
  { id: 102, groupId: 1, memberName: "Sarah (Me)", amount: 200, depositType: "Monthly", proofText: "CashApp Transfer", date: new Date(Date.now() - 86400000 * 2) },
  { id: 103, groupId: 1, memberName: "Jordan M.", amount: 100, depositType: "Daily", proofText: "Bank Zelle", date: new Date(Date.now() - 86400000 * 3) },
];

// --- HOOKS ---

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    queryFn: async () => {
      // Simulating network delay
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      const myTotal = MOCK_MEMBERS.find(m => m.isMe)?.totalDeposited || 0;
      
      return {
        group: MOCK_GROUP,
        myTotal,
        recentTransactions: [...MOCK_TRANSACTIONS].sort((a, b) => 
          new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
        ),
      };
    },
  });
}

export function useMembers() {
  return useQuery<Member[]>({
    queryKey: ["/api/members"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return MOCK_MEMBERS;
    },
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertTransaction) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const newTx: Transaction = {
        ...data,
        id: Math.floor(Math.random() * 10000),
        date: new Date(),
        // Infer member name for mock purposes
        memberName: "Sarah (Me)", 
      };
      
      MOCK_TRANSACTIONS = [newTx, ...MOCK_TRANSACTIONS];
      MOCK_GROUP.currentAmount += data.amount;
      
      const me = MOCK_MEMBERS.find(m => m.isMe);
      if (me) me.totalDeposited += data.amount;
      
      return newTx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
    },
  });
}
