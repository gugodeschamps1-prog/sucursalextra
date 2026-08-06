/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

// Firebase client configuration with environment variables or safe defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyFEXPharmacyDemoApiKey123456789",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fex-pharmacy-branches.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fex-pharmacy-branches",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fex-pharmacy-branches.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475612",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:102938475612:web:a1b2c3d4e5f6"
};

let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
let messaging: Messaging | null = null;

if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.warn("FCM getMessaging initialized in fallback browser mode:", err);
  }
}

export { app, messaging };

export async function requestFCMToken(): Promise<string | null> {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BEl62iUYgUivxIkv69yViEuiC1234567890abcdef'
      }).catch((e) => {
        console.warn('FCM token retrieval using local simulated vapid:', e);
        return `fcm-token-demo-${Date.now()}`;
      });
      return token;
    }
  } catch (error) {
    console.error('Error requesting FCM permission:', error);
  }
  return null;
}

export function onForegroundMessage(callback: (payload: any) => void) {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
}
