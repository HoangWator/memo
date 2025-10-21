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
          const folderKeys = Object.keys(data.folders);
          setFolders(folderKeys);
          setAllFolders(folderKeys); // <-- keep the full list
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
            setFolders(Object.keys(data.folders));
            setAllFolders(Object.keys(data.folders))
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
          setFolders(Object.keys(data.folders))
          setAllFolders(Object.keys(data.folders))
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
      setFolders(Object.keys(data.folders));
      setAllFolders(Object.keys(data.folders));
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

    let wordsInFolder = userData.folders[folder]
    let wordsToReview = getWordsToReview(wordsInFolder)

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
        <div className={"h-screen bg-primary-surface flex flex-col justify-between select-none"} style={{width: expandSidebar ? '20%' : '80px'}}>
          <div className={'pl-2.5 pr-2.5 ' +  (expandSidebar ? '' : 'flex flex-col items-center')}>
            <div 
              className='mt-2.5 h-9 w-9 cursor-pointer rounded-full flex items-center justify-center hover:bg-secondary-surface'
              onClick={() => setExpandSidebar(!expandSidebar)}  
            >
              <FontAwesomeIcon icon={faBars} className='text-primary' />
            </div>

            <ul className='mt-2.5'>
              <li 
                className={'p-2.5 rounded-lg cursor-pointer mb-1 flex gap-2.5 items-center hover:bg-secondary-surface ' + (pageIndex === 0 ? 'text-primary bg-secondary-surface border-l-4 border-primary' : 'text-secondary-text hover:text-primary-text') + (expandSidebar ? '' : ' justify-center')} 
                onClick={() => setPageIndex(0)}
              >
                <FontAwesomeIcon icon={faBookOpen} className='pt-[5px] pb-[5px]'/>{expandSidebar && <span>Dictionary</span> }
              </li>
              <li 
                className={'p-2.5 rounded-lg cursor-pointer mb-1 flex gap-2.5 items-center hover:bg-secondary-surface ' + (pageIndex === 1 ? 'text-primary bg-secondary-surface border-l-4 border-primary' : 'text-secondary-text hover:text-primary-text') + (expandSidebar ? '' : ' justify-center')} 
                onClick={() => setPageIndex(1)}
              >
                <FontAwesomeIcon icon={faFolder} className='pt-[5px] pb-[5px]' />{expandSidebar && <span>Vocabulary</span>}
              </li>
              <li 
                className={'p-2.5 rounded-lg cursor-pointer mb-1 flex gap-2.5 items-center hover:bg-secondary-surface ' + (pageIndex === 3 ? 'text-primary bg-secondary-surface border-l-4 border-primary' : 'text-secondary-text hover:text-primary-text') + (expandSidebar ? '' : ' justify-center')} 
                onClick={() => setPageIndex(3)}
              >
                <FontAwesomeIcon icon={faTrophy} className='pt-[5px] pb-[5px]' />{expandSidebar && <span>Rank</span>}
              </li>
            </ul>
          </div>

          <div className='m-2.5 border-t-1 border-t-muted'>
            <button 
              className='flex items-center justify-start gap-2.5 text-secondary-text hover:bg-secondary-surface rounded-lg w-full p-2 mt-2.5 cursor-pointer'
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
                userID ? userName : 'Sign in'
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
                  <button className='mobile-sidebar-toggle'onClick={() => setShowMobileSidebar(false)}><FontAwesomeIcon icon={faBars} /></button>
                  {/* <h1>Memo</h1> */}
                </div>

                <ul>
                  <li className={pageIndex === 0 ? 'clicked' : ''} onClick={() => {
                    setShowMobileSidebar(false)
                    setPageIndex(0)
                  }}><FontAwesomeIcon icon={faBookOpen} className='icon' /><span>Dictionary</span></li>
                  <li className={pageIndex === 1 ? 'clicked' : ''} onClick={() => {
                    setShowMobileSidebar(false)
                    setPageIndex(1)
                  }}><FontAwesomeIcon icon={faFolder} className='icon' /><span>Vocabulary</span></li>
                  <li className={pageIndex === 2 ? 'clicked' : ''} onClick={() => {
                    setShowMobileSidebar(false)
                    setPageIndex(2)
                  }}><FontAwesomeIcon icon={faTrophy} className='icon' /><span>Rank</span></li>
                </ul>
              </div>
            </div>
          )
        }

        <div className="bg-bg relative" style={{width: expandSidebar ? '80%' : 'calc(100% - 80px)'}}>
          <div className="flex items-center justify-between absolute top-0 left-0 right-0">
            <div className="logo">
              <button className='mobile-sidebar-toggle'onClick={() => setShowMobileSidebar(true)}><FontAwesomeIcon icon={faBars} /></button>
            </div>
            <div className="flex items-center gap-2.5 p-2">
              
              

              {showLogoutBtn && 
                <button className='logoutBtn' onClick={() => {
                  setShowLogoutSection(true)
                  setShowLogoutBtn(false)
                }}>Log out<FontAwesomeIcon icon={faArrowRightFromBracket} /></button>
              }
              
              
            </div>
          </div>
          
          {pageIndex === 0 && (
            <DictionarySection folderList={allFolders} userID={userID}/>
          )}
          {/* Folder management */}
          {pageIndex === 1 && (
            <div className="w-full h-screen pl-2.5 pr-2.5 overflow-auto">
              <h1 className='text-2xl text-primary-text mt-2.5'>Folder overview</h1>
              <p className='text-base text-secondary-text'>Mange your words here.</p>
              <div className='flex gap-2.5 pb-2.5 border-b-1 border-b-muted mb-2.5'>
                <div className='bg-secondary-surface flex flex-col items-center gap-2.5 p-4 rounded-lg mt-2.5 mb-2.5 border-l-4 border-l-primary'>
                  <p className='text-secondary-text'>Total Folders</p>
                  <h2 className='text-primary-text text-3xl font-bold'>{allFolders.length}</h2>
                </div>
                <div className='bg-secondary-surface flex flex-col items-center gap-2.5 p-4 rounded-lg mt-2.5 mb-2.5 border-l-4 border-l-wrong'>
                  <p className='text-secondary-text'>Need to Review</p>
                  <h2 className='text-primary-text text-3xl font-bold'>6</h2>
                </div>
              </div>
              
              {showCreateFolder && (
                <div className="fixed top-0 bottom-0 right-0 left-0 bg-black/50 flex items-center justify-center z-1" onClick={() => setShowCreateFolder(false)}>
                  <div className="w-100 bg-secondary-surface p-2.5 rounded-lg relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setShowCreateFolder(false)} className='quit-btn absolute right-2.5 top-2.5'><FontAwesomeIcon icon={faX} /></button>
                    <h3 className='text-2xl text-primary-text text-center mt-4 mb-4'>Create a folder</h3>
                    <input 
                      type="text" 
                      placeholder='Enter folder name...' 
                      onChange={e => setFolderName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          addFolder();
                        }
                      }}
                      className='mt-2.5 w-full pt-2.5 pb-2.5 pl-5 pr-5 outline-none border-none bg-bg text-primary-text text-base rounded-full'
                      value={folderName}
                    />
                    <div className='text-center'>
                      <button 
                        onClick={addFolder}
                        className='mt-2.5 click-btn'
                      >Add folder</button>
                    </div>
                  </div>
                </div>
              )}
              <div className='flex items-center gap-2.5'>
                <div className="search-folder">
                  <div className="search-field relative">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className='absolute left-3 top-3.75 text-secondary-text' />
                    <input 
                    className='input-field pl-9'
                      type="text" 
                      placeholder='Search folder...'
                      onChange={e => {
                        const searchValue = e.target.value.toLowerCase();
                        if (searchValue.length > 0) {
                          const filteredFolders = allFolders.filter(folder =>
                            folder.toLowerCase().includes(searchValue)
                          );
                          setFolders(filteredFolders);
                        } else {
                          setFolders(allFolders);
                        }
                      }}
                    />
                  </div>
                </div>
                <button className='click-btn' onClick={createFolder}>
                  <FontAwesomeIcon className='text-base' icon={faPlus} /><span> Create folder</span>
                </button>

              </div>
              <div className="flex gap-2.5 flex-wrap mt-2.5">
                {folders.length === 0 && (
                  <div className="w-full pt-15">
                    <p className='text-center text-secondary-text'>No folders yet.</p>
                  </div>
                )}
                {folders.map((folder, index) => (
                  <div className="folder-item bg-secondary-surface p-4 rounded-lg min-w-37.5 relative cursor-pointer" key={index}>
                    <div className="" onClick={() => openWordSection(folder)}>
                      <div className='flex gap-2.5 items-center'>
                        <FontAwesomeIcon icon={faFolder} className='folder-icon text-primary text-2xl' />
                        <h2 className='text-xl text-secondary-text'>{folder}</h2>
                      </div>
                      <p className='text-secondary-text mt-2.5'>Total items:<span className='ml-2.5 font-bold text-primary-text'>{userData.folders[folder].length || 0} words</span></p>
                      <ReviewWordsNums folder={folder}/>
                      {/* <div className="more" onClick={(e) => {e.stopPropagation()}}>
                        <FontAwesomeIcon icon={faEllipsis} />
                        <div className="more-options">
                          <button className='edit-folder-btn' onClick={() => {
                            setShowRenameFolderSection(true)
                            setRenameTarget(folder)
                          }}><FontAwesomeIcon icon={faPenToSquare} /> Rename</button>
                          <button className='delete-folder-btn' onClick={() => {
                            setShowAskToDelete(true)
                            setRenameTarget(folder)
                          }}><FontAwesomeIcon icon={faTrash} /> Delete</button>
                        </div>
                      </div> */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pageIndex === 3 && (
            <div className="w-full h-screen flex items-center justify-center">
              <h2 className='text-secondary-text'>Comming soon!</h2>
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
        <div className="login-section" onClick={() => setShowLoginSection(false)}>
          <div className="login-container"  onClick={e => e.stopPropagation()}>
            <button className='quitLogin' onClick={() => setShowLoginSection(false)}><FontAwesomeIcon icon={faXmark} /></button>
            <h1>Sign in</h1>
            <div className="login-options">
              <button onClick={loginWithGoogle}><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/800px-Google_%22G%22_logo.svg.png" alt="" />Continue with Google</button>
              {/* <button><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/500px-Facebook_Logo_%282019%29.png" alt="" />Continue with Facebook</button> */}
            </div>
          </div>
        </div>
      )}

      {showLogoutSection && (
        <div className="logout-section" onClick={() => setShowLogoutSection(false)}>
          <div className="logout-container" onClick={e => e.stopPropagation()}>
            <h2>Do you want to log out?</h2>
            <div className="logout-options">
              <button onClick={() => {
                exitAccount()
                setShowLogoutSection(false)
              }}>Yes, log out</button>
              <button onClick={() => setShowLogoutSection(false)} className='goBack'>No, come back</button>
            </div>
          </div>
        </div>
      )}

      {showSettingPage && <SettingPage onClose={() => setShowSettingPage(false)} userAvatar={avatarUrl} userName={userName}/>}
      
    </div>
  )
}

export default App