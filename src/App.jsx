import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ReactDOM from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus,faArrowLeft,faTrash,faXmark,faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { geneAI } from './gemini'

function App() {
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [words, setWords] = useState(() => {
    const localWords = JSON.parse(localStorage.getItem('words'))
    return localWords ?? []
  })

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
        const newWords = [...prev, {name: word, mean: meaning}]
        // newWords.reverse()
        const jsonWords = JSON.stringify(newWords)
    
        localStorage.setItem('words', jsonWords)

        return newWords 
      }
      else {
        const newWords = JSON.parse(localStorage.getItem('words'))
        return newWords
      }
    })

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

  const [folderName, setFolderName] = useState('')
  const [folders, setFolders] = useState(() => {
    const localFolders = JSON.parse(localStorage.getItem('folders'))
    return localFolders ?? []
  })

  const handleFolderNameChange = () => {
    if (folderName != '') {
      setFolders(prev => {
        const newFolders = [...prev, folderName]
        const jsonFolders = JSON.stringify(newFolders)
    
        localStorage.setItem('folders', jsonFolders)

        return newFolders
      })
      
    }

    setFolderName('')
    setShowCreateFolder(false)
  }

  const [showWordSection, setShowWordSection] = useState(false)

  const openWordSection = () => {
    setShowWordSection(true)
    setShowCreateFolder(false)
  }

  const quitWordSection = () => {
    setShowWordSection(false)
  }

  async function getWordMeaning(word){
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await res.json();
    const wordData = data[0];
    // const phonetics = wordData.phonetics || [];

    // let phoneticTxt = "", phoneticAudio = "";

    // for(const phonetic of phonetics){
    //     if(phonetic.text && !phoneticTxt)
    //           phoneticTxt = phonetic.text
    //     if(phonetic.audio && !phoneticAudio)
    //           phoneticAudio = phonetic.audio;
    //     if(phoneticTxt && phoneticAudio) break;
    // }

    const meaning = wordData.meanings[0];

    return {
        word: word.toLowerCase(),
        // phonetic: {
        //       text: phoneticTxt,
        //       audio: phoneticAudio
        // },
        // speechPart: meaning.partOfSpeech,
        definition: meaning.definitions,
        // synonyms: meaning.synonyms,
        // antonyms: meaning.antonyms,
        // example: meaning.definitions[0].example || ""
    }
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
  }

  return (
    <div className="main">
      {loader && <Loader />}
      <div className="create-folder-section">
        <button className='add-folder-btn' onClick={createFolder}><FontAwesomeIcon className='icon' icon={faPlus} /></button>
        {showCreateFolder && (
          <div className="create-folder-field">
            <h3>Create a folder</h3>
            <input 
              type="text" 
              placeholder='Enter folder name' 
              onChange={e => setFolderName(e.target.value)}
              value={folderName}
            />
            <button onClick={handleFolderNameChange}>Add folder</button>
          </div>
        )}
      </div>

      <div className="folder-list">
        {folders.map((folder, index) => (
          <div className="folder" key={index} onClick={openWordSection}>{folder}</div>
        ))}
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
          </div>
          <div className="filling-content">
            <FillingCard data={fillingQuestions[fillingIndex]} order={fillingIndex}/>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
