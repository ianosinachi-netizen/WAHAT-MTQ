import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  role: 'user' | 'admin';
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      // Clean up previous profile listener if it exists
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Listen for profile changes
        unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            // Ensure admin role for specific email
            if (currentUser.email === 'ianosinachi@gmail.com' && data.role !== 'admin') {
              setDoc(userDocRef, { ...data, role: 'admin' }, { merge: true }).catch(err => {
                handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
              });
            }
            setProfile(data);
          } else {
            // Create profile if it doesn't exist
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName,
              role: currentUser.email === 'ianosinachi@gmail.com' ? 'admin' : 'user',
              createdAt: serverTimestamp(),
            };
            
            setDoc(userDocRef, newProfile).catch(err => {
              handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
            });
          }
          setLoading(false);
        }, (err) => {
          // Only handle error if we are still logged in
          if (auth.currentUser) {
            handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
          }
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};
