import React, { useState } from 'react';
import { renameFolderDB } from '../handleData.js';

export default function RenameFolder({onCloseRenameFolderSection, userID, currentFolder,onCloseWordSection}) {
  const [newFolderName, setNewFolderName] = useState('');

  return (
    <div className="rename-folder-section" onClick={onCloseRenameFolderSection}>
      <div className="rename-folder" onClick={e => e.stopPropagation()}>
        <h3>Rename folder</h3>
        <input type="text" placeholder='New folder name...'
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
        }}>Rename</button>
      </div>
    </div>
  )
}