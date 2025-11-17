import React from 'react';
import { deleteFolderDB } from '../handleData.js';

export default function DeleteValid({onCloseDeleteValidSection,onCloseWordSection,currentFolder, userID}) {
  return (
    <div className="fixed top-0 left-0 w-full h-screen bg-black/50 z-10 flex justify-center items-center" onClick={onCloseDeleteValidSection}>
      <div className="bg-bg flex flex-col p-5 rounded-lg w-75" onClick={e => e.stopPropagation()}>
        <h3 className='text-primary-text font-semibold text-xl'>Delete folder?</h3>
        <p className='text-secondary-text mt-2.5'>This can't be undone</p>
        <div className="options flex gap-2.5 mt-2.5 justify-end">
          <button 
            onClick={onCloseDeleteValidSection}
            className='p-2.5 bg-primary-surface text-primary-text rounded-lg cursor-pointer'
          >Cancel</button>
          <button 
            onClick={() => {
              deleteFolderDB(userID, currentFolder)
              onCloseWordSection();
            }} 
            className='p-2.5 bg-wrong text-white rounded-lg cursor-pointer'
          >Delete</button>
          
        </div>
      </div>
    </div>
  )
}