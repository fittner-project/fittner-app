import { getAnalytics } from "@react-native-firebase/analytics";
import { initializeApp } from "@react-native-firebase/app";
import { Platform } from "react-native";

if (
  !process.env.FIREBASE_API_KEY ||
  !process.env.FIREBASE_AUTH_DOMAIN ||
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_STORAGE_BUCKET ||
  !process.env.FIREBASE_MESSAGING_SENDER_ID ||
  !process.env.FIREBASE_APP_ID ||
  !process.env.FIREBASE_MEASUREMENT_ID
) {
  throw new Error("Firebase 환경 변수가 설정되지 않았습니다.");
}

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
} as const;

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 웹에서만 Analytics 초기화
let analytics = null;
if (Platform.OS === "web") {
  analytics = getAnalytics(app);
}

export { app, analytics };
