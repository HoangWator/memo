import { useState } from 'react'
import { useEffect } from 'react';
import { faPlus,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { geneAI } from './gemini.js'
import ProgressBar from './ProgressBar';
import meaningSuggestion from './gemini.js';


export default function FillingSection({onClose, data}) {
  const [fillingQuestions, setFillingQuestions] = useState([])
  const [fillingIndex, setFillingIndex] = useState(0)
  const [numberQuestionDone, setNumberQuestionDone] = useState(0)
  const [resultDisplay, setResultDisplay] = useState(false)

  useEffect(() => {
    // Create questions for filling section
    let words = []
    data.forEach(item => words.push(item.name))

    geneAI(words).then((value) => {
      console.log(value)
      setFillingQuestions(value)
    }).catch((error) => {
      console.error(error)
    })
  }, [])
  
  // console.log(fillingQuestions)
  function FillingCard({data, order}) {
    let question = data.question
    let options = data.options
    let ans
    let startQuestion,endQuestion
    let gapClassName, labelClassName, explainClassName;

    if (question.indexOf('[') != -1 && question.indexOf(']') != -1) {
      startQuestion = question.slice(0, question.indexOf('['))
      endQuestion = question.slice(question.indexOf(']') + 1)
      ans = question.slice(question.indexOf('[') + 1, question.indexOf(']'))
    }
    if (question.indexOf('_') != -1) {
      startQuestion = question.slice(0, question.indexOf('_'))
      endQuestion = question.slice(question.indexOf('_'), question.length).replace(/_/g, '') 
      ans = data.word
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

    const [showMeaningSuggestion, setShowMeaningSuggestion] = useState(false)
    const [showFailMeaningSuggestion, setShowFailMeaningSuggestion] = useState(false)
    const [meaningList, setMeaningList] = useState([])
    const handleDoubleClick = () => {
      const selection = window.getSelection();
      if (selection.toString()) {
        meaningSuggestion(selection).then((meaning) => {
          console.log(meaning)
          setMeaningList(meaning);
          setShowMeaningSuggestion(true);
        }).catch((error) => {
          setShowFailMeaningSuggestion(true);
        });
      }
    }
    return (
      <div className="filling-card">
        {showMeaningSuggestion && (
          <div className="meaning-suggestion">
            <div className="meaning-suggestion-header">
              <button onClick={() => {
                setMeaningList([])
                setShowMeaningSuggestion(false)
                setShowFailMeaningSuggestion(false)
              }}><FontAwesomeIcon icon={faXmark}/></button>
            </div>
            <div className="meaning-suggestion-content">
              {showFailMeaningSuggestion && 
                <p>No meaning found. Please try again!</p>
              }
              {
                meaningList.length > 0 && (
                  <ul>
                    {meaningList.map((meaning, index) => (
                      <li key={index}>
                        <h3>{meaning.type}</h3>
                        <p>{meaning.vie}</p>
                        <p>{meaning.eng}</p>
                      </li>
                    ))}
                  </ul>
                )
              }
            </div>
          </div>
        )}

        <p onDoubleClick={handleDoubleClick}>{startQuestion}<span className={gapClassName}>{userInput}</span>{endQuestion}</p>

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
                console.log(fillingIndex)
              }
              else {
                if (numberQuestionDone < fillingQuestions.length) {
                  setNumberQuestionDone(numberQuestionDone + 1)
                }
                console.log(fillingIndex, 'last question')
                setResultDisplay(true)
              }
            }}>Next <FontAwesomeIcon icon={faArrowRight} /></button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="filling-section">
      <div className="filling-header">
        <button className='quitFillingBtn quitSectionBtn' onClick={() => {
          setFillingIndex(0)
          setNumberQuestionDone(0)
          setFillingQuestions([])
          onClose()
        }}><FontAwesomeIcon icon={faArrowLeft} /></button>
        <div className="progress-bar">
          <ProgressBar done={numberQuestionDone} sum={fillingQuestions.length}/>
        </div>
      </div>
      <div className="filling-content">
        {fillingQuestions.length > 0 && 
          <FillingCard data={fillingQuestions[fillingIndex]} order={fillingIndex}/>
        }

        {resultDisplay && (
            <div className="result-display">
              <h2>Result</h2>
              <p>You have answered {numberQuestionDone} out of {fillingQuestions.length} questions.</p>
              <button onClick={() => {
                setResultDisplay(false)
                onClose()
              }}>Close</button>
            </div>
          )
        }
      </div>

    </div>
  )
}