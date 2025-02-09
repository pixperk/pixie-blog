import { login } from "@/server/user";
import { initializeApp } from "firebase/app";
import {
  Auth,
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const auth: Auth = getAuth(firebaseApp);
  auth.useDeviceLanguage();
  const userCredential: UserCredential = await signInWithPopup(auth, provider);
  const data = {
    name: userCredential.user.displayName!,
    email: userCredential.user.email!,
    socialId: userCredential.user.uid!,
    avatar: userCredential.user.photoURL!,
  };
  const user = await login(data);
  return user;
};

export const loginWithGithub = async () => {
  const provider = new GithubAuthProvider();
  const auth: Auth = getAuth(firebaseApp);
  auth.useDeviceLanguage();
  const userCredential: UserCredential = await signInWithPopup(auth, provider);
  console.log(userCredential);
  const data = {
    name: userCredential.user.displayName!,
    email: userCredential.user.email ?? "",
    socialId: userCredential.user.uid!,
    avatar: userCredential.user.photoURL!,
  };
  const user = await login(data);
  return user;
};

export const auth = getAuth(firebaseApp);
