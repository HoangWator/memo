import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ReactDOM from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus,faArrowLeft,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX } from '@fortawesome/free-solid-svg-icons'
import { geneAI } from './gemini'
import useSound from 'use-sound';
import { getWordData } from './gemini'
import { signInWithPopup,signOut  } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { auth, db, googleProvider } from './firebase-config.js'
import { isAlreadyLogin } from './handleData.js'
import { addUser } from './handleData.js'
import { getUserData } from './handleData.js'
import { addFolderDB, deleteFolderDB, renameFolderDB } from './handleData.js'
import { addWordDB,deleteWordDB } from './handleData.js'
import { getFolderDataDB } from './handleData.js'


function App() {
  const [userID, setUserID] = useState('')
  const [userName, setUserName] = useState('')
  const [userData, setUserData] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const [folderName, setFolderName] = useState('')
  const [folders, setFolders] = useState([])

  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [words, setWords] = useState(() => {
    const localWords = JSON.parse(localStorage.getItem('words'))
    return localWords ?? []
  })
  const [currentFolder, setCurrentFolder] = useState('')

  const [showMoreOptions, setShowMoreOptions] = useState(false)

  const [showLoginSection, setShowLoginSection] = useState(false)
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // The signed-in user info.
      const user = result.user;
      alert(`Welcome ${user.displayName}!`);
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
          console.log(Object.keys(data.folders))
          setFolders(Object.keys(data.folders))
          setUserData(data)
        }
        else {
          setFolders([])
        }
      })
      
      setShowLoginSection(false)
    } catch (error) {
      alert(error.message);
    }

  }

  const showCurrentUser = () => {
    const user = auth.currentUser;
    if (user) {
      const uid = user.uid;
      console.log("Current User UID:", uid);
    } else {
      console.log("No user currently signed in.");
    }
  }

  const exitAccount = () => {
    signOut(auth).then(() => {
      alert('Sign-out successful.')
    }).catch((error) => {
      alert(error.message);
    });
  }

  function shuffleArray(array) {
    const arr = [...array]; // make a copy to avoid mutating original
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  
  const addWord = () => {
    setWords(prev => {
      if (word != '' && meaning != '') {
        const newWords = [...prev, {name: word.toLowerCase(), mean: meaning}]
        return newWords 
      }
    })

    if (word != '' && meaning != '') {
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
        <button onClick={handleDef}>{showDef ? 'Hide' : 'Show'}</button>
      </div>
    )
  }

  const [showLearn, setShowLearn] = useState(false)
  const learnBtn = () => {
    const words = JSON.parse(localStorage.getItem('words'))
    setShowLearn(true)
    setData(words ?? [])
    setIndexLearn(0)
  }

  // Create a folder
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const createFolder = () => {
    setShowCreateFolder(!showCreateFolder)
  }

  // Add folder to Firestore
  const addFolder = () => {
    if (folderName != '') {
      addFolderDB(userID, folderName)

      getUserData(userID).then((data) => {
        if (data) {
          setFolders(Object.keys(data.folders))
          setUserData(data)
        }
        else {
          setFolders([])
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
        setWords(data);
        setLoader(false);
      }
    }).catch((error) => {
      console.error("Error fetching folder data:", error);
    });
  }

  const quitWordSection = () => {
    setShowWordSection(false)
    setCurrentFolder('')
    setWords([])
    getUserData(userID).then((data) => {
      setUserData(data)
    })
  }

  

  // Suggest meaning feature
  const [meaningList, setMeaningList] = useState([])
  const [showMeaningList, setShowMeaningList] = useState(false)
  const suggestMeaning = () => {
    if (word) {
      const wordData = getWordMeaning(word);
      wordData.then((data) => {
        setMeaningList(data.definition);
      })
      .catch((error) => {
        console.error("Error fetching word meaning:", error);
      });
  
      setShowMeaningList(true);
    }    
  }

  //search word
  const searchWord = (e) => {
    const searchValue = e.target.value.toLowerCase()
    const words = JSON.parse(localStorage.getItem('words'));

    if (searchValue.length > 0) {
      const filteredWords = words.filter(word => {
        const name = word.name.toLowerCase()
        const mean = word.mean.toLowerCase()

        return name.includes(searchValue) || mean.includes(searchValue)
      });
      setWords(filteredWords);
    }
    else {
      setWords(words);
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

  const generateMatching = () => {
    const words = JSON.parse(localStorage.getItem('words'))
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
              setShowMatching(false)
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
          <div className={explainClassName}>
            <h3>Answer:</h3>
            <p>{startQuestion}<span className='mark-ans'>{ans}</span>{endQuestion}</p>
            <button onClick={() => {
              if (fillingIndex < fillingQuestions.length - 1) {
                setFillingIndex(fillingIndex + 1)
              }
              else {
                setFillingIndex(0)
                setShowFilling(false)
              }
            }}>Next</button>
          </div>
        )}
      </div>
    )
  }

  const generateFilling = () => {
    const wordList = JSON.parse(localStorage.getItem('words'))
    let words = []
    for (const item of wordList) {
      words.push(item.name)
    }

    
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

  const quitFilling = () => {
    setShowFilling(false)
    setFillingQuestions([])
    setFillingIndex(0)
  }

  function ProgressBar() {
    const progress = Math.floor((fillingIndex + 1) / fillingQuestions.length * 100);
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

  const generateListening = () => {
    const words = JSON.parse(localStorage.getItem('words'))
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
      speechSynthesis.speak(utterance);
    }

    const [userInput, setUserInput] = useState('')
    
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
              }
            }}
          />
        </div>

        { userInput && (
          <div className={'listening-explain ' + (userInput.toLowerCase() === word.toLowerCase() ? 'right' : 'wrong')}>
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
            }}>Next</button>
          </div>
        )}
      </div>
    )
  }

  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState('2000')

  return (
    <div className="main">
      {loader && <Loader />}
      <div className="header">
        <h1>Memo</h1>

        <div className="account-section">
          <button onClick={() => setShowLoginSection(true)}>
            <img 
              src={avatarUrl || "data:image/png;base64,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"}
              alt=""
              style={{ width: 32, height: 32, borderRadius: "50%" }} 
            />
            {userID ? userName : 'Sign in'}
          </button>

          {showLoginSection && (
            <div className="login-section" onClick={() => setShowLoginSection(false)}>
              <div className="login-container"  onClick={e => e.stopPropagation()}>
                <button className='quitLogin' onClick={() => setShowLoginSection(false)}><FontAwesomeIcon icon={faXmark} /></button>
                <h1>Sign in</h1>
                <div className="login-options">
                  <button onClick={loginWithGoogle}><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/800px-Google_%22G%22_logo.svg.png" alt="" />Continue with Google</button>
                  <button><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/500px-Facebook_Logo_%282019%29.png" alt="" />Continue with Facebook</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="content">
        <div className="sidebar">
          <ul>
            <li><FontAwesomeIcon icon={faFolder} className='icon' />Vocabulary</li>
            <li><FontAwesomeIcon icon={faDumbbell} className='icon' />Practice</li>
            <li><FontAwesomeIcon icon={faTrophy} className='icon' />Rank</li>
            <li><FontAwesomeIcon icon={faChartSimple} className='icon' />Progress</li>
          </ul>
        </div>

        <div className="main-content">
          <div className="vocabulary-section">
            <button className='add-folder-btn' onClick={createFolder}><FontAwesomeIcon className='icon' icon={faPlus} />  Create folder</button>
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
                    const filteredFolders = JSON.parse(localStorage.getItem('folders')).filter(folder => folder.toLowerCase().includes(searchValue));
                    setFolders(filteredFolders);
                  }}
                />
              </div>
              <button className='sort-btn'>Sort</button>
            </div>
            <div className="folder-list">
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

        </div>
      </div>
      


      {showWordSection && (
        <div className="word-section">
          <div className="word-section-header">
            <button onClick={quitWordSection}><FontAwesomeIcon icon={faArrowLeft} /></button>
          </div>
          <div className="word-section-body">
            <div className="word-section-left">
              <input 
                type="text"
                placeholder='Enter word'
                value={word}
                onChange={e => setWord(e.target.value)} 
                onClick={() => setShowMeaningList(false)}
              />
              <div className="meaning-section">
                <input 
                  type="text"
                  placeholder='Enter meaning'
                  value={meaning}
                  onChange={e => {
                    setMeaning(e.target.value)
                    setShowMeaningList(false)
                  }} 
                  // onClick={suggestMeaning}
                />
                {showMeaningList && meaningList && (
                  <div className="meaning-list-section">
                    <div className="meaning-list">
                      {
                        meaningList.map((meaning, index) => (
                          <li 
                            className="meaning" 
                            key={index}
                            onClick={() => {
                              setMeaning(meaning.definition)
                              setShowMeaningList(false)
                            }}
                            title={meaning.definition}
                          >{meaning.definition}</li>
                        ))
                      }
                    </div>
                    
                    <button className='quit-meaning-list-btn' onClick={() => setShowMeaningList(false)}><FontAwesomeIcon icon={faXmark}/></button>
                  </div>
                )}
              </div>

              <button onClick={addWord}>Add</button>

              <button className='learnBtn' onClick={learnBtn}>Flashcard</button>

              <button onClick={generateMatching} className='openMatchingBtn'>Matching</button>

              <button onClick={generateFilling}>Filling</button>

              <button onClick={generateListening}>Listening</button>
              
            </div>

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
                            localStorage.setItem('words', JSON.stringify(newWords))
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
                }}>Back</button>
              ) : (
                <button className="disabled prev-btn">Back</button>
              )
              }

              {indexLearn < data.length - 1 ? (
                <button className="next-btn" onClick={() => {
                  if (indexLearn < data.length - 1) {
                    setIndexLearn(indexLearn + 1)
                  }
                }}>Next</button>
              )
              : (
                <button className="disabled next-btn">Next</button>
              )
              }
            </div>
          </div>
          <button onClick={() => setShowLearn(false)} className='quitLearnSectionBtn'><FontAwesomeIcon icon={faArrowLeft} /></button>

        </div>
      }

      {showMatching &&
        <div className="matching-section">
          <div className="matching-header">
            <button onClick={() => {
              setShowMatching(false)
              setClickedNameIndex(-1)
              setClickedMeanIndex(-1)
              setClickedName('')
              setClickedMean('')
              setMatchedList([])
              setNoMatchedList([])
            }}><FontAwesomeIcon icon={faArrowLeft} /></button>
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
            <button className='quitFillingBtn' onClick={quitFilling}><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
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
            <button onClick={() => setShowListening(false)}><FontAwesomeIcon icon={faArrowLeft} /></button>
          </div>
          <div className="listening-content">
            <ListeningCard key={listeningCardIndex} word={words[listeningCardIndex].name} order={listeningCardIndex}/>
          </div>
        </div>
      )}
    </div>
    
  )
}

export default App
