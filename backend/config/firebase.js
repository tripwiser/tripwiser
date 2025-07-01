const admin = require('firebase-admin');

// Use the service account JSON file directly
const serviceAccount = require('../tripwise-7d40a-firebase-adminsdk-fbsvc-a8ca1d7dd0.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log('Firebase Admin SDK initialized successfully');

module.exports = admin; 