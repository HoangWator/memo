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
  const [showFillingCard, setShowFillingCard] = useState(true)
  const [wrongAnswers, setWrongAnswers] = useState([])

  const addWrongAnswer = (question) => {
    setWrongAnswers(prevWrongAnswers => [...prevWrongAnswers, question]);
  }

  useEffect(() => {
    // Create questions for filling section
    let wordDetails = []
    let words = []
    data.forEach(item => words.push(item.name))
    data.forEach(item => wordDetails.push(`${item.name} (${item.type}: ${item.mean})`))
    console.log(words)

    geneAI(wordDetails, words).then((value) => {
      console.log(value)
      setFillingQuestions(value)
    }).catch((error) => {
      console.error(error)
    })
  }, [])
  
  // console.log(fillingQuestions)
  function FillingCard({data, order, onWrongAnswer}) {
    let question = data.question
    let options = data.options
    let ans = data.answer
    let startQuestion,endQuestion
    let gapClassName, explainClassName;

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
      gapClassName = 'text-primary-text bg-success'
      explainClassName = 'bg-success/10 border-l-4 border-success'
    }
    else if (userInput != '' && userInput !== ans) {
      gapClassName = ' text-primary-text bg-wrong'
      explainClassName = 'bg-wrong/10 border-l-4 border-wrong'
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
      <div className="filling-card w-1/2">
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
        <div className='flex flex-col items-center'>
          <p onDoubleClick={handleDoubleClick} className='text-primary-text text-center'>{startQuestion}<span className={'inline-block text-base/6 p-1 min-w-15 rounded-lg bg-primary-surface ' + gapClassName}>{userInput}</span>{endQuestion}</p>

          <div className="filling-options mt-5 flex flex-wrap justify-center gap-5 w-[450px]">
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
                  className='hidden'
                />
                <label htmlFor={'q'+order+'option'+index} className={'cursor-pointer rounded-lg p-2.5 inline-block min-w-[200px] hover:bg-secondar hover:text-primary-texty-surface ' + (gapClassName && clicked === index ? gapClassName : 'text-secondary-text bg-primary-surface')}>{item}</label>
              </div>
            ))}
          </div>
        </div>
        
        { clicked !== -1 && (
          <div className={'p-2.5 rounded-lg mt-5 overflow-hidden ' + explainClassName}>
            <h3 className='text-primary-text'>Answer:</h3>
            <p className='text-secondary-text'>{startQuestion}<span className='text-primary-text font-semibold'>{ans}</span>{endQuestion}</p>
            <button 
              onClick={() => {
                const isCorrect = userInput === ans

                // report wrong to parent so it's recorded once on submit
                if (!isCorrect) {
                  onWrongAnswer({
                    question: data.question,
                    options: data.options,
                    answer: data.answer
                  })
                }
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
                  console.log('Wrong answers:', wrongAnswers)
                  setShowFillingCard(false)
                  setResultDisplay(true)
                }
              }}
              className='click-btn float-right'
            >Next <FontAwesomeIcon icon={faArrowRight} /></button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-bg z-50 filling-section">
      <div className="header p-2.5 fixed top-0 left-0 w-full flex items-center justify-center bg-bg z-50">
        <button className='quit-btn absolute top-2.5 left-2.5' onClick={() => {
          setFillingIndex(0)
          setNumberQuestionDone(0)
          setFillingQuestions([])
          onClose()
        }}><FontAwesomeIcon icon={faArrowLeft} /></button>
        <div className="progress-bar">
          <ProgressBar done={numberQuestionDone} sum={fillingQuestions.length}/>
        </div>
      </div>
      <div className="filling-content flex items-center justify-center h-full">
        {fillingQuestions.length > 0 && showFillingCard && 
          <FillingCard 
            data={fillingQuestions[fillingIndex]} 
            order={fillingIndex}
            onWrongAnswer={addWrongAnswer}
          />
        }

        {resultDisplay && (
            <div className="result-display pr-10 pl-10 pt-2.5 pb-2.5 bg-primary-surface rounded-lg text-center">
              <p className='text-secondary-text'>You correct:</p>
              <h1 className='text-3xl font-bold text-primary-text mt-5 mb-5'>{Math.round(100 - wrongAnswers.length / fillingQuestions.length * 100) + '%'}</h1>
              <div className='flex gap-2.5 items-center'>
                <button 
                  onClick={() => {
                    setResultDisplay(false)
                    onClose()
                  }}
                  className='click-btn bg-'
                >Close</button>
                {wrongAnswers.length > 0 &&
                  <button className='click-btn'>
                    Retake
                  </button>
                }
              </div>
            </div>
          )
        }
      </div>

    </div>
  )
}