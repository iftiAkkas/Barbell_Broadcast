import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAdCcrjAOvI1d9btJWyVZvrpyPwCwEibyo",
  authDomain: "fitnesstrackerapp-d0647.firebaseapp.com",
  projectId: "fitnesstrackerapp-d0647",
  storageBucket: "fitnesstrackerapp-d0647.firebasestorage.app",
  messagingSenderId: "796056669419",
  appId: "1:796056669419:web:be0f85d798b41f937e42ae",
  measurementId: "G-CC3MYYRSPG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);