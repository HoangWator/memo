import { useState } from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';
import { faPlus,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ProgressBar from './ProgressBar';
import Loader from './Loader'
import Flashcard from './Flashcard.jsx'
import FillingSection from './FillingSection.jsx'
import ListeningSection from './ListeningSection.jsx'

import { addWordDB,deleteWordDB } from './handleData.js'
import { getFolderDataDB } from './handleData.js'
import meaningSuggestion from './gemini.js'
import { geneAI } from './gemini.js'

export default function WordSection({onClose, currentFolder, userID}) {
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [words, setWords] = useState([])
  const [allWords, setAllWords] = useState([])

  const meaningInputRef = useRef(null);
  const wordInputRef = useRef(null);

  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [showWordSectionLeft, setShowWordSectionLeft] = useState(false)

  useEffect(() => {
    setLoader(true)
    getFolderDataDB(userID, currentFolder).then((data) =>  {
        if (data) {
          setWords(data);
          setAllWords(data);
          setLoader(false);
        }
    }).catch((error) => {
        console.error("Error fetching folder data:", error);
      });
  }, [])

  const addWord = () => {
    const d = new Date()
    if (word != '' && meaning != '') {
      let typeWord = meaning.slice(meaning.indexOf('(') + 1, meaning.indexOf(')'))
      let newMeaning =  meaning.slice(meaning.indexOf(')') + 1).trim()
      setWords([...words, {
        name: word.toLowerCase(), 
        mean: newMeaning, 
        type: typeWord
      }])
      addWordDB(userID, currentFolder, {
        name: word.toLowerCase(), 
        mean: newMeaning,
        type: typeWord,
        dateReview: d
      })
    }
    setWord('')
    setMeaning('')
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
      setMeaningList([])
      setMeaningListLoader(true);
      meaningSuggestion(word).then(data => {
        setMeaningList(data)
        setShowMeaningList(true);
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

  // flashcard
  const [showLearn, setShowLearn] = useState(false)
  const learnBtn = () => {
    if (words.length >= 4) {
      setShowLearn(true)
    }
    else {
      alert('Please enter at least 4 words.')
    }
  }

  // Filling
  const [showFilling, setShowFilling] = useState(false)
  const [loader, setLoader] = useState(false)
  const [fillingQuestions, setFillingQuestions] = useState([])

  const generateFilling = (wordList) => {
    let words = []
    wordList.forEach(item => words.push(item.name))
    
    if (words.length >= 4) {
      setLoader(true)
      geneAI(words).then((value) => {
        setFillingQuestions(value)
        setShowFilling(true)
        setLoader(false)
      })
    }
    else {
      alert("Please enter at least 4 words!")
    }
  }
  
  const quitFilling = () => {
    setShowFilling(false)
    setFillingQuestions([])
  }


  // Listening 
  const [listeningWords, setListeningWords] = useState('')
  const [showListening, setShowListening] = useState(false)

  function shuffleArray(array) {
    const arr = [...array]; // make a copy to avoid mutating original
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const generateListening = (words) => {
    if (words.length > 0) {
      setShowListening(true)
      setListeningWords(shuffleArray(words))
    }
    else {
      alert("Please enter at least 4 words!")
    }
  }

  function MeaningDisplay({word}) {
    let meaningCln;
    if (word.type === 'noun') {
      meaningCln = 'noun'
    }
    else if (word.type === 'verb') {
      meaningCln = 'verb'
    }
    else if (word.type === 'adjective') {
      meaningCln = 'adjective'
    }
    else if (word.type === 'adverb') {
      meaningCln = 'adverb'
    }
    else {
      meaningCln = 'other'
    }
    return (
      <h3>{word.name.toLowerCase()}<span className={meaningCln}>{word.type}</span></h3>
    )
  }
  return (
    <div className="word-section" onClick={() => {
      if (showRemindSuggestion) {
        setShowRemindSuggestion(false)
      }
    }}>
      {loader && <Loader />}
      <div className="word-section-header">
        <button onClick={onClose} className='quitSectionBtn'><FontAwesomeIcon icon={faArrowLeft} /></button>
      </div>
      <div className="word-section-body">
        <button className='showWordSectionLeftBtn' onClick={() => setShowWordSectionLeft(!showWordSectionLeft)}>
          Add word
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
              if (meaningList.length > 0) {
                setMeaningList([])
              }
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
                    setMeaning(`(${meaningList[selectedMeaningIndex].type}) ${meaningList[selectedMeaningIndex].vie}`);
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
            {meaningListLoader && (
              <div className="meaning-suggest-loader-section">
                <div className="meaning-suggest-loader"></div>
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
                      else if (meaning.type === 'adverb') {
                        typeClassName = 'adverb'
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
                          setMeaning(`(${meaning.type}) ${meaning.vie}`)
                          setShowMeaningList(false)
                        }}
                        // style={isSelected ? { background: '' } : {}}
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

          <button onClick={() => generateFilling(words)} className='reviewBtn'>Review</button>
          
          <button className='delete-folder-btn' onClick={() => {
            setShowAskToDelete(true)
            setRenameTarget(currentFolder)
            setShowWordSection(false)
          }}><FontAwesomeIcon icon={faTrash} /> Delete this folder</button>
        </div>
        
        {showWordSectionLeft && (
          <div className="word-section-left-modal mobile" onClick={() => {
            setShowWordSectionLeft(false)
          }}>
            <div className="word-section-left" onClick={e => e.stopPropagation()}>
              <input 
                type="text"
                placeholder='Enter word'
                value={word}
                ref={wordInputRef}
                onChange={e => setWord(e.target.value)} 
                onClick={() => {
                  setShowRemindSuggestion(false)
                  setShowMeaningList(false)
                  if (meaningList.length > 0) {
                    setMeaningList([])
                  }
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
                {meaningListLoader && (
                  <div className="meaning-suggest-loader-section">
                    <div className="meaning-suggest-loader"></div>
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

              
              
              <button className='delete-folder-btn' onClick={() => {
                setShowAskToDelete(true)
                setRenameTarget(currentFolder)
                setShowWordSection(false)
              }}><FontAwesomeIcon icon={faTrash} /> Delete this folder</button>
            </div>
          </div>
        )}
        

        <div className={word.length > 0 ? "word-section-right" : "word-section-right empty"}>
          <div className="learning-modes mobile">
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
                      <MeaningDisplay word={word}/>
                      <p>{word.mean.toLowerCase()}</p>

                      <button 
                        className='deleteBtn'
                        onClick={() => {
                          const newWords = words.filter((words, i) => i !== index)
                          setAllWords(newWords)
                          setWords(newWords)
                          deleteWordDB(userID, currentFolder, word)
                        }}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </li>
                  )
              ) : (
                <p className='noWords'>Nothing here!</p>
              )
            }
          </ul>
        </div>
      </div>
      
      {showLearn && 
        <Flashcard data={allWords} onClose={() => setShowLearn(false)}/>
      }

      {showFilling && 
        <FillingSection 
          onClose={quitFilling} 
          fillingQuestions={fillingQuestions}
        />
      }

      {showListening && (
        <ListeningSection listeningWords={listeningWords} onClose={() => setShowListening(false)}/>
      )}
    </div>
  )
}