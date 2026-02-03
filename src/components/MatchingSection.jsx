import React, { useState, useEffect } from 'react';
import { faPlus,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { updateReviewSchedule } from '../components/handleData'

function MatchingCard({data, onNext, addToHistory}) {
  const [isCorrect, setIsCorrect] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const options = data.options

  const checkAnswer = (selectedOption, index) => {
    if (isCorrect !== null) return
    setSelectedIndex(index)
    if (selectedOption.definition_eng === data.answer_eng || selectedOption.definition_vie === data.answer_vie) {
      addToHistory({
        word: data.question, 
        answer_eng: data.answer_eng, 
        answer_vie: data.answer_vie,
        result: "correct",
      })
      setIsCorrect(true)
    } else {
      addToHistory({
        word: data.question, 
        answer_eng: data.answer_eng, 
        answer_vie: data.answer_vie,
        result: "wrong",
      })
      setIsCorrect(false)
    }
  }

  return (
    <div className='w-1/2'>
      <h1 className='text-3xl text-primary-text text-center'>{data.question}</h1>
      <div className='flex justify-center w-full flex-wrap gap-1 mt-5'>
        {options.map((option, index) => (
          <button 
            key={index} 
            className={'w-9/20 bg-primary-surface rounded-lg text-secondary-text p-2.5 cursor-pointer ' + 
            (isCorrect && selectedIndex === index ? "border-l-2 border-l-success bg-success/10" : '') +
            (isCorrect === false && selectedIndex === index ? "border-l-2 border-l-wrong bg-wrong/10" : '')
            }
            onClick={() => checkAnswer(option, index)}
          >{option.definition_eng} <span className='italic'>{option.definition_vie}</span></button>
        ))}
      </div>
      <div className='text-center mt-2.5'>
        {selectedIndex !== null && (
          <button 
            className='click-btn'
            onClick={() => {
              onNext()
              setIsCorrect(null)
              setSelectedIndex(null)
            }}
          ><FontAwesomeIcon icon={faArrowRight} /></button>
        )}
      </div>
    </div>
  )
}

function MatchingSection({onClose, data, reviewMode, userID, currentFolder}) {
  // console.log(data)
  
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const [historyData, setHistoryData] = useState([])

  const addToHistory = (item) => {
    setHistoryData([...historyData, item])
  }

  const handleNextCard = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
    else {
      onClose()
      console.log('History Data:', historyData)
      if (reviewMode && userID && currentFolder) {
        updateReviewSchedule(userID, currentFolder, historyData, 'matching')
      }
    }
  }

  // Shuffle options
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  useEffect(() => {
    const questions = [] 
    data.forEach(item => {
      const otherOptions = data.filter(i => i.definition_eng !== item.definition_eng && i.definition_vie !== item.definition_vie && i.name !== item.name)
      
      let shuffleOptions;
      if (otherOptions.length > 3) {
        shuffleOptions = shuffleArray(otherOptions).slice(0,3)
      }
      else {
        shuffleOptions = shuffleArray(otherOptions)
      }

      const options = []
      options.push({
        definition_eng: item.definition_eng,
        definition_vie: item.definition_vie
      })
      shuffleOptions.forEach(opt => {
        options.push({
          definition_eng: opt.definition_eng,
          definition_vie: opt.definition_vie
        })
      })
      questions.push({
        question: item.name, 
        answer_eng: item.definition_eng,
        answer_vie: item.definition_vie,
        options: shuffleArray(options)
      })
    })
    console.log(questions)
    setQuestions(questions)
  }, [])

  return (
    <div className='fixed top-0 left-0 w-full h-screen bg-bg z-10'>
      <div className='p-4 absolute top-0 left-0 flex items-center gap-4'>
        <button 
          className='quit-btn'
          onClick={onClose}
        ><FontAwesomeIcon icon={faArrowLeft} /></button>
      </div>

      <div className='w-full h-full flex flex-col items-center justify-center gap-8'>
        {questions.length > 0 &&
          <MatchingCard 
            data={questions[currentQuestionIndex]}
            onNext={handleNextCard}
            addToHistory={addToHistory}
          />
        }
      </div>
    </div>
  )
}

export default MatchingSection;

