import { useState } from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import './responsive.css'
import ReactDOM from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'
import { geneAI } from './gemini'
import useSound from 'use-sound';
import { getWordData } from './gemini'
import { signInWithPopup,signOut  } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { auth, db, googleProvider } from './firebase-config.js'
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { isAlreadyLogin } from './handleData.js'
import { addUser } from './handleData.js'
import { getUserData } from './handleData.js'
import { addFolderDB, deleteFolderDB, renameFolderDB } from './handleData.js'
import { addWordDB,deleteWordDB } from './handleData.js'
import { getFolderDataDB } from './handleData.js'
import { meaningSuggestion } from './gemini.js'


function App() {
  const [userID, setUserID] = useState('')
  const [userName, setUserName] = useState('')
  const [userData, setUserData] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const meaningInputRef = useRef(null);
  const wordInputRef = useRef(null);

  const [folderName, setFolderName] = useState('')
  const [folders, setFolders] = useState([])
  const [allFolders, setAllFolders] = useState([]);

  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [words, setWords] = useState([])
  const [allWords, setAllWords] = useState([])
  const [currentFolder, setCurrentFolder] = useState('')

  const [showMoreOptions, setShowMoreOptions] = useState(false)

  const [showLoginSection, setShowLoginSection] = useState(false)
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // The signed-in user info.
      const user = result.user;
      setUserID(user.uid)
      setUserName(user.displayName);
      setAvatarUrl(user.photoURL);
      console.log("User signed in:", user.uid);

      // Check if user has logged in before
      isAlreadyLogin(user.uid).then(data => {
        if (data) {
          console.log('This user has logged in before')
        }
        else {
          console.log('This user is new')
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

        // Optionally, fetch user data here
        getUserData(user.uid).then((data) => {
          if (data) {
            setFolders(Object.keys(data.folders));
            setAllFolders(Object.keys(data.folders))
            setUserData(data);
          } else {
            setFolders([]);
          }
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

  const showCurrentUser = () => {
    const user = auth.currentUser;
    if (user) {
      const uid = user.uid;
      console.log("Current User UID:", uid);
    } else {
      console.log("No user currently signed in.");
    }
  }

  const [showLogoutSection, setShowLogoutSection] = useState(false)
  const exitAccount = () => {
    signOut(auth)
    setUserID('')
  }

  function shuffleArray(array) {
    const arr = [...array]; // make a copy to avoid mutating original
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Directing page
  const [pageIndex, setPageIndex] = useState(0)
  
  const addWord = () => {
    if (word != '' && meaning != '') {
      setWords([...words, {name: word.toLowerCase(), mean: meaning}])
      addWordDB(userID, currentFolder, {name: word.toLowerCase(), mean: meaning})
    }
    setWord('')
    setMeaning('')
  }
  
  const [data, setData] = useState([])
  const [indexLearn, setIndexLearn] = useState(0)
  
  function Card({word}) {
    const [showDef, setShowDef] = useState(false)

    const handleDef = () => {
      setShowDef(!showDef)
    }
    return (
      <div className="card">
        {showDef ? <p>{word.mean}</p> : <h1>{word.name}</h1>}
        <button onClick={handleDef}><FontAwesomeIcon icon={faArrowsLeftRight} /></button>
      </div>
    )
  }

  const [showLearn, setShowLearn] = useState(false)
  const learnBtn = () => {
    setShowLearn(true)
    setData(words ?? [])
    setIndexLearn(0)
  }

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

  // Delete folder
  const deleteFolder = (uid, folderName) => {
    deleteFolderDB(uid, folderName)
    setFolders(folders.filter(folder => folder != folderName))
    setAllFolders(folders.filter(folder => folder != folderName))
    setShowAskToDelete(false)
  }

  // Rename folder
  const [showRenameFolderSection, setShowRenameFolderSection] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [renameTarget, setRenameTarget] = useState(null);

  const renameFolder = async (uid, clickedFolder, newFolderName) => {
    setShowRenameFolderSection(false)
    console.log(clickedFolder)

    await renameFolderDB(uid, clickedFolder, newFolderName)

    const data = await getUserData(userID);
    setUserData(data);
    setFolders(Object.keys(data.folders));
    setAllFolders(Object.keys(data.folders))
    setRenameTarget('')
  }

  const [showAskToDelete, setShowAskToDelete] = useState(false)

  const [showWordSection, setShowWordSection] = useState(false)

  const openWordSection = (folderName) => {
    console.log(folderName)
    setShowWordSection(true)
    setShowCreateFolder(false)
    setLoader(true)
    setCurrentFolder(folderName)

    getFolderDataDB(userID, folderName).then((data) =>  {
      if (data) {
        console.log(data)
        setWords(data);
        setAllWords(data);
        setLoader(false);
      }
    }).catch((error) => {
      console.error("Error fetching folder data:", error);
    });
  }

  const quitWordSection = () => {
    setShowWordSection(false)
    setCurrentFolder('')
    getUserData(userID).then((data) => {
      setUserData(data)
    })
  }

  

  // Suggest meaning feature
  const meaningRefs = useRef([]);
  
  const [meaningList, setMeaningList] = useState([])
  const [showMeaningList, setShowMeaningList] = useState(false)
  const [selectedMeaningIndex, setSelectedMeaningIndex] = useState(-1);
  const [showRemindSuggestion, setShowRemindSuggestion] = useState(false)
  const [meaningListLoader, setMeaningListLoader] = useState(false)
  const suggestMeaning = () => {
    if (word && word.trim() !== '' && word !== '/') {
      setShowMeaningList(true);
      setMeaningListLoader(true);
      meaningSuggestion(word).then(data => {
        setMeaningList(data)
        setMeaningListLoader(false)
      })
    } 
  }

  useEffect(() => {
    if (
      showMeaningList &&
      selectedMeaningIndex !== -1 &&
      meaningRefs.current[selectedMeaningIndex]
    ) {
      meaningRefs.current[selectedMeaningIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedMeaningIndex, showMeaningList, meaningList]);

  //search word
  const searchWord = (e) => {
    const searchValue = e.target.value.toLowerCase()
    if (searchValue.length > 0) {
      const filteredWords = allWords.filter(word => {
        const name = word.name.toLowerCase()
        const mean = word.mean.toLowerCase()

        return name.includes(searchValue) || mean.includes(searchValue)
      });
      setWords(filteredWords);
    }
    else {
      setWords(allWords);
    }
  }

  //matching feature
  const [showMatching, setShowMatching] = useState(false)
  const [nameWords, setNameWords] = useState([])
  const [meanWords, setMeanWords] = useState([])
  const [mixedWords, setMixedWords] = useState([])
  const [clickedNameIndex, setClickedNameIndex] = useState(-1)
  const [clickedMeanIndex, setClickedMeanIndex] = useState(-1)
  const [clickedName, setClickedName] = useState('')
  const [clickedMean, setClickedMean] = useState('')
  const [matchedList, setMatchedList] = useState([])
  const [noMatchedList, setNoMatchedList] = useState([])
  const [resultTitle, setResultTitle] = useState('Hell nah')

  const generateMatching = (words) => {
    let nameWords = []
    let meanWords = []
    words.forEach(word => {
      nameWords.push(word.name)
      meanWords.push(word.mean)
    })


    function shuffle(array) {
      let currentIndex = array.length;

      // While there remain elements to shuffle...
      while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
      }
    }

    shuffle(nameWords)
    shuffle(meanWords)

    setNameWords(nameWords)
    setMeanWords(meanWords)
    if (words.length > 0) {
      setShowMatching(true)
    }
    else {
      alert("There are no words. Please enter your words!")
    }

    const mixedWords = [...nameWords, ...meanWords]
    shuffle(mixedWords)
    setMixedWords(mixedWords)

  }


  const checkMatching = (name, mean) => {
    const words = JSON.parse(localStorage.getItem('words'))
    const isCorrectPair = words.some(word => word.name === name && word.mean === mean);

    if (isCorrectPair) {
      setMatchedList(prev => {
        const isAlreadyInMatchedList = matchedList.some(word => word.name === name && word.mean === mean);
        if (!isAlreadyInMatchedList) {
          return [...prev, {name: name, mean: mean}]
        }
      });
      
    } 
    else {
      setNoMatchedList(prev => {
        const isAlreadyInNoMatchedList = noMatchedList.some(word => word.name === name && word.mean === mean);
        if (!isAlreadyInNoMatchedList) {
          return [...prev, {name: name, mean: mean}]
        }
        return prev
      });
    }
    
    setClickedNameIndex(-1);
    setClickedMeanIndex(-1);
    setClickedName('');
    setClickedMean('');
  }
  
  function ResultSection() {
    const score = Math.floor(matchedList.length / words.length * 100)

    if (score === 100) {
      setResultTitle('Wow!')
    }
    else if (score >= 90 && score < 100) {
      setResultTitle('Almost there!')
    }
    else if (score >= 80 && score < 100) {
      setResultTitle('Good job!')
    }
    else if (score >= 50 && score < 80) {
      setResultTitle('Not bad!')
    }
    else if (score == 0) {
      setResultTitle('Hell nah 💀')
    }
    else {
      setResultTitle('Keep trying!')
    }
    return (
      <div className='result-section-container'>
        <div className="result-section">
          <h3 className="result-heading">{resultTitle}</h3>
          <p className="result-text">{score + '%'}</p>

          <div className="matchingBtns">
            <button className='retryMatchingBtn' onClick={() => {
              setClickedNameIndex(-1)
              setClickedMeanIndex(-1)
              setClickedName('')
              setClickedMean('')
              setMatchedList([])
              setNoMatchedList([])
              generateMatching()
              }}>Retry</button>
            <button className='quitMatchingBtn' onClick={() => {
              setShowMatching(false)
              setClickedNameIndex(-1)
              setClickedMeanIndex(-1)
              setClickedName('')
              setClickedMean('')
              setMatchedList([])
              setNoMatchedList([])
            }}>Quit</button>
          </div>
        </div>
      </div>
    )
  }

  // Filling
  const [showFilling, setShowFilling] = useState(false)
  const [loader, setLoader] = useState(false)
  const [fillingQuestions, setFillingQuestions] = useState([])
  const [fillingIndex, setFillingIndex] = useState(0)

  const Loader = () => (
    <div className="loader-section">
        <div className="loader-container">
          <div className="loader"></div>
        </div>
    </div>
  )

  function FillingCard({data, order}) {
    let question = data.question
    let options = data.options
    let ans = data.word
    let startQuestion,endQuestion
    let gapClassName, labelClassName, explainClassName;

    if (question.indexOf('[') != -1 && question.indexOf(']') != -1) {
      startQuestion = question.slice(0, question.indexOf('['))
      endQuestion = question.slice(question.indexOf(']') + 1)
    }
    if (question.indexOf('_') != -1) {
      startQuestion = question.slice(0, question.indexOf('_'))
      endQuestion = question.slice(question.indexOf('_'), question.length).replace(/_/g, '') 

    }

    const [clicked, setClicked] = useState(-1)
    const [userInput, setUserInput] = useState('')

    if (userInput != '' && userInput === ans) {
      gapClassName = 'gap right'
      labelClassName = 'label right'
      explainClassName = 'filling-answer-explain right'

    }
    else if (userInput != '' && userInput !== ans) {
      gapClassName = 'gap wrong'
      labelClassName = 'label wrong'
      explainClassName = 'filling-answer-explain wrong'
    }
    else {
      gapClassName = 'gap'
      labelClassName = 'label'
      explainClassName = 'filling-answer-explain'
    }

    return (
      <div className="filling-card">
        <p>{startQuestion}<span className={gapClassName}>{userInput}</span>{endQuestion}</p>

        <div className="filling-options">
          {options.map((item, index) => (
            <div className="filling-option" key={index}>
              <input 
                type='radio' 
                id={'q'+order+'option'+index} 
                onChange={() => {
                  if (clicked === -1) {
                    setClicked(index)
                    setUserInput(item)
                  }
                }}
                checked={clicked === index}  
              />
              <label htmlFor={'q'+order+'option'+index} className={labelClassName}>{item}</label>
            </div>
          ))}
        </div>
        
        { clicked !== -1 && (
          <div className={'filling-answer-explain'}>
            <h3>Answer:</h3>
            <p>{startQuestion}<span className='mark-ans'>{ans}</span>{endQuestion}</p>
            <button onClick={() => {
              if (fillingIndex < fillingQuestions.length - 1) {
                setFillingIndex(fillingIndex + 1)
                setNumberQuestionDone(numberQuestionDone + 1)
              }
              else {
                setFillingIndex(0)
                setNumberQuestionDone(0)
                setShowFilling(false)
              }
            }}>Next <FontAwesomeIcon icon={faArrowRight} /></button>
          </div>
        )}
      </div>
    )
  }

  const generateFilling = (wordList) => {
    let words = []
    wordList.forEach(item => words.push(item.name))
    
    if (words.length > 0) {
      setLoader(true)
      geneAI(words).then((value) => {
        console.log(value)
        
        setFillingQuestions(value)
        setShowFilling(true)
        setLoader(false)
      })
    }
    else {
      alert("Your word list is empty. Please enter your words!")
    }
  }

  
  const [numberQuestionDone, setNumberQuestionDone] = useState(0)
  
  const quitFilling = () => {
    setShowFilling(false)
    setFillingQuestions([])
    setFillingIndex(0)
    setNumberQuestionDone(0)
  }


  function ProgressBar() {
    const progress = Math.floor(numberQuestionDone / fillingQuestions.length * 100);
    let progressCln
    if (progress > 0 && progress <= 25) {
      progressCln = 'progress low';
    }
    else if (progress > 25 && progress <= 75) {
      progressCln = 'progress medium';
    }
    else if (progress > 75 && progress <= 100) {
      progressCln = 'progress high';
    }
    else {
      progressCln = 'progress empty';
    }
    return (
      <div className={progressCln} style={{width: `${progress}%`}}></div>
    )
  }

  // Listening 
  const [showListening, setShowListening] = useState(false)
  const [listeningCardIndex, setListeningCardIndex] = useState(0)

  const generateListening = (words) => {
    if (words.length > 0) {
      setShowListening(true)
    }
    else {
      alert("Your word list is empty. Please enter your words!")
    }
  }

  function ListeningCard({word, order}) {
    const speakWord = () =>  {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance);
    }

    const [userInput, setUserInput] = useState('')
    
    const [listeningInputClassName, setListeningInputClassName] = useState('listeningInput')
    return (
      <div className="listening-card">
        <div className="listening-card-content">
          <div className="speak-word-btn" onClick={speakWord}><FontAwesomeIcon icon={faVolumeHigh} className='icon'/></div>
          <input 
            type="text" 
            placeholder='Type what you hear...'
            onKeyDown={e => {
              if (e.key === 'Enter') {
                setUserInput(e.target.value)
                console.log(e.target.value === word);

                if (e.target.value.toLowerCase() === word.toLowerCase()) {
                    setListeningInputClassName('listeningInput right')
                }
                else {
                  setListeningInputClassName('listeningInput wrong')
                }
              }
              if (e.key === 'ArrowRight') {
                if (listeningCardIndex < words.length - 1) {
                  setListeningCardIndex(listeningCardIndex + 1);
                }
                else {
                  setListeningCardIndex(0);
                  setShowListening(false);
                }
                setUserInput('');
              }
            }}
            className={listeningInputClassName}
          />
        </div>

        { userInput && (
          <div className={'listening-explain '}>
            <h4>Answer:</h4>
            <p className='listening-answer'onClick={speakWord}>{word}<FontAwesomeIcon icon={faVolumeHigh} className='icon'/></p>
            <button onClick={() => {
              if (listeningCardIndex < words.length - 1) {
                setListeningCardIndex(listeningCardIndex + 1);
              }
              else {
                setListeningCardIndex(0);
                setShowListening(false);
              }
              
              setUserInput('');
            }}><FontAwesomeIcon icon={faArrowRight} /></button>
          </div>
        )}
      </div>
    )
  }

  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState('2000')

  const [showWordSectionLeft, setShowWordSectionLeft] = useState(false)

  const [showLogoutBtn, setShowLogoutBtn] = useState(false)

  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  return (
    <div className="main">
      {loader && <Loader />}
      
      
      <div className="content">
        <div className="sidebar pc">
          <h1 style={{'userSelect': 'none'}}>Memo</h1>

          <ul>
            <li className={pageIndex === 0 ? 'clicked' : ''} onClick={() => setPageIndex(0)}><FontAwesomeIcon icon={faFolder} className='icon' /><span>Vocabulary</span></li>
            <li className={pageIndex === 1 ? 'clicked' : ''} onClick={() => setPageIndex(1)}><FontAwesomeIcon icon={faDumbbell} className='icon' /><span>Practice</span></li>
            <li className={pageIndex === 2 ? 'clicked' : ''} onClick={() => setPageIndex(2)}><FontAwesomeIcon icon={faTrophy} className='icon' /><span>Rank</span></li>
            <li className={pageIndex === 3 ? 'clicked' : ''} onClick={() => setPageIndex(3)}><FontAwesomeIcon icon={faChartSimple} className='icon' /><span>Progress</span></li>
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
                      <FontAwesomeIcon icon={faFolder} className='folder-icon' />
                      <h2>{folder}</h2>
                      <p>{userData.folders[folder].length || 0} words</p>
                      <div className="more" onClick={(e) => {e.stopPropagation()}}>
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
                      </div>

                    </div>
                    {showRenameFolderSection && renameTarget === folder && (
                        <div className="rename-folder-section" onClick={() => setShowRenameFolderSection(false)}>
                          <div className="rename-folder" onClick={e => e.stopPropagation()}>
                            <h3>Rename folder</h3>
                            <input type="text" placeholder='New folder name...'
                              onChange={(e) => setNewFolderName(e.target.value)}
                            />
                            <button onClick={() => {
                              renameFolder(userID, folder, newFolderName)
                            }}>Rename</button>
                          </div>
                        </div>
                      )
                    }
                    
                    {showAskToDelete && renameTarget === folder  && (
                      <div className="ask-to-delete-section" onClick={() => setShowAskToDelete(false)}>
                        <div className="ask-to-delete" onClick={e => e.stopPropagation()}>
                          <h3>Do you want to delete this folder?</h3>
                          <div className="options">
                            <button onClick={() => setShowAskToDelete(false)}>No, keep it</button>
                            <button onClick={() => deleteFolder(userID, folder)} className='deleteFolderBtn'>Yes, delete it</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                

                
              </div>

              
            </div>
          )}

          {pageIndex === 1 && (
            <div className="practice-section developing-page">
              <h2>This feature is developing</h2>
            </div>
          )}
          {pageIndex === 2 && (
            <div className="rank-section developing-page">
              <h2>This feature is developing</h2>
            </div>
          )}
          {pageIndex === 3 && (
            <div className="progress-section developing-page">
              <h2>This feature is developing</h2>
            </div>
          )}

        </div>
      </div>
      


      {showWordSection && (
        <div className="word-section" onClick={() => {
          if (showRemindSuggestion) {
            setShowRemindSuggestion(false)
          }
        }}>
          <div className="word-section-header">
            <button onClick={quitWordSection} className='quitSectionBtn'><FontAwesomeIcon icon={faArrowLeft} /></button>
          </div>
          <div className="word-section-body">
            <button className='showWordSectionLeftBtn' onClick={() => setShowWordSectionLeft(!showWordSectionLeft)}>
              Add & Learn
            </button>

            <div className="word-section-left pc">
              <input 
                type="text"
                placeholder='Enter word'
                value={word}
                ref={wordInputRef}
                onChange={e => setWord(e.target.value)} 
                onClick={() => {
                  setShowRemindSuggestion(false)
                  setShowMeaningList(false)
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === 'ArrowDown') {
                    // Move focus to meaning input
                    meaningInputRef.current && meaningInputRef.current.focus();
                    setShowRemindSuggestion(true)
                  }
                }}
              />
              <div className="meaning-section">
                <input 
                  type="text"
                  placeholder='Enter meaning'
                  value={meaning}
                  ref={meaningInputRef}
                  onChange={e => {
                    setMeaning(e.target.value)
                    setShowMeaningList(false)
                    setSelectedMeaningIndex(-1);
                    if (e.target.value === '/') {
                      suggestMeaning()
                    }
                    if (e.target.value === '') {
                      setShowRemindSuggestion(true)
                    }
                    else {
                      setShowRemindSuggestion(false)
                    }
                  }} 
                  onKeyDown={e => {
                    if (showMeaningList && meaningList.length > 0) {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setSelectedMeaningIndex(prev =>
                          prev < meaningList.length - 1 ? prev + 1 : 0
                        );
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setSelectedMeaningIndex(prev =>
                          prev > 0 ? prev - 1 : meaningList.length - 1
                        );
                      } else if (e.key === 'Enter' && selectedMeaningIndex !== -1) {
                        setMeaning(meaningList[selectedMeaningIndex].vie);
                        setShowMeaningList(false);
                      } else if (e.key === 'Enter') {
                        addWord();
                        wordInputRef.current && wordInputRef.current.focus();
                      }
                    } else if (e.key === 'Enter') {
                      addWord();
                      wordInputRef.current && wordInputRef.current.focus();
                    }

                  }}
                  onClick={() => {
                    if (word) {
                      setShowRemindSuggestion(true)
                    }
                  }}
                />
                {showRemindSuggestion && (
                  <div className="remind-suggestion">
                    <p><img src="./src/assets/icon/upscalemedia-transformed.png" alt="" />Type "/" to suggest meaning</p>
                  </div>
                )}
                {showMeaningList && meaningList.length > 0 && (
                  <div className="meaning-list-section">
                    <div className="meaning-list">
                      {
                        meaningList.map((meaning, index) => {
                          let typeClassName;
                          if (meaning.type === 'noun') {
                            typeClassName = 'noun'
                          }
                          else if (meaning.type === 'verb') {
                            typeClassName = 'verb'
                          }
                          else if (meaning.type === 'adjective') {
                            typeClassName = 'adjective'
                          }
                          else {
                            typeClassName = 'other'
                          }
                          
                          const isSelected = index === selectedMeaningIndex;

                          return (
                          <li 
                            ref={el => (meaningRefs.current[index] = el)}
                            className={`meaning${isSelected ? ' selected' : ''}`}
                            key={index}
                            onClick={() => {
                              setMeaning(meaning.vie)
                              setShowMeaningList(false)
                            }}
                            style={isSelected ? { background: '#f5f5f5' } : {}}
                          >
                            <p className={typeClassName}>{meaning.type}</p>
                            <p>{meaning.vie}</p>
                            <p>{meaning.eng}</p>
                          </li>
                        )})
                      }
                    </div>
                  </div>
                )}
              </div>

              <button onClick={addWord}>Add</button>

              <div className="learning-modes">
                <button className='learnBtn' onClick={learnBtn}>
                  <img src="https://cdn-icons-png.freepik.com/512/9100/9100957.png" alt="" />
                  Flashcard
                </button>

                {/* <button onClick={() => generateMatching(words)} className='openMatchingBtn'>
                  <img src="https://cdn-icons-png.freepik.com/512/282/282100.png" alt="" />
                  Matching
                </button> */}

                <button onClick={() => generateFilling(words)}>
                  <img src="https://cdn-icons-png.flaticon.com/512/6559/6559624.png" alt="" />
                  Filling
                </button>

                <button onClick={() => generateListening(words)}>
                  <img src="https://cdn-icons-png.flaticon.com/512/8805/8805242.png" alt="" />
                  Listening
                </button>
              </div>
              
              <button className='delete-folder-btn' onClick={() => {
                setShowAskToDelete(true)
                setRenameTarget(currentFolder)
                setShowWordSection(false)
              }}><FontAwesomeIcon icon={faTrash} /> Delete this folder</button>
            </div>
            
            {showWordSectionLeft && (
              <div className="word-section-left-modal mobile" onClick={() => {
                setShowRemindSuggestion(false)
                setShowWordSectionLeft(false)
              }}>
                <div className="word-section-container">
                  <div className="word-section-left" onClick={e =>e.stopPropagation()}>
                    <input 
                      type="text"
                      placeholder='Enter word'
                      value={word}
                      ref={wordInputRef}
                      onChange={e => setWord(e.target.value)} 
                      onClick={() => {
                        setShowRemindSuggestion(false)
                        setShowMeaningList(false)
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === 'ArrowDown') {
                          // Move focus to meaning input
                          meaningInputRef.current && meaningInputRef.current.focus();
                        }
                      }}
                    />
                    <div className="meaning-section">
                      <input 
                        type="text"
                        placeholder='Enter meaning'
                        value={meaning}
                        ref={meaningInputRef}
                        onChange={e => {
                          setMeaning(e.target.value)
                          setShowMeaningList(false)
                          setSelectedMeaningIndex(-1);
                          if (e.target.value === '/') {
                            suggestMeaning()
                          }
                          if (e.target.value.length > 0) {
                            setShowRemindSuggestion(false)
                          }
                          else {
                            setShowRemindSuggestion(true)
                          }
                        }} 
                        onKeyDown={e => {
                          if (showMeaningList && meaningList.length > 0) {
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setSelectedMeaningIndex(prev =>
                                prev < meaningList.length - 1 ? prev + 1 : 0
                              );
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setSelectedMeaningIndex(prev =>
                                prev > 0 ? prev - 1 : meaningList.length - 1
                              );
                            } else if (e.key === 'Enter' && selectedMeaningIndex !== -1) {
                              setMeaning(meaningList[selectedMeaningIndex].vie);
                              setShowMeaningList(false);
                            } else if (e.key === 'Enter') {
                              addWord();
                              wordInputRef.current && wordInputRef.current.focus();
                            }
                          } else if (e.key === 'Enter') {
                            addWord();
                            wordInputRef.current && wordInputRef.current.focus();
                          }

                        }}

                        onClick={() => {
                          if (word) {
                            setShowRemindSuggestion(true)
                          }
                        }}
                      />
                      {showRemindSuggestion && (
                        <div className="remind-suggestion">
                          <p>Type "/" to suggest meaning</p>
                        </div>
                      )}
                      {showMeaningList && meaningList && (
                        <div className="meaning-list-section">
                          <div className="meaning-list">
                            {
                              meaningList.map((meaning, index) => {
                                let typeClassName;
                                if (meaning.type === 'noun') {
                                  typeClassName = 'noun'
                                }
                                else if (meaning.type === 'verb') {
                                  typeClassName = 'verb'
                                }
                                else if (meaning.type === 'adjective') {
                                  typeClassName = 'adjective'
                                }
                                else {
                                  typeClassName = 'other'
                                }
                                
                                const isSelected = index === selectedMeaningIndex;

                                return (
                                <li 
                                  ref={el => (meaningRefs.current[index] = el)}
                                  className={`meaning${isSelected ? ' selected' : ''}`}
                                  key={index}
                                  onClick={() => {
                                    setMeaning(meaning.vie)
                                    setShowMeaningList(false)
                                  }}
                                  style={isSelected ? { background: '#f5f5f5' } : {}}
                                >
                                  <p className={typeClassName}>{meaning.type}</p>
                                  <p>{meaning.vie}</p>
                                  <p>{meaning.eng}</p>
                                </li>
                              )})
                            }
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button onClick={addWord} className='add-word-btn'>Add</button>

                    <div className="learning-modes">
                      <button className='learnBtn' onClick={learnBtn}>
                        <img src="https://cdn-icons-png.freepik.com/512/9100/9100957.png" alt="" />
                        Flashcard
                      </button>

                      {/* <button onClick={() => generateMatching(words)} className='openMatchingBtn'>
                        <img src="https://cdn-icons-png.freepik.com/512/282/282100.png" alt="" />
                        Matching
                      </button> */}

                      <button onClick={() => generateFilling(words)}>
                        <img src="https://cdn-icons-png.flaticon.com/512/6559/6559624.png" alt="" />
                        Filling
                      </button>

                      <button onClick={() => generateListening(words)}>
                        <img src="https://cdn-icons-png.flaticon.com/512/8805/8805242.png" alt="" />
                        Listening
                      </button>
                    </div>
                    
                    <button className='delete-folder-btn' onClick={() => {
                      setShowAskToDelete(true)
                      setRenameTarget(currentFolder)
                      setShowWordSection(false)
                    }}><FontAwesomeIcon icon={faTrash} /> Delete this folder</button>
                  </div>
                </div>
              </div>
            )}
            

            <div className={word.length > 0 ? "word-section-right" : "word-section-right empty"}>
              <div className="searchBox-section">
                <input 
                  type="text" 
                  className="searchBox" 
                  placeholder='Find your word...'
                  onChange={searchWord}/>
                <FontAwesomeIcon icon={faMagnifyingGlass} className='searchIcon'/>
              </div>
              <ul>
                {
                  words.length > 0 ? (
                      words.map((word, index) => 
                        <li key={index}>
                          <h3>{word.name.toLowerCase()}</h3>
                          <p>{word.mean.toLowerCase()}</p>
                          <button 
                          className='deleteBtn'
                          onClick={() => {
                            const newWords = words.filter((words, i) => i !== index)
                            setAllWords(newWords)
                            setWords(newWords)
                            deleteWordDB(userID, currentFolder, word)
                          }}><FontAwesomeIcon icon={faTrash} /></button>
                        </li>
                      )
                  ) : (
                    <p className='noWords'>Nothing here!</p>
                  )
                }
              </ul>
            </div>
          </div>
        </div>
      )}

      

      {showMatching &&
        <div className="matching-section">
          <div className="matching-header">
            <button 
            onClick={() => {
              setShowMatching(false)
              setClickedNameIndex(-1)
              setClickedMeanIndex(-1)
              setClickedName('')
              setClickedMean('')
              setMatchedList([])
              setNoMatchedList([])
            }}
            className='quitSectionBtn'
            ><FontAwesomeIcon icon={faArrowLeft} /></button>
            <h1>Matching</h1>
          </div>

          <div className="matching-content">
            <div className="matching-list">
              {/* <div className="matching-list-left">
                {nameWords.map((word, index) => {
                  const isCorrectPair = () => {
                    const isInMatchedList = matchedList.some(item => item.name === word);
                    const isInNoMatchedList = noMatchedList.some(item => item.name === word);
                    if (isInMatchedList) {
                      return 'matching-word matched'
                    }
                    else if (isInNoMatchedList) {
                      return 'matching-word notMatched'
                    }
                    else {
                      return clickedNameIndex === index ? 'matching-word clicked' : 'matching-word'
                    }
                  }

                  return (
                    <div 
                      className={isCorrectPair()}
                      key={index}
                      onClick={() => {
                        const isAlreadyInMatchedList = matchedList.some(item => item.name === word);
                        const isAlreadyInNoMatchedList = noMatchedList.some(item => item.name === word);
                        if (isAlreadyInMatchedList || isAlreadyInNoMatchedList) {
                          return;
                        }
                        else {
                          setClickedNameIndex(index)
                          setClickedName(word)
                          if (clickedMean) {
                            checkMatching(word, clickedMean)      
                            if (matchedList.length + noMatchedList.length === words.length) {
                              // setShowMatching(false);
                              // setClickedNameIndex(-1);
                              // setClickedMeanIndex(-1);
                              // setClickedName('');
                              // setClickedMean('');
                              alert('All words matched!');
                            }                  
                          }
                        }
                      }}
                    >
                      <h3>{word}</h3>
                    </div>
                )})}
              </div>

              <div className="matching-list-right">
                {meanWords.map((word, index) => {
                  const isCorrectPair = () => {
                    const isInMatchedList = matchedList.some(item => item.mean === word);
                    const isInNoMatchedList = noMatchedList.some(item => item.mean === word);
                    if (isInMatchedList) {
                      return 'matching-word matched'
                    }
                    else if (isInNoMatchedList) {
                      return 'matching-word notMatched'
                    }
                    else {
                      return clickedMeanIndex === index ? 'matching-word clicked' : 'matching-word'
                    }
                  }

                  return (
                  <div 
                    className={isCorrectPair()}
                    key={index}
                    onClick={() => {
                      const isAlreadyInMatchedList = matchedList.some(item => item.mean === word);
                      const isAlreadyInNoMatchedList = noMatchedList.some(item => item.mean === word);
                      if (isAlreadyInMatchedList || isAlreadyInNoMatchedList) {
                        return;
                      }
                      else {
                        setClickedMeanIndex(index)
                        setClickedMean(word)
                        if (clickedName) {
                          checkMatching(clickedName, word)                        
                        }
                      }

                    }}
                  >
                    <h3>{word}</h3>
                  </div>
                )})}
              </div> */}

              <div className="matching-list">
                {mixedWords.map((word, index) => {
                  const isInNameWords = nameWords.includes(word);

                  if (isInNameWords) {
                    const isCorrectPair = () => {
                      const isInMatchedList = matchedList.some(item => item.name === word);
                      const isInNoMatchedList = noMatchedList.some(item => item.name === word);
                      if (isInMatchedList) {
                        return 'matching-word matched'
                      }
                      else if (isInNoMatchedList) {
                        return 'matching-word notMatched'
                      }
                      else {
                        return clickedNameIndex === index ? 'matching-word clicked' : 'matching-word'
                      }
                    }

                    return (
                      <div 
                        className={isCorrectPair()}
                        key={index}
                        onClick={() => {
                          const isAlreadyInMatchedList = matchedList.some(item => item.name === word);
                          const isAlreadyInNoMatchedList = noMatchedList.some(item => item.name === word);
                          if (isAlreadyInMatchedList || isAlreadyInNoMatchedList) {
                            return;
                          }
                          else {
                            setClickedNameIndex(index)
                            setClickedName(word)
                            if (clickedMean) {
                              checkMatching(word, clickedMean)      
                              if (matchedList.length + noMatchedList.length === words.length) {
                                // setShowMatching(false);
                                // setClickedNameIndex(-1);
                                // setClickedMeanIndex(-1);
                                // setClickedName('');
                                // setClickedMean('');
                                alert('All words matched!');
                              }                  
                            }
                          }
                        }}
                      >
                        <h3>{word}</h3>
                      </div>
                    )
                  }
                  else {
                    const isCorrectPair = () => {
                      const isInMatchedList = matchedList.some(item => item.mean === word);
                      const isInNoMatchedList = noMatchedList.some(item => item.mean === word);
                      if (isInMatchedList) {
                        return 'matching-word matched'
                      }
                      else if (isInNoMatchedList) {
                        return 'matching-word notMatched'
                      }
                      else {
                        return clickedMeanIndex === index ? 'matching-word clicked' : 'matching-word'
                      }
                    }

                    return (
                      <div 
                        className={isCorrectPair()}
                        key={index}
                        onClick={() => {
                          const isAlreadyInMatchedList = matchedList.some(item => item.mean === word);
                          const isAlreadyInNoMatchedList = noMatchedList.some(item => item.mean === word);
                          if (isAlreadyInMatchedList || isAlreadyInNoMatchedList) {
                            return;
                          }
                          else {
                            setClickedMeanIndex(index)
                            setClickedMean(word)
                            if (clickedName) {
                              checkMatching(clickedName, word)                        
                            }
                          }

                        }}
                      >
                        <h3>{word}</h3>
                      </div>
                    )
                }})}
              </div>

              {matchedList.length + noMatchedList.length === words.length && <ResultSection />}
            </div>
          </div>
        </div>
      }

      {showFilling && (
        <div className="filling-section">
          <div className="filling-header">
            <button className='quitFillingBtn quitSectionBtn' onClick={quitFilling}><FontAwesomeIcon icon={faArrowLeft} /></button>
            <div className="progess-bar">
              <ProgressBar />
            </div>
          </div>
          <div className="filling-content">
            <FillingCard data={fillingQuestions[fillingIndex]} order={fillingIndex}/>
          </div>
        </div>
      )}
      
      {showListening && (
        <div className="listening-section">
          <div className="listening-header">
            <button className='quitSectionBtn' onClick={() => setShowListening(false)}><FontAwesomeIcon icon={faArrowLeft} /></button>
          </div>
          <div className="listening-content">
            <ListeningCard key={listeningCardIndex} word={words[listeningCardIndex].name} order={listeningCardIndex}/>
          </div>
        </div>
      )}

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

      {showLearn && 
        <div className="learn-section">
          <div className="card-list">
            
            <p className="card-number">
              {indexLearn + 1} / {data.length}
            </p>

            <Card word={data[indexLearn]} />

            <div className="nav-btns">
              {indexLearn > 0 ? (
                <button className="prev-btn" onClick={() => {
                  if (indexLearn > 0) {
                    setIndexLearn(indexLearn - 1)
                  }
                }}><FontAwesomeIcon icon={faArrowLeft} /></button>
              ) : (
                <button className="disabled prev-btn"><FontAwesomeIcon icon={faArrowLeft} /></button>
              )
              }

              {indexLearn < data.length - 1 ? (
                <button className="next-btn" onClick={() => {
                  if (indexLearn < data.length - 1) {
                    setIndexLearn(indexLearn + 1)
                  }
                }}><FontAwesomeIcon icon={faArrowRight} /></button>
              )
              : (
                <button className="disabled next-btn"><FontAwesomeIcon icon={faArrowRight} /></button>
              )
              }
            </div>
          </div>
          <button onClick={() => setShowLearn(false)} className='quitLearnSectionBtn quitSectionBtn'><FontAwesomeIcon icon={faArrowLeft} /></button>

        </div>
      }
    </div>
  )
}

export default App
