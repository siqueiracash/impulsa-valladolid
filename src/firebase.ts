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
    // Intentamos autenticar pero no bloqueamos si falla, 
    // ya que las reglas ahora permitirán escritura pública validada.
    await initAuth().catch(e => console.warn("[Firebase] Auth falló, continuando como público:", e));
    
    const docRef = await addDoc(collection(db, 'audits'), {
      businessName: data.businessName || 'Sin nombre',
      businessType: data.businessType || 'otro',
      location: data.location || 'Sin ubicación',
      whatsapp: data.whatsapp || '',
      email: data.email || '',
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
    console.error("[Firebase] Error crítico guardando auditoría:", error);
    // No lanzamos el error para no bloquear el flujo del usuario, 
    // pero lo registramos.
    return null;
  }
};
