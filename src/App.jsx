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
        <div className={"h-screen bg-bg flex flex-col justify-between select-none"} style={{width: expandSidebar ? '20%' : '80px'}}>
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
              className='flex items-center font-semibold justify-start gap-2.5 text-primary-text hover:bg-primary-surface rounded-lg w-full p-2 mt-2.5 cursor-pointer'
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
            <div className="sidebar-mobile" onClick={() => setShowMobileSidebar(false)}>
              <div className="sidebar" onClick={e => e.stopPropagation()}>
                <div className="logo">
                  <button className='mobile-sidebar-toggle cursor-pointer' onClick={() => setShowMobileSidebar(false)}><FontAwesomeIcon icon={faBars} /></button>
                  {/* <h1>Memo</h1> */}
                </div>

                <ul>
                  <li className={pageIndex === 0 ? 'clicked' : ''} onClick={() => {
                    setShowMobileSidebar(false)
                    setPageIndex(0)
                  }}><FontAwesomeIcon icon={faBookOpen} className='icon' /><span>Từ điển</span></li>
                  <li className={pageIndex === 1 ? 'clicked' : ''} onClick={() => {
                    setShowMobileSidebar(false)
                    setPageIndex(1)
                  }}><FontAwesomeIcon icon={faFolder} className='icon' /><span>Từ vựng</span></li>
                  <li className={pageIndex === 2 ? 'clicked' : ''} onClick={() => {
                    setShowMobileSidebar(false)
                    setPageIndex(2)
                  }}><FontAwesomeIcon icon={faTrophy} className='icon' /><span>Xếp hạng</span></li>
                </ul>
              </div>
            </div>
          )
        }

        <div className="bg-primary-surface relative" style={{width: expandSidebar ? '80%' : 'calc(100% - 80px)'}}>
          <div className="flex items-center justify-between absolute top-0 left-0 right-0">
            <div className="logo">
              <button className='mobile-sidebar-toggle cursor-pointer' onClick={() => setShowMobileSidebar(true)}><FontAwesomeIcon icon={faBars} /></button>
            </div>
            <div className="flex items-center gap-2.5 p-2">
              
              

              {showLogoutBtn && 
                <div></div>
              }
              
              
            </div>
          </div>
          
          {pageIndex === 0 && (
            <DictionarySection folderList={allFolders} userID={userID}/>
          )}
          {/* Folder management */}
          {pageIndex === 1 && (
            <div className="w-full pl-4 pr-4 pb-8">
              <div className="flex items-start justify-between gap-4 mt-4 mb-6">
                <div>
                  <h1 className='text-2xl text-primary-text font-bold'>Quản lí bộ từ</h1>
                  <p className='text-base text-secondary-text mt-1'>Quản lý từ của bạn ở đây.</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className='hidden sm:flex gap-3'>
                    <div className='p-3 rounded-lg bg-primary/10 text-primary-text text-sm'>
                      <div className='text-secondary-text text-xs'>Tổng số</div>
                      <div className='text-lg font-semibold'>{allFolders.length}</div>
                    </div>
                    <div className='p-3 rounded-lg bg-success/10 text-primary-text text-sm'>
                      <div className='text-secondary-text text-xs'>Cần ôn</div>
                      <div className='text-lg font-semibold'>0</div>
                    </div>
                  </div>

                  <div className='relative'>
                    <div className='relative'>
                      <FontAwesomeIcon icon={faMagnifyingGlass} className='absolute left-3 top-3.5 text-secondary-text' />
                      <input
                        className='pl-10 pr-4 py-2 rounded-lg bg-bg text-primary-text border border-transparent focus:border-muted focus:outline-none w-48 sm:w-64'
                        type='text'
                        placeholder='Search folder...'
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

                  <button
                    onClick={createFolder}
                    className='ml-2 inline-flex items-center gap-2 bg-primary text-bg px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer'
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    <span className='hidden sm:inline'>Thêm thư mục</span>
                  </button>
                </div>
              </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {folders.length === 0 && (
                  <div className="col-span-full py-12">
                    <p className='text-center text-secondary-text'>Chưa có thư mục nào.</p>
                  </div>
                )}

                {folders.map((folder, index) => (
                  <div
                    key={index}
                    className='bg-bg rounded-xl p-4 shadow-sm hover:shadow-lg cursor-pointer transform hover:-translate-y-1 transition'
                    onClick={() => openWordSection(folder.name)}
                  >
                    <div className='flex items-center gap-3'>
                      <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
                        <FontAwesomeIcon icon={faFolder} />
                      </div>
                      <div className='flex-1'>
                        <h3 className='text-lg text-primary-text font-semibold'>{folder.name}</h3>
                        <p className='text-sm text-secondary-text'>{folder.words.length} words</p>
                      </div>
                    </div>
                    <div className='mt-3'>
                      <ReviewWordsNums folder={folder} />
                    </div>
                  </div>
                ))}
              </div>
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
        <div className="fixed top-0 bottom-0 right-0 left-0 bg-black/50 flex items-center justify-center" onClick={() => setShowLoginSection(false)}>
          <div className="p-5 bg-bg rounded-lg relative"  onClick={e => e.stopPropagation()}>
            <button className='quit-btn absolute top-2.5 right-2.5 cursor-pointer' onClick={() => setShowLoginSection(false)}><FontAwesomeIcon icon={faXmark} /></button>
            <h1 className='text-center text-2xl mb-2.5 text-secondary-text'>Đăng nhập</h1>
            <div className="login-options">
              <button 
                onClick={loginWithGoogle}
                className='flex items-center gap-2.5 bg-primary-surface p-2.5 rounded-lg w-full justify-center text-secondary-text cursor-pointer'
              ><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/800px-Google_%22G%22_logo.svg.png" alt="" className='h-10'/>Tiếp tục với Google</button>
              {/* <button><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/500px-Facebook_Logo_%282019%29.png" alt="" />Continue with Facebook</button> */}
            </div>
          </div>
        </div>
      )}

      {showLogoutSection && (
        <div className="logout-section" onClick={() => setShowLogoutSection(false)}>
          <div className="logout-container" onClick={e => e.stopPropagation()}>
            <h2>Bạn có muốn đăng xuất không?</h2>
            <div className="logout-options">
              <button onClick={() => {
                exitAccount()
                setShowLogoutSection(false)
              }} className='cursor-pointer'>Có, đăng xuất</button>
              <button onClick={() => setShowLogoutSection(false)} className='goBack cursor-pointer'>Không, quay lại</button>
            </div>
          </div>
        </div>
      )}

      {showSettingPage && <SettingPage onClose={() => setShowSettingPage(false)} userAvatar={avatarUrl} userName={userName}/>}
      
    </div>
  )
}

export default App