// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FIREBASE CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (e.g. "his-documentation-portal")
// 3. Enable Firestore Database (start in test mode for now)
// 4. Go to Project Settings > General > Your Apps > Add Web App
// 5. Copy the config values below
// 6. Replace the placeholder values with your actual config
//
// FIRESTORE RULES (for team access):
// Go to Firestore > Rules and set:
//
//   rules_version = '2';
//   service cloud.firestore {
//     match /databases/{database}/documents {
//       match /{document=**} {
//         allow read, write: if true;  // Open for team (add auth later)
//       }
//     }
//   }
//
// For production, add Firebase Authentication and restrict rules.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB5yqYu1BTz80TYwWMJWfPgEfsY4LCemn4",
  authDomain: "his-portal-8b445.firebaseapp.com",
  projectId: "his-portal-8b445",
  storageBucket: "his-portal-8b445.firebasestorage.app",
  messagingSenderId: "222557247417",
  appId: "1:222557247417:web:fc6257b2e05aadf3a18868"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ━━━ DOCUMENT REFERENCE ━━━
// All portal data is stored in a single Firestore document
const DOC_REF = doc(db, "portal", "his-data");

/**
 * Load portal data from Firestore
 * @returns {Promise<object|null>} The portal data or null if not found
 */
export async function loadData() {
  try {
    const snap = await getDoc(DOC_REF);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.error("Failed to load from Firestore:", err);
    return null;
  }
}

/**
 * Save portal data to Firestore
 * @param {object} data - The full portal data object
 */
export async function saveData(data) {
  try {
    await setDoc(DOC_REF, data);
  } catch (err) {
    console.error("Failed to save to Firestore:", err);
    throw err;
  }
}

/**
 * Subscribe to real-time updates from Firestore
 * @param {function} callback - Called with updated data whenever it changes
 * @returns {function} Unsubscribe function
 */
export function subscribeData(callback) {
  return onSnapshot(DOC_REF, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  }, (err) => {
    console.error("Firestore subscription error:", err);
  });
}

// Extension → MIME fallback. Browsers sometimes leave file.type empty for .html,
// .md, .csv, .log, etc., which causes Firebase Storage to serve them as binary
// downloads. We resolve the type from the extension whenever the browser is silent.
const EXT_MIME = {
  html: "text/html", htm: "text/html",
  txt: "text/plain", md: "text/markdown", log: "text/plain",
  csv: "text/csv", tsv: "text/tab-separated-values",
  json: "application/json", xml: "application/xml", yaml: "application/x-yaml", yml: "application/x-yaml",
  js: "text/javascript", css: "text/css", svg: "image/svg+xml",
  pdf: "application/pdf",
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", bmp: "image/bmp",
  zip: "application/zip", "7z": "application/x-7z-compressed", rar: "application/vnd.rar",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

function resolveContentType(file) {
  if (file && file.type) return file.type;
  const name = String(file?.name || "");
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "application/octet-stream";
  const ext = name.slice(dot + 1).toLowerCase();
  return EXT_MIME[ext] || "application/octet-stream";
}

/**
 * Upload an attachment file to Firebase Storage under a module folder.
 * @param {string} moduleId - The module identifier (used as folder)
 * @param {File} file - The file to upload
 * @returns {Promise<{name:string,size:number,contentType:string,storagePath:string,downloadURL:string,uploadedAt:string}>}
 */
export async function uploadAttachment(moduleId, file, onProgress) {
  const safeModule = String(moduleId || "misc").replace(/[^A-Za-z0-9_-]/g, "_");
  const ts = Date.now();
  const safeName = String(file.name || "file").replace(/[^A-Za-z0-9._-]/g, "_");
  const path = `attachments/${safeModule}/${ts}_${safeName}`;
  const r = storageRef(storage, path);
  const contentType = resolveContentType(file);
  const task = uploadBytesResumable(r, file, { contentType });

  // Detect uploads that are silently stuck (most often: CORS denying the
  // request, or Storage rules blocking writes without a proper error). If
  // the bytesTransferred counter doesn't advance for STALL_MS, abort with a
  // diagnostic so the UI can show something actionable.
  const STALL_MS = 30000;
  let lastBytes = -1;
  let stallTimer = null;
  const armStallTimer = (reject) => {
    if (stallTimer) clearTimeout(stallTimer);
    stallTimer = setTimeout(() => {
      try { task.cancel(); } catch {}
      const err = new Error(
        "Upload stalled — no bytes transferred for " + (STALL_MS / 1000) +
        "s. This usually means the Storage bucket's CORS is not configured " +
        "for this origin, or Storage rules are blocking writes. Check the " +
        "browser DevTools Network tab for a failed/blocked request."
      );
      err.code = "storage/stalled";
      reject(err);
    }, STALL_MS);
  };

  await new Promise((resolve, reject) => {
    armStallTimer(reject);
    task.on("state_changed",
      (snap) => {
        if (snap.bytesTransferred !== lastBytes) {
          lastBytes = snap.bytesTransferred;
          armStallTimer(reject);
        }
        if (typeof onProgress === "function" && snap.totalBytes > 0) {
          onProgress(snap.bytesTransferred / snap.totalBytes);
        }
      },
      (err) => { if (stallTimer) clearTimeout(stallTimer); reject(err); },
      () => { if (stallTimer) clearTimeout(stallTimer); resolve(); }
    );
  });
  const downloadURL = await getDownloadURL(r);
  return {
    name: file.name,
    size: file.size,
    contentType,
    storagePath: path,
    downloadURL,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Persist only the attachments slot for a single module.
 * Avoids re-serializing the entire portal document on every upload.
 * @param {string} moduleId
 * @param {Array} list - The full new attachments list for this module
 */
export async function updateAttachments(moduleId, list) {
  await updateDoc(DOC_REF, { [`attachments.${moduleId}`]: list });
}

/**
 * Delete an attachment file from Firebase Storage.
 * @param {string} storagePath - The storage path returned from uploadAttachment
 */
export async function deleteAttachment(storagePath) {
  if (!storagePath) return;
  try {
    await deleteObject(storageRef(storage, storagePath));
  } catch (err) {
    // Ignore "object-not-found" so we can still clean up the metadata
    if (err?.code !== "storage/object-not-found") throw err;
  }
}

export { db, storage };
