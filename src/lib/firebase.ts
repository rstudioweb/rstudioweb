import admin from 'firebase-admin';

/**
 * Firebase Admin SDK Initialization
 * Manages server-side Firestore connection
 */

export const initializeFirebase = () => {
  // Check if app already exists
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase configuration missing in environment variables');
  }

  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  console.log('✅ Firebase initialized successfully');
  return app;
};

export const getFirestore = () => {
  initializeFirebase();
  return admin.firestore();
};

export const getDb = () => getFirestore();
