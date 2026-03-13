import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type DashboardData, type Member, type Transaction, type InsertTransaction } from "@shared/schema";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

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
  const { currentUser } = useAuth();

  return useQuery<DashboardData>({
    queryKey: ["/api/dashboard", currentUser?.uid],
    queryFn: async () => {
      // 1. Try fetching real data if user is logged in
      if (currentUser) {
        try {
          // A. Get User to find Group ID
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const groupId = userData.groupId;

            if (groupId) {
              // B. Get Group Data
              const groupSnap = await getDoc(doc(db, "groups", groupId));
              const groupData = groupSnap.data();

              // C. Get Transactions
              const txQuery = query(
                collection(db, "transactions"),
                where("groupId", "==", groupId),
                // orderBy("createdAt", "desc") // Removed to avoid missing index error on new deployments
              );
              
              const txSnap = await getDocs(txQuery);

              let groupTotal = 0;
              let myTotal = 0;
              const transactions: Transaction[] = [];

              txSnap.forEach((doc) => {
                const t = doc.data();
                const amount = Number(t.amount) || 0;
                groupTotal += amount;
                if (t.userId === currentUser.uid) myTotal += amount;
                
                transactions.push({
                  id: doc.id as any,
                  groupId: groupId as any,
                  memberName: t.userName || "Member",
                  amount: amount,
                  depositType: t.depositType || "Online",
                  proofText: "App",
                  date: t.createdAt?.toDate() || new Date(),
                });
              });

              // Sort in memory to avoid Firestore index requirement
              transactions.sort((a, b) => {
                const dateA = a.date ? new Date(a.date) : new Date(0);
                const dateB = b.date ? new Date(b.date) : new Date(0);
                return dateB.getTime() - dateA.getTime();
              });

              if (groupSnap.exists() && groupData) {
                return {
                  group: {
                    id: groupId as any,
                    name: groupData.name || "Savings Group",
                    inviteId: groupId,
                    targetAmount: Number(groupData.targetAmount) || 0,
                    currentAmount: groupTotal,
                    daysLeft: 30, // Placeholder or calculated logic
                  },
                  myTotal,
                  recentTransactions: transactions
                };
              }
            }
          }
        } catch (error) {
          console.warn("Error fetching real dashboard data, falling back to mock:", error);
        }
      }

      // 2. Fallback: Mock Data (if not logged in or error)
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

interface UIMutationPayload {
  groupId: string | number;
  amount: number;
  depositType: "Daily" | "Weekly" | "Monthly";
  proofText: string;
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  
  return useMutation({
    mutationFn: async (data: UIMutationPayload) => {
      if (!currentUser) throw new Error("User must be logged in");
      
      // Prepare transaction object for Firestore
      const newTxData = {
        amount: Number(data.amount),
        depositType: data.depositType || "Online",
        proofText: data.proofText || "App",
        userId: currentUser.uid,
        userName: currentUser.displayName || "Member",
        groupId: String(data.groupId), // Ensure groupId is always a string for Firestore
        createdAt: serverTimestamp(),
        type: 'deposit'
      };
      
      // Save to Firestore
      const docRef = await addDoc(collection(db, "transactions"), newTxData);
      return { id: docRef.id, ...newTxData };
    },
    onSuccess: () => {
      // Refresh the dashboard data immediately
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });
}
