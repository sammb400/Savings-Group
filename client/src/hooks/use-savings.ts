import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type DashboardData, type Member, type Transaction, type InsertTransaction } from "@shared/schema";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, Timestamp, documentId } from "firebase/firestore";

// --- MOCK DATA ---
// const DEPRECATED_MOCK_GROUP = {
//   id: 1,
//   name: "Miami Trip Fund",
//   inviteId: "MIA2024",
//   targetAmount: 0, // Set to 0 to show the "Create Plan" UI by default
//   currentAmount: 3250,
//   daysLeft: 14,
// };

// const DEPRECATED_MOCK_MEMBERS: Member[] = [
//   { id: 1, groupId: 1, name: "Sarah (Me)", totalDeposited: 1200, avatarUrl: null, isMe: true },
//   { id: 2, groupId: 1, name: "Alex P.", totalDeposited: 1050, avatarUrl: null, isMe: false },
//   { id: 3, groupId: 1, name: "Jordan M.", totalDeposited: 1000, avatarUrl: null, isMe: false },
// ];

// let DEPRECATED_MOCK_TRANSACTIONS: Transaction[] = [
//   { id: 101, groupId: 1, memberName: "Alex P.", amount: 150, depositType: "Weekly", proofText: "Venmo #8821", date: new Date(Date.now() - 3600000) },
//   { id: 102, groupId: 1, memberName: "Sarah (Me)", amount: 200, depositType: "Monthly", proofText: "CashApp Transfer", date: new Date(Date.now() - 86400000 * 2) },
//   { id: 103, groupId: 1, name: "Jordan M.", amount: 100, depositType: "Daily", proofText: "Bank Zelle", date: new Date(Date.now() - 86400000 * 3) },
// ];

// --- HOOKS ---

export function useDashboard() {
  const { currentUser } = useAuth();

  return useQuery<DashboardData | null>({
    queryKey: ["/api/dashboard", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) {
        return null;
      }

      // 1. Get User to find Group ID
      const userDocRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists() || !userSnap.data().groupId) {
        console.error("CRITICAL: User is logged in but has no user document or groupId.");
        return null; // This causes the spinner, as the app cannot proceed.
      }

      const groupId = userSnap.data().groupId;

      // 2. Fetch group and transaction data in parallel.
      const groupDocRef = doc(db, "groups", groupId);
      const txQuery = query(collection(db, "transactions"), where("groupId", "==", groupId));

      const [groupSnap, txSnap] = await Promise.all([
        getDoc(groupDocRef),
        getDocs(txQuery),
      ]).catch(err => {
        console.error("Error fetching group or transaction data:", err);
        return [null, null]; // Return nulls on failure to handle gracefully below.
      });

      // 3. Process the data, even if some parts are missing.
      const groupData = groupSnap?.data();
      const transactions: Transaction[] = [];
      let groupTotal = 0;
      let myTotal = 0;

      if (txSnap) {
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
        transactions.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      }

      // 4. Always build and return a valid dashboard object.
      let daysLeft = 0;
      if (groupData?.targetDate) {
        const now = new Date();
        const target = groupData.targetDate.toDate();
        const diff = target.getTime() - now.getTime();
        daysLeft = Math.ceil(diff / (1000 * 3600 * 24));
      }

      return {
        group: {
          id: groupId as any,
          name: groupData?.goalTitle || groupData?.name || "Savings Group",
          inviteId: groupId,
          targetAmount: Number(groupData?.targetAmount) || 0,
          currentAmount: groupTotal,
          daysLeft: daysLeft > 0 ? daysLeft : 0,
        },
        myTotal,
        recentTransactions: transactions
      };
    },
    enabled: !!currentUser,
  });
}

export function useMembers() {
  const { currentUser } = useAuth();
  return useQuery<Member[]>({ 
    queryKey: ["/api/members", currentUser?.uid], 
    queryFn: async () => {
      try {
        if (!currentUser) return [];

        // 1. Get current user's groupId
        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        //console.log("User snapshot:", userSnap.data()); // Your log from line 126
        if (!userSnap.exists() || !userSnap.data().groupId) return [];
        const groupId = userSnap.data().groupId;
        //console.log("Attempting to fetch members for groupId:", groupId);

        // 2. Get group document to find member IDs (bypassing list permissions on users)
        const groupDocRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupDocRef);
        //console.log("Group snapshot data:", groupSnap.data());
        if (!groupSnap.exists()) return [];
        const memberIds = (groupSnap.data().members as string[]) || [];
        //console.log("Extracted member IDs:", memberIds);

        // 3. Fetch user profiles individually
        const memberPromises = memberIds.map(uid => getDoc(doc(db, "users", uid)));
        const memberSnaps = await Promise.all(memberPromises);
        //console.log("Fetched individual member snapshots:", memberSnaps.map(s => s.data()));

        // This part can be optimized later, but for now, it fetches transactions to calculate totals.
        const txQuery = query(collection(db, "transactions"), where("groupId", "==", groupId));
        const txSnap = await getDocs(txQuery);
        //console.log("Fetched transaction snapshots:", txSnap.docs.length, "transactions found.");
        const memberTotals: { [userId: string]: number } = {};
        txSnap.forEach(txDoc => {
          const tx = txDoc.data();
          const amount = Number(tx.amount) || 0;
          if (tx.userId) {
            memberTotals[tx.userId] = (memberTotals[tx.userId] || 0) + amount;
          }
        });
        //console.log("Calculated member totals:", memberTotals);

        // Map the user documents to the Member[] type
        const members: Member[] = [];
        memberSnaps.forEach(snap => {
          if (snap.exists()) {
            const userData = snap.data();
            members.push({
              id: snap.id as any,
              groupId: groupId as any,
              name: userData.displayName || "Member",
              totalDeposited: memberTotals[snap.id] || 0,
              avatarUrl: userData.photoURL || null,
              isMe: snap.id === currentUser.uid,
            });
          }
        });

        const sortedMembers = members.sort((a, b) => b.totalDeposited - a.totalDeposited);
        //console.log("Processed members data:", sortedMembers);
        return sortedMembers;
      } catch (error) {
        //console.error("ERROR inside useMembers queryFn:", error);
        // Return an empty array to prevent the app from crashing while you debug.
        return [];
      }
    },
    enabled: !!currentUser,
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

interface UpdatePlanPayload {
  groupId: string;
  goalTitle: string;
  targetAmount: number;
  targetDate: Date;
}

export function useSavePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePlanPayload) => {
      const groupRef = doc(db, "groups", String(data.groupId));
      await updateDoc(groupRef, {
        goalTitle: data.goalTitle,
        targetAmount: data.targetAmount,
        targetDate: Timestamp.fromDate(data.targetDate),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });
}
