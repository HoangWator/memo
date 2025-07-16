import { collection, addDoc, doc, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc, getDocs, deleteField  } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js"; 
import { db } from "../firebase-config.js";
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
      folders: {}
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
      [`folders.${folderName}`]: []
    })
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function deleteFolderDB(uid, folderName) {
  try {
    await updateDoc(doc(db, "users", uid), {
      [`folders.${folderName}`]: deleteField()
    });
  } catch (e) {
    console.error("Error deleting document: ");
  }
}

export async function renameFolderDB(uid, clickedFolder, newFolderName) {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const folders = data.folders || {};

      // If the old folder exists and the new one does not
      if (folders[clickedFolder] && !folders[newFolderName]) {
        // Copy the data to the new folder name
        await updateDoc(docRef, {
          [`folders.${newFolderName}`]: folders[clickedFolder],
          [`folders.${clickedFolder}`]: deleteField()
        });
      } else {
        console.error("Rename failed: Folder does not exist or new name already taken.");
      }
    }
  } catch (e) {
    console.error("Error deleting document: ");
  }
}

// Generate review schedule

export async function addWordDB(uid, folderName, word) {
  try {
    await updateDoc(doc(db, "users", uid), {
      [`folders.${folderName}`]: arrayUnion(word)
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function deleteWordDB(uid, folderName, word) {
  console.log('Delete works!')
  try {
    await updateDoc(doc(db, "users", uid), {
      [`folders.${folderName}`]: arrayRemove(word)
    });
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

