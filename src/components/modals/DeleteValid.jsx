import React from 'react';
import { deleteFolderDB } from '../handleData.js';

export default function DeleteValid({onCloseDeleteValidSection,onCloseWordSection,currentFolder, userID}) {
  return (
    <div className="fixed top-0 left-0 w-full h-screen bg-black/50 z-10 flex justify-center items-center" onClick={onCloseDeleteValidSection}>
      <div className="bg-bg flex flex-col items-center p-5 rounded-lg" onClick={e => e.stopPropagation()}>
        <h3 className='text-secondary-text'>Delete this folder?</h3>
        <div className="options flex gap-2.5 mt-5">
          <button 
            onClick={() => {
              deleteFolderDB(userID, currentFolder)
              onCloseWordSection();
            }} 
            className='p-2.5 bg-wrong text-primary-text rounded-lg cursor-pointer'
          >Yes, delete it</button>
          <button 
            onClick={onCloseDeleteValidSection}
            className='p-2.5 bg-primary-surface text-primary-text rounded-lg cursor-pointer'
          >No, keep it</button>
        </div>
      </div>
    </div>
  )
}