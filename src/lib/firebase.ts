import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDR3Uz_Rs-vU8hQIlgU6wiAd0tsZ6ypudk",
  authDomain: "seavis-ca32d.firebaseapp.com",
  projectId: "seavis-ca32d",
  storageBucket: "seavis-ca32d.firebasestorage.app",
  messagingSenderId: "720236614181",
  appId: "1:720236614181:web:1c8036fd439cc1ad5ae5cc",
  measurementId: "G-DPG3X6GTWD"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Enable offline persistence
// We catch errors because it can fail if multiple tabs are open
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
  } else if (err.code == 'unimplemented') {
    console.warn('The current browser does not support all of the features required to enable persistence');
  }
});
