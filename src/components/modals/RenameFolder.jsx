import React, { useState } from 'react';
import { renameFolderDB } from '../handleData.js';

export default function RenameFolder({onCloseRenameFolderSection, userID, currentFolder,onCloseWordSection}) {
  const [newFolderName, setNewFolderName] = useState('');

  return (
    <div className="fixed top-0 left-0 w-full h-screen bg-black/50 z-10 flex justify-center items-center" onClick={onCloseRenameFolderSection}>
      <div className="bg-bg flex flex-col items-center p-5 rounded-lg" onClick={e => e.stopPropagation()}>
        <h3 className='text-2xl text-secondary-text mt-2.5 mb-2.5'>Rename folder</h3>
        <input type="text" placeholder='New folder name...' className='input-field'
          onChange={(e) => setNewFolderName(e.target.value)}
        />
        <button onClick={() => {
          if (!newFolderName.trim()) {
            alert('Please enter a valid folder name');
            return;
          }
          else if (newFolderName === currentFolder) {
            alert('The folder name is the same as the current one');
            return;
          }
          else if (newFolderName.length > 20) {
            alert('Folder name cannot exceed 20 characters');
            return;
          }
          else {
            onCloseRenameFolderSection();
            renameFolderDB(userID, currentFolder, newFolderName).then(() => 
              onCloseWordSection()
            )
          }
        }}
          className='click-btn mt-2.5'
        >Rename</button>
      </div>
    </div>
  )
}