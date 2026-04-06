import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Initialize anonymous auth to allow writes based on security rules
export const initAuth = async () => {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
      console.log("[Firebase] Autenticación anónima exitosa");
    }
  } catch (error) {
    console.error("[Firebase] Error en autenticación:", error);
  }
};

export const saveAudit = async (data: any, report: any) => {
  try {
    await initAuth();
    const docRef = await addDoc(collection(db, 'audits'), {
      businessName: data.businessName,
      businessType: data.businessType,
      location: data.location,
      whatsapp: data.whatsapp,
      email: data.email,
      website: data.website || '',
      instagram: data.instagram || '',
      facebook: data.facebook || '',
      linkedin: data.linkedin || '',
      tiktok: data.tiktok || '',
      otherPlatforms: data.otherPlatforms || '',
      report: report,
      createdAt: serverTimestamp()
    });
    console.log("[Firebase] Auditoría guardada con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("[Firebase] Error guardando auditoría:", error);
    throw error;
  }
};
