// =========================================================
// إعدادات Firebase — عدّل هذا الملف فقط بمفاتيحك الخاصة
// كيف تحصل عليها: Firebase Console > Project Settings > عام
// انسخ القيم من "SDK setup and configuration" والصقها هنا
// =========================================================

const firebaseConfig = {
  apiKey: "AIzaSyBLOb4gHyVmvllho7ATPIH3IYVPfI3rKxI",
authDomain: "mkt-store-10ee6.firebaseapp.com",
projectId: "mkt-store-10ee6",
storageBucket: "mkt-store-10ee6.firebasestorage.app",
messagingSenderId: "747456857260",
appId: "1:747456857260:web:2c2d72f0dbb9802ccf8b09"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// رقم الواتساب لاستقبال الطلبات (بصيغة دولية بدون + أو أصفار)
const WHATSAPP_NUMBER = "218934535076";
