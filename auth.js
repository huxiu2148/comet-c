import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ─── Firebase 設定 ────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyC7NzU1MB1g5ncF6qTYQdSlVoRg6C2cz8Q",
  authDomain: "comet-c292a.firebaseapp.com",
  projectId: "comet-c292a",
  storageBucket: "comet-c292a.firebasestorage.app",
  messagingSenderId: "36058831448",
  appId: "1:36058831448:web:6d99c3ae6cbac7e3d7882d",
  measurementId: "G-HGMTMNLG0B",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ─── 管理者 UID 清單 ──────────────────────────────────────────────
// 首次登入成功後，在 Console 執行 auth.currentUser.uid 取得 UID
// 填入後重新部署，之後這個帳號就會自動成為管理者
const ADMIN_UIDS = [
  // "your-admin-uid-here"
];

// ─── 登入（Redirect 模式，GitHub Pages 相容性最佳）──────────────
// 呼叫後會直接跳轉到 Google 登入頁，登入完成後自動跳回
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  await signInWithRedirect(auth, provider);
}

// ─── 處理 Redirect 登入跳回後的結果 ──────────────────────────────
// 每次頁面載入都要呼叫這個函式
// 如果是從 Google 登入頁跳回來，就會在這裡取得登入結果
export async function handleRedirectResult() {
  console.log("[handleRedirectResult] 開始...");
  try {
    const result = await getRedirectResult(auth);
    console.log("[handleRedirectResult] getRedirectResult 完成，result:", result ? result.user?.email : "null");
    if (result?.user) {
      console.log("[handleRedirectResult] 寫入 Firestore...");
      await ensureUserDoc(result.user);
      console.log("[handleRedirectResult] Firestore 寫入完成");
    }
    console.log("[handleRedirectResult] 結束");
  } catch (error) {
    console.error("[handleRedirectResult] 失敗：", error.code, error.message);
    throw error;
  }
}

// ─── 登出 ─────────────────────────────────────────────────────────
export async function signOutUser() {
  await signOut(auth);
}

// ─── 確保 Firestore 有使用者文件 ──────────────────────────────────
async function ensureUserDoc(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const isAdmin = ADMIN_UIDS.includes(user.uid);
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: isAdmin ? "admin" : "user",
      createdAt: new Date(),
      lastLogin: new Date(),
    });
  } else {
    await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
  }
}

// ─── 取得使用者角色 ────────────────────────────────────────────────
export async function getUserRole(uid) {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return "user";
    return snap.data().role ?? "user";
  } catch {
    return "user";
  }
}

// ─── 監聽登入狀態變化 ─────────────────────────────────────────────
export function watchAuthState(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback({ user: null, role: null });
      return;
    }
    const role = await getUserRole(user.uid);
    callback({ user, role });
  });
}

// ─── 匯出 db 供其他模組使用 ───────────────────────────────────────
export { db, auth };
