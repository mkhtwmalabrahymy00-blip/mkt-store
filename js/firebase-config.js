// =========================================================
// إعدادات Firebase — عدّل هذا الملف فقط بمفاتيحك الخاصة
// كيف تحصل عليها: Firebase Console > Project Settings > عام
// انسخ القيم من "SDK setup and configuration" والصقها هنا
// =========================================================

const firebaseConfig = {
  apiKey: "ضع_مفتاحك_هنا",
  authDomain: "ضع_قيمتك_هنا",
  projectId: "ضع_قيمتك_هنا",
  storageBucket: "ضع_قيمتك_هنا",
  messagingSenderId: "ضع_قيمتك_هنا",
  appId: "ضع_قيمتك_هنا"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// رقم الواتساب لاستقبال الطلبات (بصيغة دولية بدون + أو أصفار)
const WHATSAPP_NUMBER = "218934535076";
