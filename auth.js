import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect ,
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

// ─── 管理者 UID 清單（在 Firestore 設定前的備用機制）─────────────
// 部署前請將你自己的 Google 帳號 UID 填入此陣列
// UID 可在首次登入後於瀏覽器 console 執行 auth.currentUser.uid 取得
const ADMIN_UIDS = [
  // "your-admin-uid-here"
];

// ─── 登入 ─────────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithRedirect (auth, provider);
    await ensureUserDoc(result.user);
    return result.user;
  } catch (error) {
    console.error("登入失敗：", error.message);
    throw error;
  }
}

// ─── 登出 ─────────────────────────────────────────────────────────
export async function signOutUser() {
  await signOut(auth);
}

// ─── 確保 Firestore 有使用者文件 ──────────────────────────────────
// 首次登入時自動建立，之後只更新 lastLogin
async function ensureUserDoc(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    // 新使用者：判斷是否為管理者
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
    // 舊使用者：只更新最後登入時間
    await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
  }
}

// ─── 取得使用者角色 ────────────────────────────────────────────────
// 回傳 "admin" | "user" | null（未登入）
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
// 使用方式：
//   watchAuthState(({ user, role }) => { ... })
//   user 為 null 代表未登入
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
