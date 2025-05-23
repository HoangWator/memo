import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ReactDOM from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus,faArrowLeft,faTrash,faXmark } from '@fortawesome/free-solid-svg-icons'


function App() {
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [words, setWords] = useState(() => {
    const localWords = JSON.parse(localStorage.getItem('words'))
    return localWords ?? []
  })

  const addWord = () => {
    setWords(prev => {
      if (word != '' && meaning != '') {
        const newWords = [...prev, {name: word, mean: meaning}]
        newWords.reverse()
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

    const showMean = () => {
      setShowDef(true)
    }
    const hideMean = () => {
      setShowDef(false)
    }

    return (
      <div className="card">
        {showDef ? <p>{word.mean}</p> : <h1>{word.name}</h1>}
        <button onClick={showDef ? hideMean : showMean}>{showDef ? "Hide" : "Show"}</button>
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
    setShowCreateFolder(true)
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
  const [meaningList, setMeaningList] = useState([])
  const [showMeaningList, setShowMeaningList] = useState(false)
  // Suggest meaning
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

  return (
    <div className="main">
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
                  onClick={suggestMeaning}
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
                          >{meaning.definition}</li>
                        ))
                      }
                    </div>
                    
                    <button className='quit-meaning-list-btn' onClick={() => setShowMeaningList(false)}><FontAwesomeIcon icon={faXmark}/></button>
                  </div>
                )}
              </div>

              <button onClick={addWord}>Add</button>

              <button className='learnBtn' onClick={learnBtn}>Learn</button>

              
            </div>

            <div className="word-section-right">
              <ul>
                {
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
          <button onClick={() => setShowLearn(false)}>Quit</button>
        </div>
      }
    </div>
  )
}

export default App
