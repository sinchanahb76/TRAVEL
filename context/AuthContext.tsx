import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (name: string, email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  mapFirebaseError: (error: any) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function mapFirebaseError(error: any): string {
  console.log('[AuthContext] Firebase error occurred:', error?.code, error?.message);
  const code = error?.code || '';
  const message = error?.message || '';

  if (code === 'auth/user-not-found') {
    return 'Account not found. Please sign up first.';
  }
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Incorrect email or password.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account already exists with this email. Please sign in.';
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many failed login attempts. Please try again later.';
  }
  if (code === 'auth/user-disabled') {
    return 'This account has been disabled. Please contact support.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection error. Please check your internet connection.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Email/Password sign-in is not enabled in Firebase Console.';
  }

  if (message) {
    const cleaned = message.replace(/^Firebase:\s*(?:Error\s*)?(?:\([^)]+\)\.?)?\s*/i, '').trim();
    if (cleaned) return cleaned;
  }

  return 'Authentication failed. Please verify your credentials and try again.';
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser: User | null) => {
          if (firebaseUser) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Traveler',
              photoURL: firebaseUser.photoURL,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error('[AuthContext] onAuthStateChanged error:', error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, pass: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }

    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    setUser({
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'Traveler',
      photoURL: cred.user.photoURL,
    });
  };

  const signUp = async (name: string, email: string, pass: string): Promise<void> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }

    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    if (cleanName) {
      try {
        await updateProfile(cred.user, { displayName: cleanName });
      } catch (e) {
        console.warn('[AuthContext] updateProfile notice:', e);
      }
    }
    setUser({
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cleanName || cred.user.email?.split('@')[0] || 'Traveler',
      photoURL: cred.user.photoURL,
    });
  };

  const signOut = async (): Promise<void> => {
    if (auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    await sendPasswordResetEmail(auth, cleanEmail);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        mapFirebaseError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
