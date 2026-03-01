import { useState } from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';
import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import './responsive.css'
import ReactDOM from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus,faBookOpen,faBars,faGear,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'
import useSound from 'use-sound';
import { getWordData } from './components/gemini.js'
import { signInWithPopup,signOut  } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { auth, db, googleProvider } from './firebase-config.js'
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { isAlreadyLogin } from './components/handleData.js'
import { addUser } from './components/handleData.js'
import { getUserData } from './components/handleData.js'
import { addFolderDB, deleteFolderDB, renameFolderDB } from './components/handleData.js'


import WordSection from './components/WordSection.jsx'
import Loader from './components/Loader.jsx'
import { DictionarySection } from './components/DictionarySection.jsx'
import { SettingPage } from './components/SettingPage.jsx';



function App() {
  const [userID, setUserID] = useState('')
  const [userName, setUserName] = useState('')
  const [userData, setUserData] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const [folderName, setFolderName] = useState('')
  const [folders, setFolders] = useState([])
  const [allFolders, setAllFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState('')

  const [wordsToReview, setWordsToReview] = useState('')

  const [showLoginSection, setShowLoginSection] = useState(false)
  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // The signed-in user info.
      const user = result.user;
      setUserID(user.uid)
      setUserName(user.displayName);
      setAvatarUrl(user.photoURL);

      // Check if user has logged in before
      isAlreadyLogin(user.uid).then(data => {
        if (data) {
          
        }
        else {
          addUser(user.uid)
        }
      })

      // Get user's folders
      getUserData(user.uid).then((data) => {
        if (data) {
          setFolders(data.folders);
          setAllFolders(data.folders); // <-- keep the full list
          setUserData(data);
        } else {
          setFolders([]);
          setAllFolders([]);
        }
      }).catch(error => {
        alert("Please try again later.")
      });
      
      setShowLoginSection(false)
    } catch (error) {
      alert(error.message);
    }

  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserID(user.uid);
        setUserName(user.displayName);
        setAvatarUrl(user.photoURL);
        setLoader(true)
        // Optionally, fetch user data here
        getUserData(user.uid).then((data) => {
          if (data) {
            setFolders(data.folders);
            setAllFolders(data.folders)
            setUserData(data);
          } else {
            setFolders([]);
          }
          setLoader(false)
        });
      } else {
        setUserID('');
        setUserName('');
        setAvatarUrl('');
        setFolders([]);
        setAllFolders([])
        setUserData('');
      }
    });

    return () => unsubscribe();
  }, []);

  
  
  // Logout section
  const [showLogoutSection, setShowLogoutSection] = useState(false)
  const exitAccount = () => {
    signOut(auth).then(() => {
      setUserID('');
      setUserName('');
      setAvatarUrl('');
      setShowLoginSection(true); // Show login popup for new account
    });
  }

  

  // Directing page
  const [pageIndex, setPageIndex] = useState(0)

  useEffect(() => {
    getUserData(userID).then((data) => {
        if (data) {
          setFolders(data.folders)
          setAllFolders(data.folders)
          setUserData(data)
        }
        else {
          setFolders([])
          setAllFolders([])
          // setUserData(data)
        }
      })
  }, [pageIndex])
  
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
          setFolders(data.folders)
          setAllFolders(data.folders)
          setUserData(data)
        }
        else {
          setFolders([])
          setAllFolders([])
          // setUserData(data)
        }
      })
    }


    setFolderName('')
    setShowCreateFolder(false)
  }

  

  // Rename folder
  const [showRenameFolderSection, setShowRenameFolderSection] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [renameTarget, setRenameTarget] = useState(null);

  

  const [showAskToDelete, setShowAskToDelete] = useState(false)

  // Open folder
  const [showWordSection, setShowWordSection] = useState(false)
  const openWordSection = (folderName) => {
    setShowWordSection(true)
    setShowCreateFolder(false)
    setCurrentFolder(folderName)
  }
  // Close folder
  const quitWordSection = () => {
    setShowWordSection(false)
    setCurrentFolder('')
    getUserData(userID).then((data) => {
      // console.log(data)
      setUserData(data)
      setFolders(data.folders);
      setAllFolders(data.folders);
    })
    console.log('Quit word section')
  }

  // useEffect(() => {
  //   if (userID !== '') {
  //     getUserData(userID).then((data) => {
  //       if (data) {
  //         console.log(data)
  //         setFolders(Object.keys(data.folders));
  //         setAllFolders(Object.keys(data.folders));
  //         setUserData(data);
  //       } else {
  //         setFolders([]);
  //         setAllFolders([]);
  //       }
  //     });
  //     console.log('User data fetched successfully');
  //   }
  // }, [showWordSection]);

  function ReviewWordsNums({folder}) {
    // Input: words in a folder
    // Output: an array of words to review
    function getWordsToReview(words) {
      const currentDay = new Date()
      let wordsToReview = []
      words.forEach(word => {
        let schedule = word.scheduleReview
        let currentYear = currentDay.getFullYear()
        let currentMonth = currentDay.getMonth()
        let currentDate = currentDay.getDate()

        if (schedule) {
          let isReviewDay = schedule.some(date => {
            const dateReview = new Date(date.seconds * 1000)
            return (
              dateReview.getFullYear() === currentYear &&
              dateReview.getMonth() === currentMonth && 
              dateReview.getDate() === currentDate
            )
          }
          )
          if (isReviewDay) {
            wordsToReview.push(word)
          }
        }
      })

      return wordsToReview
    }

    let wordsToReview = getWordsToReview(folder.words || [])

    if (wordsToReview.length > 0) {
      return (
        <p className='h-6 text-base text-secondary-text  inline-flex rounded-lg items-center gap-1'>Need review: <span className='font-bold text-wrong'>{wordsToReview.length} words</span></p>
      )
    }
    else {
      return null
    }
  }

  const [showLogoutBtn, setShowLogoutBtn] = useState(false)

  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  const [loader, setLoader] = useState(false)

  const [showSettingPage, setShowSettingPage] = useState(false)

  const [expandSidebar, setExpandSidebar] = useState(true)

  return (
    <div className="main">
      {loader && <Loader />}
      
      <div className="w-full h-screen flex">
        <div className={"hidden sm:flex h-screen bg-bg flex-col justify-between select-none"} style={{width: expandSidebar ? '20%' : '80px'}}>
          <div className={'pl-2.5 pr-2.5 ' +  (expandSidebar ? '' : 'flex flex-col items-center')}>
            <div 
              className='mt-2.5 h-9 w-9 cursor-pointer rounded-full flex items-center justify-center hover:bg-primary-surface'
              onClick={() => setExpandSidebar(!expandSidebar)}  
            >
              <FontAwesomeIcon icon={faBars} className='text-primary' />
            </div>

            <ul className='mt-2.5'>
              <li 
                className={'p-2.5 rounded-lg cursor-pointer mb-1 flex gap-2.5 items-center hover:bg-primary-surface ' + (pageIndex === 0 ? 'text-primary bg-primary-surface border-l-4 border-primary' : 'text-secondary-text') + (expandSidebar ? '' : ' justify-center')} 
                onClick={() => setPageIndex(0)}
              >
                <FontAwesomeIcon icon={faBookOpen} className='pt-[5px] pb-[5px]'/>{expandSidebar && <span>Từ điển</span> }
              </li>
              <li 
                className={'p-2.5 rounded-lg cursor-pointer mb-1 flex gap-2.5 items-center hover:bg-primary-surface ' + (pageIndex === 1 ? 'text-primary bg-primary-surface border-l-4 border-primary' : 'text-secondary-text') + (expandSidebar ? '' : ' justify-center')} 
                onClick={() => setPageIndex(1)}
              >
                <FontAwesomeIcon icon={faFolder} className='pt-[5px] pb-[5px]' />{expandSidebar && <span>Từ vựng</span>}
              </li>
              <li 
                className={'p-2.5 rounded-lg cursor-pointer mb-1 flex gap-2.5 items-center hover:bg-primary-surface ' + (pageIndex === 3 ? 'text-primary bg-primary-surface border-l-4 border-primary' : 'text-secondary-text') + (expandSidebar ? '' : ' justify-center')} 
                onClick={() => setPageIndex(3)}
              >
                <FontAwesomeIcon icon={faTrophy} className='pt-[5px] pb-[5px]' />{expandSidebar && <span>Xếp hạng</span>}
              </li>
            </ul>
          </div>

          <div className='m-2.5 border-t-1 border-t-muted'>
            <button 
              className='cursor-pointer hidden sm:flex items-center font-semibold justify-start gap-2.5 text-primary-text hover:bg-primary-surface rounded-lg w-full p-2 mt-2.5'
              onClick={() => {
                if (userID == '') {
                  setShowLoginSection(true)
                }
                else {
                  setShowLogoutBtn(!showLogoutBtn)
                  setShowSettingPage(true)
                }
              }}>
              <img 
                src={avatarUrl || 'https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png'}
                alt=""
                style={{ width: 32, height: 32, borderRadius: "50%" }} 
              />
              {expandSidebar && (
                userID ? userName : 'Đăng nhập'
              )}
            </button>
            {/* <button 
              className='bg-secondary-surface rounded-full text-primary-text cursor-pointer h-10 w-10 flex items-center justify-center'
              onClick={() => setShowSettingPage(true)}  
            ><FontAwesomeIcon icon={faGear} /></button> */}
          </div>
        </div>
        {
          showMobileSidebar && (
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowMobileSidebar(false)}>
              <div className="absolute left-0 top-0 bottom-0 w-64 bg-bg" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 ">
                  <button className='text-primary cursor-pointer' onClick={() => setShowMobileSidebar(false)}><FontAwesomeIcon icon={faBars} /></button>
                </div>

                <ul className='p-4'>
                  <li 
                    className={'p-2.5 rounded-lg cursor-pointer mb-1 flex gap-2.5 items-center hover:bg-primary-surface ' + (pageIndex === 0 ? 'text-primary bg-primary-surface border-l-4 border-primary ' : 'text-secondary-text') + (expandSidebar ? '' : ' justify-center')} 
                    onClick={() => {
                      setShowMobileSidebar(false)
                      setPageIndex(0)
                    }}><FontAwesomeIcon icon={faBookOpen} className='icon' /><span>Từ điển</span></li>
                  <li 
                    className={'p-2.5 rounded-lg cursor-pointer mb-1 flex gap-2.5 items-center hover:bg-primary-surface ' + (pageIndex === 1 ? 'text-primary bg-primary-surface border-l-4 border-primary ' : 'text-secondary-text') + (expandSidebar ? '' : ' justify-center')} 
                    onClick={() => {
                      setShowMobileSidebar(false)
                      setPageIndex(1)
                    }}><FontAwesomeIcon icon={faFolder} className='icon' /><span>Từ vựng</span></li>
                  <li 
                    className={'p-2.5 rounded-lg cursor-pointer mb-1 flex gap-2.5 items-center hover:bg-primary-surface ' + (pageIndex === 2 ? 'text-primary bg-primary-surface border-l-4 border-primary ' : 'text-secondary-text') + (expandSidebar ? '' : ' justify-center')} 
                    onClick={() => {
                      setShowMobileSidebar(false)
                      setPageIndex(2)
                    }}><FontAwesomeIcon icon={faTrophy} className='icon' /><span>Xếp hạng</span></li>
                </ul>
              </div>
            </div>
          )
        }

        <div className="bg-primary-surface relative flex-1">
          <div className="sm:hidden flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="logo">
              <button 
                className='text-primary cursor-pointer sm:hidden p-4'
                onClick={() => setShowMobileSidebar(true)}
              ><FontAwesomeIcon icon={faBars} /></button>
            </div>
            <div className="flex items-center gap-2.5 p-2 cursor-pointer">
              <button
                onClick={() => {
                  if (userID == '') {
                    setShowLoginSection(true)
                  } else {
                    setShowLogoutBtn(!showLogoutBtn)
                    setShowSettingPage(true)
                  }
                }}
                className='cursor-pointer flex sm:hidden items-center gap-2.5 text-primary-text hover:bg-primary-surface rounded-lg p-2'
              >
                <img
                  src={avatarUrl || 'https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png'}
                  alt=""
                  style={{ width: 32, height: 32, borderRadius: '50%' }}
                />
              </button>
            </div>
          </div>
          
          {pageIndex === 0 && (
            <DictionarySection folderList={allFolders} userID={userID}/>
          )}
          {/* Folder management */}
          {pageIndex === 1 && (
            <div className="w-full h-full flex flex-col overflow-auto bg-primary-surface">
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
                    <div className='text-lg font-bold text-primary-text mt-0.5'>{allFolders.length}</div>
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
                        const filteredFolders = allFolders.filter(folder =>
                          folder.name.toLowerCase().includes(searchValue)
                        );
                        setFolders(filteredFolders);
                      } else {
                        setFolders(allFolders);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Folder Grid */}
              <div className="flex-1 overflow-auto px-4 sm:px-6">
                {folders.length === 0 && (
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

                {folders.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {folders.map((folder, index) => {
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

                      return (
                        <div
                          key={index}
                          onClick={() => openWordSection(folder.name)}
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
                        </div>
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
            </div>
          )}

          {pageIndex === 3 && (
            <div className="w-full h-screen flex items-center justify-center">
              <h2 className='text-secondary-text'>Sắp ra mắt!</h2>
            </div>
          )}

        </div>
      </div>
      
      {showWordSection && <WordSection 
        onClose={quitWordSection}
        currentFolder={currentFolder}  
        userID={userID}
      />}

      {showLoginSection && (
        <div className="fixed top-0 bottom-0 right-0 left-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center z-50">
          {/* Left Side - Branding & Features (Hidden on Mobile) */}
          <div className='hidden lg:flex lg:w-1/2 flex-col justify-center items-start px-12 text-white'>
            <div className='mb-12'>
              <h1 className='text-5xl font-bold mb-4'>Memo</h1>
              <p className='text-xl text-white/80'>Học từ vựng một cách hiệu quả với hệ thống luyện tập thông minh</p>
            </div>

            <div className='space-y-6'>
              <div className='flex items-start gap-4'>
                <div className='h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0'>
                  <FontAwesomeIcon icon={faBookOpen} className='text-white text-xl' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold mb-1'>Học Vocab Hiệu Quả</h3>
                  <p className='text-white/70'>Sử dụng các phương pháp học tập khoa học giúp ghi nhớ lâu dài</p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0'>
                  <FontAwesomeIcon icon={faDumbbell} className='text-white text-xl' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold mb-1'>Luyện Tập Đa Dạng</h3>
                  <p className='text-white/70'>Flashcards, matching, listening và nhiều hình thức luyện tập khác</p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0'>
                  <FontAwesomeIcon icon={faChartSimple} className='text-white text-xl' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold mb-1'>Theo Dõi Tiến Độ</h3>
                  <p className='text-white/70'>Xem thống kê chi tiết về tiến độ học tập của bạn</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className='w-full lg:w-1/2 flex items-center justify-center px-4'>
            <div className='w-full max-w-md bg-bg dark:bg-primary-surface rounded-2xl shadow-2xl p-8'>
              <div className='text-center mb-8'>
                <h2 className='text-3xl font-bold text-primary-text mb-2'>Chào mừng trở lại</h2>
                <p className='text-secondary-text'>Đăng nhập để tiếp tục hành trình học tập của bạn</p>
              </div>

              <button 
                onClick={loginWithGoogle}
                className='w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all transform hover:scale-105 shadow-lg mb-6'
              >
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWIl8zC8WAMHi5JVmKUb3YVvZd5gvoCdy-NQ&s" 
                  alt="Google" 
                  className='h-5 w-5 rounded-full bg-white p-1' 
                />
                Đăng nhập với Google
              </button>

              <div className='relative mb-6'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-muted'></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 bg-bg text-secondary-text'>hoặc</span>
                </div>
              </div>

              <button 
                onClick={() => setShowLoginSection(false)}
                className='w-full flex items-center justify-center gap-2 bg-secondary-surface hover:bg-secondary-surface/80 text-primary-text px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all'
              >
                <FontAwesomeIcon icon={faArrowRight} />
                Tiếp tục dưới dạng khách
              </button>

              <div className='mt-8 pt-6 border-t border-muted text-center'>
                <p className='text-xs text-secondary-text'>
                  Bằng cách đăng nhập, bạn đồng ý với <a href="#" className='text-primary hover:underline font-semibold'>Điều khoản sử dụng</a> và <a href="#" className='text-primary hover:underline font-semibold'>Chính sách bảo mật</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogoutSection && (
        <div className="fixed top-0 bottom-0 right-0 left-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowLogoutSection(false)}>
          <div className="w-full max-w-md mx-4 bg-bg dark:bg-primary-surface rounded-xl shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h2 className='text-xl font-semibold text-primary-text'>Đăng xuất</h2>
                <p className='text-sm text-secondary-text mt-1'>Bạn có chắc chắn muốn đăng xuất không?</p>
              </div>
              <button onClick={() => setShowLogoutSection(false)} className='text-secondary-text hover:text-primary-text cursor-pointer'><FontAwesomeIcon icon={faX} /></button>
            </div>

            <div className='flex items-center justify-end gap-3 mt-6'>
              <button 
                onClick={() => setShowLogoutSection(false)} 
                className='px-4 py-2 rounded-lg text-secondary-text hover:text-primary-text hover:bg-primary-surface cursor-pointer transition-colors'
              >
                Hủy
              </button>
              <button 
                onClick={() => {
                  exitAccount()
                  setShowLogoutSection(false)
                }} 
                className='px-4 py-2 rounded-lg bg-wrong hover:bg-wrong/90 text-white cursor-pointer transition-colors font-medium'
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingPage && 
        <SettingPage 
          onClose={() => setShowSettingPage(false)} 
          userAvatar={avatarUrl} 
          userName={userName}
          openLogoutSection={() => setShowLogoutSection(true)}  
        />}
      
    </div>
  )
}

export default App