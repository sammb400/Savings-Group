import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
interface UserProfileUpdateData {
  displayName?: string | null;
  photoURL?: string | null;
  [x: string]: any;
}

interface AuthContextType {
  currentUser: User | null;
  userLoading: boolean;
  updateUser: (user: User | null) => void
  loading: boolean;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<any>;
  updateProfile: (data: any) => Promise<void | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null >(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      setUserLoading(false);
    });

    return unsubscribe; // Unsubscribe on cleanup
  }, []);

  const signup = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const googleLogin = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const updateUser = (user: User | null) => {
    setCurrentUser(user)
  };

  const updateProfile = async (data: UserProfileUpdateData) => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, data);
    }
    }

  const value = { 
    currentUser, 
    userLoading, 
    updateUser, 
    loading, 
    signup, 
    login, 
    logout, 
    googleLogin, 
    updateProfile 
  };

  // We don't render the children until the initial auth check is complete
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
