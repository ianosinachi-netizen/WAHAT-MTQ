import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

if (!firebaseConfig || !firebaseConfig.projectId) {
  console.error("CRITICAL ERROR: Firebase configuration is missing or invalid. Check firebase-applet-config.json.");
}

// Initialize Firebase SDK
console.log("Initializing Firebase with config:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  databaseId: firebaseConfig.firestoreDatabaseId
});

const app = initializeApp(firebaseConfig);
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Error Handling Spec for Firestore Operations
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate Connection to Firestore
async function testConnection() {
  try {
    console.log("Testing Firebase connection...");
    // Attempt to fetch a specific document from the server to test connectivity
    const testDoc = doc(db, 'test', 'connection');
    const snapshot = await getDocFromServer(testDoc);
    
    if (snapshot.exists()) {
      console.log("Firebase connection test: Success (Document found)");
    } else {
      console.log("Firebase connection test: Success (Document not found, but connection is active)");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Firebase connection test failed with error:", error.message);
      if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
        console.error("Firebase Error: Missing or insufficient permissions. This usually means security rules are blocking the read.");
        console.log("Current Auth State:", auth.currentUser ? `Logged in as ${auth.currentUser.uid}` : "Not logged in");
      } else if (error.message.includes('the client is offline')) {
        console.error("Firebase Error: The client is offline. Please check your network or Firebase configuration.");
      }
    } else {
      console.error("Firebase connection test failed with unknown error:", error);
    }
  }
}
testConnection();
