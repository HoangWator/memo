import React from 'react';
import { deleteFolderDB } from '../handleData.js';

export default function DeleteValid({onCloseDeleteValidSection,onCloseWordSection,currentFolder, userID}) {
  return (
    <div className="delete-valid-section" onClick={onCloseDeleteValidSection}>
      <div className="delete-valid" onClick={e => e.stopPropagation()}>
        <h3>Delete this folder?</h3>
        <div className="options">
          <button onClick={() => {
            deleteFolderDB(userID, currentFolder)
            onCloseWordSection();
          }} className='deleteFolderBtn'>Yes, delete it</button>
          <button onClick={onCloseDeleteValidSection}>No, keep it</button>
        </div>
      </div>
    </div>
  )
}