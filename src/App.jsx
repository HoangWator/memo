import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

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
  return (
    <div className="main">
      <div className="word-section">

        <input 
          type="text"
          placeholder='Enter word'
          value={word}
          onChange={e => setWord(e.target.value)} 
        />
        <input 
          type="text"
          placeholder='Enter meaning'
          value={meaning}
          onChange={e => setMeaning(e.target.value)} 
        />

        <button onClick={addWord}>Add</button>
        <ul>
            {
              words.map((word, index) => 
                <li key={index}>
                  <h3>{word.name}</h3>
                  <p>{word.mean}</p>
                  <button 
                  className='deleteBtn'
                  onClick={() => {
                    const newWords = words.filter((words, i) => i !== index)
                    localStorage.setItem('words', JSON.stringify(newWords))
                    setWords(newWords)
                  }}>Delete</button>
                </li>
              )
            }
            </ul>
        

        <button className='learnBtn' onClick={learnBtn}>Learn</button>
      </div>

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
