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
      folders: arrayUnion({name: folderName, words: []})
    })
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function deleteFolderDB(uid, folderName) {
  try {
    await updateDoc(doc(db, "users", uid), {
      folders: arrayRemove({name: folderName, words: []})
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
      const folderData = data.folders || [];
      // Find and update the specific folder
      const updatedFolders = folderData.map(item => 
        item.name === clickedFolder ? { ...item, name: newFolderName } : item
      );
      // Update the folder with the modified array
      await updateDoc(docRef, {
        folders: updatedFolders
      });
    }


  } catch (e) {
    console.error("Error deleting document: ");
  }
}

// Generate review schedule

export async function addWordDB(uid, folderName, word) {
  try {
    const docRef = doc(db, "users", uid);

    // 1. Get the current data
    const snapshot = await getDoc(docRef);
    const data = snapshot.data();

    // 2. Find the folder and push the new item
    const folderIndex = data.folders.findIndex(folder => folder.name === folderName);
    if (folderIndex !== -1) {
      data.folders[folderIndex].words.push(word);

      // 3. Write the WHOLE folders array back
      await updateDoc(docRef, {
        folders: data.folders
      });
    }
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function deleteWordDB(uid, folderName, word) {
  console.log('Delete works!')
  try {
    const docRef = doc(db, "users", uid);

    // 1. Get the current data
    const snapshot = await getDoc(docRef);
    const data = snapshot.data();

    // 2. Find the folder and push the new item
    const folderIndex = data.folders.findIndex(folder => folder.name === folderName);
    if (folderIndex !== -1) {
      data.folders[folderIndex].words.splice(data.folders[folderIndex].words.indexOf(word), 1);

      // 3. Write the WHOLE folders array back
      await updateDoc(docRef, {
        folders: data.folders
      });
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
      const userFolders = data.folders || [];
      const folderData = userFolders.find(folder => folder.name === folderName);
      return folderData
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (e) {
    console.error("Error getting document: ", e);
  }
}

// Add word to dictionary
export async function addWordToDictDB(word) {
  try {
    await setDoc(doc(db, "dictionary", word.word), word)
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// Check if word exists in dictionary
export async function checkWordInDictDB(word) {
  try {
    const querySnapshot = await getDocs(collection(db, "dictionary"));
    let exists = false; 
    querySnapshot.forEach((doc) => {
      if (doc.data().word === word) {
        exists = true; 
      }
    });
    return exists;
  } catch (e) {
    console.error("Error checking document: ", e);
    return false; 
  }
}

// Search word in dictionary
export async function searchWordInDictDB(word) {
  try {
    const docRef = doc(db, "dictionary", word);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }

  } catch (e) {
    console.error("Error searching document: ", e);
    return [];
  }
}

export async function updateReviewSchedule(uid, folderName, datas, mode) {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const folderData = data.folders || [];
    const currentFolder = folderData.find(folder => folder.name === folderName);
    let wordsInFolder = currentFolder.words || [];

    wordsInFolder.forEach(wordItem => {
      datas.forEach(item => {
        if (wordItem.name === item.word && wordItem.definition_eng === item.answer_eng && wordItem.definition_vie === item.answer_vie) {
          // Update review schedule based on result
          const reviewedDate = new Date();
          let newScheduleReview = [];
          if (item.result === 'correct' && wordItem.rateAccuracy !== true) {
            for (let i = 1; i <= 10; i++) {
              if (i === 1) {
                reviewedDate.setDate(reviewedDate.getDate() + 1);
                newScheduleReview.push(reviewedDate);
              }
              else {
                const lastDate = new Date(newScheduleReview[newScheduleReview.length - 1]);
                lastDate.setDate(lastDate.getDate() + i);
                newScheduleReview.push(lastDate);
              }
            }
            let modeReviewIndex = wordItem.scheduleReview.findIndex(item => item.mode === mode);
            wordItem.scheduleReview[modeReviewIndex].rateAccuracy = true
            wordItem.scheduleReview[modeReviewIndex].lastReview = new Date()
            wordItem.scheduleReview[modeReviewIndex].reviewDates = newScheduleReview;
            updateDoc(docRef, {
              folders: folderData
            });
          }
          else if (item.result === 'wrong' && wordItem.rateAccuracy === true) {
            reviewedDate.setDate(reviewedDate.getDate() + 1);
            newScheduleReview.push(reviewedDate);
            let modeReviewIndex = wordItem.scheduleReview.findIndex(item => item.mode === mode);
            wordItem.scheduleReview[modeReviewIndex].rateAccuracy = false
            wordItem.scheduleReview[modeReviewIndex].lastReview = new Date()
            wordItem.scheduleReview[modeReviewIndex].scheduleReview = newScheduleReview;
            updateDoc(docRef, {
              folders: folderData
            });
          }
        }
      })  
    })

  }
}