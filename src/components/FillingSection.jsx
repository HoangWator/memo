import { useState } from 'react'
import { useEffect } from 'react';
import { faPlus,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ProgressBar from './ProgressBar';


export default function FillingSection({onClose, fillingQuestions}) {
  const [fillingIndex, setFillingIndex] = useState(0)
  const [numberQuestionDone, setNumberQuestionDone] = useState(0)


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
                onClose()
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
        <button className='quitFillingBtn quitSectionBtn' onClick={onClose}><FontAwesomeIcon icon={faArrowLeft} /></button>
        <div className="progess-bar">
          <ProgressBar done={numberQuestionDone} sum={fillingQuestions.length}/>
        </div>
      </div>
      <div className="filling-content">
        <FillingCard data={fillingQuestions[fillingIndex]} order={fillingIndex}/>
      </div>
    </div>
  )
}