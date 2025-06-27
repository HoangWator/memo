import { collection, addDoc, doc, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc, getDocs, deleteField  } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js"; 
import { db } from "./firebase-config.js";
// Function to add a new document to the "users" collection
// This function can be called to add a new user document to the Firestore database
export async function isAlreadyLogin(uid) {
  let isUserNew = 0;
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach((doc) => {
    if (doc.id == uid) {
      isUserNew += 1
    }
  });

  return isUserNew === 1

}
export async function addUser(uid) {
  try {
    await setDoc(doc(db, "users", uid), {
      folders: []
    });

  } catch (e) {
    console.error("Error adding document");
  }
}
export async function getUserData(uid) {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
  }

}

export async function addFolderDB(uid, folderName) {
  try {
    await updateDoc(doc(db, "users", uid), {
      folders: arrayUnion({
        name: folderName,
        items: []
      })
    });

  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function addWordDB(uid, folderName, word) {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const folders = data.folders || [];
      // Find the folder by name
      const folderIndex = folders.findIndex(f => f.name === folderName);
      if (folderIndex !== -1) {
        // Add the word to the folder's items
        const updatedFolder = {
          ...folders[folderIndex],
          items: [...folders[folderIndex].items, word]
        };
        // Create a new folders array with the updated folder
        const updatedFolders = [
          ...folders.slice(0, folderIndex),
          updatedFolder,
          ...folders.slice(folderIndex + 1)
        ];
        // Update Firestore
        await updateDoc(docRef, {
          folders: updatedFolders
        });
      }
    }
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function getFolderDataDB(uid, folderName) {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.folders[folderName] || [];
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (e) {
    console.error("Error getting document: ", e);
  }
}

export async function deleteFolderDB(uid, folderName) {
  try {
    // Get the user document
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const folders = data.folders || [];
      // Find the folder object to remove
      const folderToRemove = folders.find(f => f.name === folderName);
      if (folderToRemove) {
        await updateDoc(docRef, {
          folders: arrayRemove(folderToRemove)
        });
      }
    }
  } catch (e) {
    console.error("Error deleting document: ");
  }
}