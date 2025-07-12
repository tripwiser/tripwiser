const admin = require('firebase-admin');

// Firebase Admin SDK configuration for production
let firebaseApp;

try {
  // Check if we have Firebase credentials
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Use environment variables for Firebase credentials
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } else if (process.env.NODE_ENV === 'production') {
    // For production, try to use default credentials
    firebaseApp = admin.initializeApp();
    console.log('Firebase Admin SDK initialized with default credentials');
  } else {
    // For local development, use mock implementation
    console.log('Firebase Admin SDK disabled for local development');
    firebaseApp = null;
  }
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
  firebaseApp = null;
}

// Export Firebase admin or mock implementation
module.exports = firebaseApp ? {
  auth: () => firebaseApp.auth(),
  firestore: () => firebaseApp.firestore(),
  storage: () => firebaseApp.storage(),
  // Helper function to verify Firebase ID token
  verifyIdToken: async (idToken) => {
    try {
      const decodedToken = await firebaseApp.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('Firebase token verification error:', error);
      throw error;
    }
  }
} : {
  // Mock implementation for local development
  auth: () => ({
    verifyIdToken: async (token) => ({ uid: 'test-user-id', email: 'test@example.com' }),
    createCustomToken: async (uid) => 'mock-token',
    getUser: async (uid) => ({ uid, email: 'test@example.com' })
  }),
  firestore: () => ({
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: false, data: () => null }),
        set: async () => ({}),
        update: async () => ({}),
        delete: async () => ({})
      })
    })
  }),
  storage: () => ({
    bucket: () => ({
      file: () => ({
        save: async () => ({}),
        getSignedUrl: async () => ['mock-url']
      })
    })
  }),
  verifyIdToken: async (token) => ({ uid: 'test-user-id', email: 'test@example.com' })
}; 