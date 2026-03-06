import type { Group, Member, Transaction, InsertTransaction, DashboardData } from "@shared/schema";

export interface IStorage {
  getDashboardData(): Promise<DashboardData>;
  getMembers(): Promise<Member[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
}

const mockGroup: Group = {
  id: 1,
  name: "Emerald Savers",
  inviteId: "EMRLD2024",
  targetAmount: 5000,
  currentAmount: 3250,
  daysLeft: 12,
};

const mockMembers: Member[] = [
  { id: 1, groupId: 1, name: "Alice (Me)", totalDeposited: 1200, avatarUrl: null, isMe: true },
  { id: 2, groupId: 1, name: "Bob", totalDeposited: 1050, avatarUrl: null, isMe: false },
  { id: 3, groupId: 1, name: "Charlie", totalDeposited: 1000, avatarUrl: null, isMe: false },
];

let mockTransactions: Transaction[] = [
  { id: 1, groupId: 1, memberName: "Alice (Me)", amount: 50, depositType: "Weekly", proofText: "Transfer #123", date: new Date() },
  { id: 2, groupId: 1, memberName: "Bob", amount: 100, depositType: "Monthly", proofText: "Salary cut", date: new Date() },
  { id: 3, groupId: 1, memberName: "Charlie", amount: 25, depositType: "Daily", proofText: "Coffee money", date: new Date() },
];

export class MemStorage implements IStorage {
  async getDashboardData(): Promise<DashboardData> {
    const myTotal = mockMembers.find(m => m.isMe)?.totalDeposited || 0;
    return {
      group: mockGroup,
      myTotal,
      recentTransactions: [...mockTransactions].reverse().slice(0, 10)
    };
  }

  async getMembers(): Promise<Member[]> {
    return mockMembers;
  }

  async createTransaction(insertTx: InsertTransaction): Promise<Transaction> {
    const newTx: Transaction = {
      ...insertTx,
      id: mockTransactions.length + 1,
      date: new Date()
    };
    mockTransactions.push(newTx);
    
    // Update group current amount
    mockGroup.currentAmount += newTx.amount;
    
    // Update my total if it's me (for simplicity, assuming all new tx from me)
    const me = mockMembers.find(m => m.isMe);
    if (me && newTx.memberName === me.name) {
      me.totalDeposited += newTx.amount;
    }

    return newTx;
  }
}

export const storage = new MemStorage();
