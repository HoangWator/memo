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
                    setError("Tên thư mục không được để trống.");
                    return;
            }

            if (newName.length > 50) {
                    setError("Tên thư mục không được quá 50 ký tự.");
                    return;
            }

            if (!folderName.trim()) {
                alert('Vui lòng nhập tên thư mục hợp lệ');
                return;
            }
            else if (folderName === currentFolder) {
                alert('Tên thư mục giống với tên hiện tại');
                return;
            }
            else if (folderName.length > 20) {
                alert('Tên thư mục không được vượt quá 20 ký tự');
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
            showMessage(`Đã đổi tên thư mục thành: "${newName}"`);
  };

  // Handler for the Cancel button click
  const handleCancel = () => {
      showMessage("Đã hủy đổi tên thư mục.");
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
                  <h2 className="text-2xl font-semibold tracking-tight">Đổi tên thư mục</h2>
                      {/* Updated Description */}
                      <p className="text-sm text-secondary-text mt-1">
                          Nhập tên mới cho thư mục hiện tại: <strong className="text-primary-text font-semibold">{currentFolder}</strong>.
                      </p>
              </header>

              {/* Form Input Section */}
              <div className="space-y-4">
                  <label 
                      htmlFor="new-name" 
                      className="block text-sm font-medium text-primary-text"
                  >
                      Tên mới
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
                      placeholder="Nhập tên thư mục mới..."
                      className='input-field w-full bg-secondary-surface text-primary-text'
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
                      Tên thư mục phải là duy nhất trong thư mục cha. Chiều dài từ 1 đến 50 ký tự.
                  </p>
              </div>
              
              {/* Action Buttons (Primary/Secondary Hierarchy) */}
              <footer className="mt-8 flex justify-end space-x-3">
                  {/* Secondary Action: Cancel */}
                  <button
                      onClick={handleCancel}
                      className="cursor-pointer px-5 py-2.5 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                      aria-label="Hủy đổi tên thư mục"
                  >
                      Hủy
                  </button>

                  {/* Primary Action: Rename */}
                  <button
                      onClick={handleRename}
                      className="click-btn"
                      aria-label="Xác nhận đổi tên thư mục"
                  >
                      Đổi tên
                  </button>
              </footer>
          </div>

          {/* Render the message box if 'message' state is set */}
          {message && <MessageBox text={message} onClose={() => setMessage(null)} />}

      </div>
  );
}