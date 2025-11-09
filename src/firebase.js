import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// O React vai ler as chaves do arquivo .env e injetar aqui
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o banco de dados (Firestore) para usarmos no app
export const db = getFirestore(app);