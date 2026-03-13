import React, { createContext, useContext, ReactNode } from 'react';
import { doc, setDoc, getDoc, arrayUnion, writeBatch, serverTimestamp, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from 'firebase/auth';

// A simple random code generator for the user verification code
const generateVerificationCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

interface DatabaseContextType {
  createGroupAndUser: (user: User, groupName: string, inviteCode: string, initialTarget?: number) => Promise<void>;
  joinGroupAndCreateUser: (user: User, inviteCode: string) => Promise<void>;
  doesGroupExist: (inviteCode: string) => Promise<boolean>;
  getUserDocument: (uid: string) => Promise<DocumentData | null>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const doesGroupExist = async (inviteCode: string): Promise<boolean> => {
    const groupRef = doc(db, 'groups', inviteCode);
    const groupSnap = await getDoc(groupRef);
    return groupSnap.exists();
  };

  const getUserDocument = async (uid: string): Promise<DocumentData | null> => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  };

  const createGroupAndUser = async (user: User, groupName: string, inviteCode: string, initialTarget?: number) => {
    const batch = writeBatch(db);

    // 1. Create Group document
    const groupRef = doc(db, 'groups', inviteCode);
    const newGroupData = {
      name: groupName,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      members: [user.uid],
      ...(initialTarget && initialTarget > 0 && { targetAmount: initialTarget }),
    };
    batch.set(groupRef, newGroupData);

    // 2. Create User document
    const userRef = doc(db, 'users', user.uid);
    const newUserProfile = {
      email: user.email,
      displayName: user.displayName,
      groupId: inviteCode,
      verificationCode: generateVerificationCode(),
      createdAt: serverTimestamp(),
    };
    batch.set(userRef, newUserProfile);

    await batch.commit();
  };

  const joinGroupAndCreateUser = async (user: User, inviteCode: string) => {
    const batch = writeBatch(db);

    // 1. Update Group document - add member
    const groupRef = doc(db, 'groups', inviteCode);
    batch.update(groupRef, {
      members: arrayUnion(user.uid)
    });

    // 2. Create User document
    const userRef = doc(db, 'users', user.uid);
    const newUserProfile = {
      email: user.email,
      displayName: user.displayName,
      groupId: inviteCode,
      verificationCode: generateVerificationCode(),
      createdAt: serverTimestamp(),
    };
    batch.set(userRef, newUserProfile);

    await batch.commit();
  };

  const value = {
    createGroupAndUser,
    joinGroupAndCreateUser,
    doesGroupExist,
    getUserDocument,
  };

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}