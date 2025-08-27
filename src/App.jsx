import { useState } from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';
import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import './responsive.css'
import ReactDOM from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus,faBookOpen,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'
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
        <span>{wordsToReview.length}</span>
      )
    }
    else {
      return null
    }
  }

  const [showLogoutBtn, setShowLogoutBtn] = useState(false)

  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  const [loader, setLoader] = useState(false)

  return (
    <div className="main">
      {loader && <Loader />}
      
      <div className="content">
        <div className="sidebar pc">
          <h1 style={{'userSelect': 'none'}}>Memo</h1>

          <ul>
            <li className={pageIndex === 0 ? 'clicked' : ''} onClick={() => setPageIndex(0)}><FontAwesomeIcon icon={faBookOpen} className='icon'/><span>Dictionary</span></li>
            <li className={pageIndex === 1 ? 'clicked' : ''} onClick={() => setPageIndex(1)}><FontAwesomeIcon icon={faFolder} className='icon' /><span>Vocabulary</span></li>
            <li className={pageIndex === 2 ? 'clicked' : ''} onClick={() => setPageIndex(2)}><FontAwesomeIcon icon={faDumbbell} className='icon' /><span>Review</span></li>
            <li className={pageIndex === 3 ? 'clicked' : ''} onClick={() => setPageIndex(3)}><FontAwesomeIcon icon={faTrophy} className='icon' /><span>Rank</span></li>
            <li className={pageIndex === 4 ? 'clicked' : ''} onClick={() => setPageIndex(4)}><FontAwesomeIcon icon={faChartSimple} className='icon' /><span>Progress</span></li>
          </ul>
        </div>
        {
          showMobileSidebar && (
            <div className="sidebar-mobile" onClick={() => setShowMobileSidebar(false)}>
              <div className="sidebar" onClick={e => e.stopPropagation()}>
                <div className="logo">
                  <button className='mobile-sidebar-toggle'onClick={() => setShowMobileSidebar(false)}><FontAwesomeIcon icon={faBars} /></button>
                  <h1>Memo</h1>
                </div>

                <ul>
                  <li className={pageIndex === 0 ? 'clicked' : ''} onClick={() => {
                    setShowMobileSidebar(false)
                    setPageIndex(0)
                  }}><FontAwesomeIcon icon={faFolder} className='icon' /><span>Vocabulary</span></li>
                  <li className={pageIndex === 1 ? 'clicked' : ''} onClick={() => {
                    setShowMobileSidebar(false)
                    setPageIndex(1)
                  }}><FontAwesomeIcon icon={faDumbbell} className='icon' /><span>Practice</span></li>
                  <li className={pageIndex === 2 ? 'clicked' : ''} onClick={() => {
                    setShowMobileSidebar(false)
                    setPageIndex(2)
                  }}><FontAwesomeIcon icon={faTrophy} className='icon' /><span>Rank</span></li>
                  <li className={pageIndex === 3 ? 'clicked' : ''} onClick={() => {
                    setShowMobileSidebar(false)
                    setPageIndex(3)
                  }}><FontAwesomeIcon icon={faChartSimple} className='icon' /><span>Progress</span></li>
                </ul>
              </div>
            </div>
          )
        }

        <div className="main-content">
          <div className="header">
            <div className="logo">
              <button className='mobile-sidebar-toggle'onClick={() => setShowMobileSidebar(true)}><FontAwesomeIcon icon={faBars} /></button>
              <h1>Memo</h1>
            </div>
            <div className="account-section">
              <button onClick={() => {
                if (userID == '') {
                  setShowLoginSection(true)
                }
                else {
                  setShowLogoutBtn(!showLogoutBtn)
                }
              }}>
                <img 
                  src={avatarUrl || 'https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png'}
                  alt=""
                  style={{ width: 32, height: 32, borderRadius: "50%" }} 
                />
                {userID ? userName : 'Sign in'}
              </button>

              {showLogoutBtn && 
                <button className='logoutBtn' onClick={() => {
                  setShowLogoutSection(true)
                  setShowLogoutBtn(false)
                }}>Log out<FontAwesomeIcon icon={faArrowRightFromBracket} /></button>
              }
              
              
            </div>
          </div>
          
          {pageIndex === 0 && (
            <DictionarySection />
          )}
          {pageIndex === 1 && (
            <div className="vocabulary-section">
              <button className='add-folder-btn' onClick={createFolder}><FontAwesomeIcon className='icon' icon={faPlus} />  <span>Create folder</span></button>
              {showCreateFolder && (
                <div className="create-folder-section" onClick={() => setShowCreateFolder(false)}>
                    <div className="create-folder-field" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setShowCreateFolder(false)} className='close-create-folder-btn'><FontAwesomeIcon icon={faX} /></button>
                      <h3>Create a folder</h3>
                      <input 
                        type="text" 
                        placeholder='Enter folder name' 
                        onChange={e => setFolderName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            addFolder();
                          }
                        }}
                        value={folderName}
                      />
                      <button onClick={addFolder}>Add folder</button>
                    </div>
                </div>
              )}
              <div className="search-folder">
                <div className="search-field">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className='search-icon' />
                  <input 
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
              <div className="folder-list">
                {folders.length === 0 && (
                  <div className="folder-list-empty">
                    <p>No folders yet.</p>
                  </div>
                )}
                {folders.map((folder, index) => (
                  <div className="folder-item" key={index}>
                    <div className="folder" onClick={() => openWordSection(folder)}>
                      <ReviewWordsNums folder={folder}/>
                      <FontAwesomeIcon icon={faFolder} className='folder-icon' />
                      <h2>{folder}</h2>
                      <p>{userData.folders[folder].length || 0} words</p>
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

          {pageIndex === 2 && (
            <div className="practice-section developing-page">
              <h2>Comming soon!</h2>
            </div>
          )}
          {pageIndex === 3 && (
            <div className="rank-section developing-page">
              <h2>Comming soon!</h2>
            </div>
          )}
          {pageIndex === 4 && (
            <div className="progress-section developing-page">
              <h2>Comming soon!</h2>
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

      
    </div>
  )
}

export default App