import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (name: string, email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser: User | null) => {
          if (firebaseUser) {
            console.log('[AuthContext] Firebase auth state active for UID:', firebaseUser.uid, 'Email:', firebaseUser.email);
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Traveler',
            });
          } else {
            console.log('[AuthContext] Firebase auth state: signed out');
            setUser(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error('[AuthContext] onAuthStateChanged listener error:', error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      console.warn('[AuthContext] Firebase environment configuration is missing.');
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, pass: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    const passwordToUse = pass;

    console.log('[AuthContext] Calling signInWithEmailAndPassword for:', cleanEmail);

    if (!isFirebaseConfigured || !auth) {
      const missingConfigErr = new Error('Firebase Authentication is not configured. Please verify your VITE_FIREBASE_* environment variables.');
      (missingConfigErr as any).code = 'auth/configuration-missing';
      throw missingConfigErr;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, passwordToUse);
      console.log('[AuthContext] signInWithEmailAndPassword succeeded for:', cred.user.email);
      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'Traveler',
      });
    } catch (error: any) {
      console.error('[AuthContext] signInWithEmailAndPassword caught error:', {
        code: error?.code,
        message: error?.message,
        customData: error?.customData,
      });
      throw error;
    }
  };

  const signUp = async (name: string, email: string, pass: string): Promise<void> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const passwordToUse = pass;

    console.log('[AuthContext] Calling createUserWithEmailAndPassword for:', cleanEmail);

    if (!isFirebaseConfigured || !auth) {
      const missingConfigErr = new Error('Firebase Authentication is not configured. Please verify your VITE_FIREBASE_* environment variables.');
      (missingConfigErr as any).code = 'auth/configuration-missing';
      throw missingConfigErr;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, passwordToUse);
      console.log('[AuthContext] createUserWithEmailAndPassword succeeded for:', cred.user.email);
      if (cleanName) {
        try {
          await updateProfile(cred.user, { displayName: cleanName });
        } catch (profileErr) {
          console.warn('[AuthContext] updateProfile notice:', profileErr);
        }
      }
      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cleanName || cred.user.email?.split('@')[0] || 'Traveler',
      });
    } catch (error: any) {
      console.error('[AuthContext] createUserWithEmailAndPassword caught error:', {
        code: error?.code,
        message: error?.message,
        customData: error?.customData,
      });
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!isFirebaseConfigured || !auth) {
      const missingConfigErr = new Error('Firebase Authentication is not configured. Please verify your VITE_FIREBASE_* environment variables.');
      (missingConfigErr as any).code = 'auth/configuration-missing';
      throw missingConfigErr;
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      console.log('[AuthContext] sendPasswordResetEmail sent for:', cleanEmail);
    } catch (error: any) {
      console.error('[AuthContext] sendPasswordResetEmail caught error:', {
        code: error?.code,
        message: error?.message,
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
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
