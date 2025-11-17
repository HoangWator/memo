import React, { useState, useEffect } from 'react';
import { renameFolderDB } from '../handleData.js';

export default function RenameFolder({onCloseRenameFolderSection, userID, currentFolder,onCloseWordSection}) {
  // const [newFolderName, setNewFolderName] = useState('');

  // return (
  //   <div className="fixed top-0 left-0 w-full h-screen bg-black/50 z-10 flex justify-center items-center" onClick={onCloseRenameFolderSection}>
  //     <div className="bg-bg flex flex-col items-center p-5 rounded-lg" onClick={e => e.stopPropagation()}>
  //       <h3 className='text-2xl text-secondary-text mt-2.5 mb-2.5'>Rename folder</h3>
  //       <input type="text" placeholder='New folder name...' className='input-field'
  //         onChange={(e) => setNewFolderName(e.target.value)}
  //       />
  //       <button onClick={() => {
  //         if (!newFolderName.trim()) {
  //           alert('Please enter a valid folder name');
  //           return;
  //         }
  //         else if (newFolderName === currentFolder) {
  //           alert('The folder name is the same as the current one');
  //           return;
  //         }
  //         else if (newFolderName.length > 20) {
  //           alert('Folder name cannot exceed 20 characters');
  //           return;
  //         }
  //         else {
  //           onCloseRenameFolderSection();
  //           renameFolderDB(userID, currentFolder, newFolderName).then(() => 
  //             onCloseWordSection()
  //           )
  //         }
  //       }}
  //         className='click-btn mt-2.5'
  //       >Rename</button>
  //     </div>
  //   </div>
  // )
  // State for the input field value, initialized with the current name
  const [folderName, setFolderName] = useState(currentFolder);
  // State for managing validation errors
  const [error, setError] = useState(null);
  // State for showing the custom confirmation/alert message box
  const [message, setMessage] = useState(null);

  // Custom function to show messages instead of alert()
  const showMessage = (text) => {
      setMessage(text);
  };

  // Handler for the Rename button click
  const handleRename = () => {
      const newName = folderName.trim();

      if (newName === "") {
          setError("Folder name cannot be empty.");
          return;
      }

      if (newName.length > 50) {
          setError("Folder name cannot exceed 50 characters.");
          return;
      }

      if (!folderName.trim()) {
        alert('Please enter a valid folder name');
        return;
      }
      else if (folderName === currentFolder) {
        alert('The folder name is the same as the current one');
        return;
      }
      else if (folderName.length > 20) {
        alert('Folder name cannot exceed 20 characters');
        return;
      }
      else {
        onCloseRenameFolderSection();
        renameFolderDB(userID, currentFolder, folderName).then(() => 
          onCloseWordSection()
        )
      }

      // Clear error if validation passes
      setError(null);

      // Simulate the action
      showMessage(`Successfully renamed folder to: "${newName}"`);

      // In a real application, you would make an API call here and close the modal.
  };

  // Handler for the Cancel button click
  const handleCancel = () => {
      showMessage("Rename action cancelled.");
      onCloseRenameFolderSection()
  };

  // Effect to focus the input field when the component mounts
  useEffect(() => {
      const input = document.getElementById('new-name');
      if (input) {
          input.focus();
      }
  }, []);

  

  return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-bg">
          
          {/* Rename Modal Container */}
          <div 
              id="rename-modal" 
              className="bg-primary-surface text-primary-text p-6 md:p-8 shadow-lg rounded-xl w-full max-w-sm"
          >

              {/* Header and Title */}
              <header className="mb-6 border-b border-muted pb-4">
                  <h2 className="text-2xl font-semibold tracking-tight">Rename Folder</h2>
                  {/* Updated Description */}
                  <p className="text-sm text-secondary-text mt-1">
                      Enter a new name for the <strong className="text-primary-text font-semibold">Project Alpha Folder</strong>.
                  </p>
              </header>

              {/* Form Input Section */}
              <div className="space-y-4">
                  <label 
                      htmlFor="new-name" 
                      className="block text-sm font-medium text-primary-text"
                  >
                      New Name
                  </label>
                  <input
                      type="text"
                      id="new-name"
                      value={folderName}
                      onChange={(e) => {
                          setFolderName(e.target.value);
                          // Clear error on input change
                          if (error) setError(null);
                      }}
                      onKeyDown={(e) => {
                          // Allow 'Enter' key to trigger rename
                          if (e.key === 'Enter') handleRename();
                      }}
                      placeholder="Enter the new folder name..."
                      className='input-field w-full bg-secondary-surface'
                      aria-invalid={!!error}
                      aria-describedby={error ? "error-message" : undefined}
                  />
                  
                  {/* Dynamic Error Message */}
                  {error && (
                      <p id="error-message" className="text-sm text-red-400 mt-1 animate-pulse">
                          {error}
                      </p>
                  )}
              </div>

              {/* Validation Rules and Context */}
              <div className="mt-4 pt-4 border-t border-muted">
                  <p className="text-xs text-secondary-text">
                      The folder name must be unique within its parent directory. Length must be between 1 and 50 characters.
                  </p>
              </div>
              
              {/* Action Buttons (Primary/Secondary Hierarchy) */}
              <footer className="mt-8 flex justify-end space-x-3">
                  {/* Secondary Action: Cancel */}
                  <button
                      onClick={handleCancel}
                      className="cursor-pointer px-5 py-2.5 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                      aria-label="Cancel renaming the folder"
                  >
                      Cancel
                  </button>

                  {/* Primary Action: Rename */}
                  <button
                      onClick={handleRename}
                      className="click-btn"
                      aria-label="Confirm and rename the folder"
                  >
                      Rename
                  </button>
              </footer>
          </div>

          {/* Render the message box if 'message' state is set */}
          {message && <MessageBox text={message} onClose={() => setMessage(null)} />}

      </div>
  );
}