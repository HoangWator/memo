import { use, useState } from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { faPlus,faLightbulb,faPen,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight,faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getUserData, addFolderDB } from './handleData.js'
import { getFolderDataDB } from './handleData.js'
import meaningSuggestion from './gemini.js'
import WordSection from './WordSection.jsx'


export function VocabularySection({ userID, folders, allFolders }) {
  const [folderName, setFolderName] = useState('')
  const [foldersVocab, setFoldersVocab] = useState([])
  const [allFoldersVocab, setAllFoldersVocab] = useState([])
  const [userData, setUserData] = useState(null)
  const [currentFolder, setCurrentFolder] = useState(null)
  const [showLoginSection, setShowLoginSection] = useState(false)

  useEffect(() => {
    setFoldersVocab(folders);
    setAllFoldersVocab(allFolders);
  }, [folders, allFolders]);


  // Create a folder
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const createFolder = () => {
    if (userID == '') {
      setShowLoginSection(true)
    }
    else {
      setShowCreateFolder(!showCreateFolder)
    }
  }
  
    // Add folder to Firestore
  const addFolder = () => {
    if (folderName != '') {
      addFolderDB(userID, folderName)

      getUserData(userID).then((data) => {
        if (data) {
          setFoldersVocab(data.folders)
          setAllFoldersVocab(data.folders)
          setUserData(data)
        }
        else {
          setFoldersVocab([])
          setAllFoldersVocab([])
          // setUserData(data)
        }
      })
    }


    setFolderName('')
    setShowCreateFolder(false)
  }

  const navigate = useNavigate();
  const closeWordSection = () => {
    setCurrentFolder(null);
    navigate('/vocabulary');
  }

  console.log('Current Folder:', currentFolder);
  return (
    <div className="w-full h-full flex flex-col overflow-auto bg-primary-surface">
      <Routes>
        <Route 
          path={currentFolder ? `${currentFolder.replace(' ', '-')}` : 'folder'}
          element={
            <WordSection 
            userID={userID}
            currentFolder={currentFolder}
            onClose={closeWordSection}
            />
          }
        />
      </Routes>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 sm:px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className='text-3xl sm:text-4xl text-primary-text font-bold'>Quản lí bộ từ</h1>
            <p className='text-sm sm:text-base text-secondary-text mt-2'>Tổ chức và quản lý các bộ từ vựng của bạn</p>
          </div>
          <button
            onClick={createFolder}
            className='inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-bg px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:scale-105'
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className='hidden sm:inline text-sm font-medium'>Thêm thư mục</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4'>
          <div className='bg-bg rounded-lg p-2'>
            <div className='text-secondary-text text-xs font-medium'>TỔNG SỐ</div>
            <div className='text-lg font-bold text-primary-text mt-0.5'>{allFoldersVocab.length}</div>
          </div>
          <div className='bg-bg rounded-lg p-2'>
            <div className='text-secondary-text text-xs font-medium'>CẦN ÔN</div>
            <div className='text-lg font-bold text-success mt-0.5'>0</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 sm:px-6 py-4">
        <div className='relative max-w-md'>
          <FontAwesomeIcon icon={faMagnifyingGlass} className='absolute left-3 top-3 text-secondary-text text-sm' />
          <input
            className='w-full pl-10 pr-4 py-2 rounded-lg bg-bg text-primary-text transition-colors outline-none'
            type='text'
            placeholder='Tìm kiếm thư mục...'
            onChange={e => {
              const searchValue = e.target.value.toLowerCase();
              if (searchValue.length > 0) {
                const filteredFolders = allFoldersVocab.filter(folder =>
                  folder.name.toLowerCase().includes(searchValue)
                );
                setFoldersVocab(filteredFolders);
              } else {
                setFoldersVocab(allFoldersVocab);
              }
            }}
          />
        </div>
      </div>

      {/* Folder Grid */}
      <div className="flex-1 overflow-auto px-4 sm:px-6">
        {foldersVocab.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className='text-center'>
              <div className='text-5xl mb-4 opacity-20'>📁</div>
              <p className='text-lg text-secondary-text font-medium'>Chưa có thư mục nào</p>
              <p className='text-sm text-secondary-text mt-1'>Tạo thư mục đầu tiên để bắt đầu học</p>
              <button
                onClick={createFolder}
                className='mt-4 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-bg px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:scale-105'
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Tạo thư mục</span>
              </button>
            </div>
          </div>
        )}

        {foldersVocab.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {foldersVocab.map((folder, index) => {
              const reviewCount = folder.words ? folder.words.filter(w => {
                const currentDay = new Date();
                const currentYear = currentDay.getFullYear();
                const currentMonth = currentDay.getMonth();
                const currentDate = currentDay.getDate();
                
                return w.scheduleReview && w.scheduleReview.some(item => {
                  if (item.lastReview === null && item.reviewDates) {
                    return item.reviewDates.some(date => {
                      const reviewDate = new Date(date.seconds * 1000);
                      return reviewDate.getFullYear() === currentYear && 
                            reviewDate.getMonth() === currentMonth && 
                            reviewDate.getDate() === currentDate;
                    });
                  }
                  return false;
                });
              }).length : 0;
              let processedfolderName = folder.name.replace(' ', '-');
              return (
                <Link 
                  to={`/vocabulary/${processedfolderName}`}
                  key={index}
                  onClick={() => setCurrentFolder(folder.name)}
                  className='bg-bg rounded-lg p-4 cursor-pointer transition-all duration-200 shadow-md transform hover:scale-102'
                >
                  {/* Folder Header */}
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary flex-shrink-0'>
                      <FontAwesomeIcon icon={faFolder} />
                    </div>
                    <h3 className='text-base text-primary-text font-semibold truncate flex-1'>{folder.name}</h3>
                  </div>

                  {/* Stats Row */}
                  <div className='flex items-center gap-3 text-sm'>
                    <div className='flex-1'>
                      <p className='text-secondary-text text-xs'>Từ vựng</p>
                      <p className='text-primary-text font-semibold'>{folder.words.length}</p>
                    </div>
                    <div className='flex-1'>
                      <p className='text-secondary-text text-xs'>Cần ôn</p>
                      <p className={reviewCount > 0 ? 'text-wrong font-semibold' : 'text-secondary-text font-semibold'}>{reviewCount}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowCreateFolder(false)}>
          <div className="w-full max-w-md mx-4 bg-bg dark:bg-primary-surface rounded-xl shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h3 className='text-xl font-semibold text-primary-text'>Tạo thư mục</h3>
                <p className='text-sm text-secondary-text'>Đặt tên cho thư mục mới của bạn.</p>
              </div>
              <button onClick={() => setShowCreateFolder(false)} className='text-secondary-text hover:text-primary-text cursor-pointer'><FontAwesomeIcon icon={faX} /></button>
            </div>

            <label className='block text-sm text-secondary-text mb-1'>Tên thư mục</label>
            <input
              type='text'
              placeholder='Nhập tên thư mục...'
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && folderName.trim() !== '') addFolder(); }}
              className='w-full mb-4 px-4 py-2 rounded-lg border border-muted bg-bg text-primary-text focus:outline-none'
            />

            <div className='flex items-center justify-end gap-2'>
              <button onClick={() => { setShowCreateFolder(false); setFolderName(''); }} className='px-4 py-2 rounded-lg text-secondary-text hover:text-primary-text cursor-pointer'>Hủy</button>
              <button
                onClick={() => { if (folderName.trim() !== '') addFolder(); }}
                className={'px-4 py-2 rounded-lg text-bg ' + (folderName.trim() === '' ? 'bg-primary/40 cursor-not-allowed' : 'bg-primary cursor-pointer')}
                disabled={folderName.trim() === ''}
              >Tạo</button>
            </div>
          </div>
        </div>
      )}
      <Outlet />
    </div>
  )
}