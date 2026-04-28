import React, { useState, useEffect } from 'react';
import { faPlus,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight,faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { updateReviewSchedule } from '../components/handleData'

function MatchingCard({data, onNext, addToHistory}) {
  const [isCorrect, setIsCorrect] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const options = data.options

  const checkAnswer = (selectedOption, index) => {
    // console.log(selectedOption)
    // console.log(data)
    if (isCorrect !== null) return
    setSelectedIndex(index)
    let isSameDefEng = selectedOption.definition_eng === data.answer_eng && selectedOption.type === data.answer_type && selectedOption.definition_eng !== ""
    let isSameDefVie = selectedOption.definition_vie === data.answer_vie && selectedOption.type === data.answer_type && selectedOption.definition_vie !== ""
    if ( isSameDefEng || isSameDefVie) {
      // console.log("Correct")
      addToHistory({
        word: data.question, 
        answer_eng: data.answer_eng, 
        answer_vie: data.answer_vie,
        result: "correct",
      })
      setIsCorrect(true)
    } else {
      // console.log("Wrong")
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
            className={'max-sm:w-full w-9/20 bg-primary-surface rounded-lg text-secondary-text p-2.5 cursor-pointer relative ' + 
            (isCorrect && selectedIndex === index ? "border-2 border-success bg-success/10 " : '') +
            (!isCorrect && isCorrect !== null && selectedIndex === index ? "border-2 border-wrong bg-wrong/10 " : '')
          }
            onClick={() => checkAnswer(option, index)}
          >
            <span className='italic'>{option.definition_eng}</span> 
            <span className='italic'>{option.definition_vie}</span> 
            <span className={option.type}>{option.type === 'phverb' ? 'phrasal verb' : option.type}</span>
            {isCorrect && selectedIndex === index && (
              <div className='absolute right-1 top-1 flex items-center justify-center rounded-lg animate-tick-fade'>
                <div className='flex items-center justify-center w-6 h-6 rounded-full bg-success'>
                  <FontAwesomeIcon icon={faCheck} className='text-white text-sm' />
                </div>
              </div>
            )}
            {isCorrect === false && selectedIndex === index && (
              <div className='absolute right-1 top-1 flex items-center justify-center rounded-lg animate-tick-fade'>
                <div className='flex items-center justify-center w-6 h-6 rounded-full bg-wrong'>
                  <FontAwesomeIcon icon={faX} className='text-white text-sm' />
                </div>
              </div>
            )}
            <style>{`
              @keyframes tickFadeIn {
                0% {
                  opacity: 0;
                  transform: scale(0.5);
                }
                50% {
                  transform: scale(1.2);
                }
                100% {
                  opacity: 1;
                  transform: scale(1);
                }
              }
              
              .animate-tick-fade {
                animation: tickFadeIn 0.4s ease-out forwards;
              }
              
            `}</style>
          </button>
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
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [historyData, setHistoryData] = useState([])
  const [questionLength, setQuestionLength] = useState(10)
  const [showMatchingCard, setShowMatchingCard] = useState(false)
  const [doneQuestions, setDoneQuestions] = useState(0)
  const [showContinueModal, setShowContinueModal] = useState(false)
  const [showResult, setShowResult] = useState(null)

  const addToHistory = (item) => {
    setHistoryData([...historyData, item])
  }

  const handleNextCard = () => {
    if (doneQuestions === questionLength - 1) {
        setShowContinueModal(true)
    }
    else {
      if (currentQuestionIndex < questions.length - 1) {
        setDoneQuestions(doneQuestions + 1)
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      }
      else {
        onClose()
        
      }
    }
    // else {
    //   // onClose()
    //   // if (reviewMode && userID && currentFolder) {
    //   //   updateReviewSchedule(userID, currentFolder, historyData, 'matching')
    //   // }
    // }
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
    if (data.length >= 2) {
      const questions = [] 
      data.forEach(item => {
        // console.log(item.type)
        const otherOptions = data.filter(opt => opt.definition_eng !== item.definition_eng || opt.definition_vie !== item.definition_vie)
        const sameTypeOptions = otherOptions.filter(opt => opt.type === item.type)
        const othersTypeOptions = data.filter(opt => opt.type !== item.type)

        const options = []
        options.push({
          definition_eng: item.definition_eng,
          definition_vie: item.definition_vie,
          type: item.type
        })
        if (sameTypeOptions.length > 3) {
          options.push(...sameTypeOptions.slice(0, 3))
        }
        else {
          let remainingSlots = 3 - sameTypeOptions.length
          if (remainingSlots > 0) {
            options.push(...sameTypeOptions)
            options.push(...othersTypeOptions.slice(0, remainingSlots))
          }
          else {
            options.push(...sameTypeOptions)
          }
        }
        
        questions.push({
          question: item.name, 
          answer_eng: item.definition_eng,
          answer_vie: item.definition_vie,
          answer_type: item.type,
          options: shuffleArray(options)
        })
      })
      setQuestions(shuffleArray(questions))
    }
    if (reviewMode) {
      setQuestionLength(questions.length)
      setShowMatchingCard(true)
    }
  }, [])

  // console.log(doneQuestions)
  return (
    <div className='fixed top-0 left-0 w-full h-screen bg-bg z-10'>
      <div className='p-4 absolute top-0 left-0 flex items-center gap-4'>
        <button 
          className='quit-btn'
          onClick={onClose}
        ><FontAwesomeIcon icon={faArrowLeft} /></button>
      </div>
      {
        !showMatchingCard && !reviewMode &&
        <div className='w-full h-full flex flex-col items-center justify-center gap-8'>
          <div className='p-4'>
            <h1 className='text-primary-text text-2xl mb-2.5'>Số từ muốn học:</h1>
            <input 
              className="input-field w-full pl-10 pr-3 py-2 rounded-md border border-transparent bg-primary-surface text-primary-text mb-2.5" 
              type="number"
              value={questionLength}
              onChange={e => setQuestionLength(e.target.value)}
              placeholder='Enter questions length'
            />
            <button 
              className='px-4 py-2 rounded-lg bg-primary text-primary-text cursor-pointer hover:scale-105'
              onClick={() => {
                if (questionLength > 0 && questionLength <= questions.length) {
                  setShowMatchingCard(true)
                }
              }}
            >
              Learn now!
            </button>
          </div>
        </div>
      }
      {
        showContinueModal &&
        <div className='bg-black/50 w-full h-full fixed top-0 left-0 flex items-center justify-center z-20'>
          <div className='bg-primary-surface p-6 rounded-lg shadow-lg'>
            <h2 className='text-xl text-primary-text mb-4'>Bạn đã hoàn thành {doneQuestions + 1}/{questionLength} câu hỏi. Tiếp tục học ?</h2>
            <div className='flex justify-end gap-4'>
              <button 
                className='px-4 py-2 rounded-lg bg-primary text-primary-text cursor-pointer hover:scale-105'
                onClick={() => {
                  setShowContinueModal(false)
                  setDoneQuestions(0)
                  setCurrentQuestionIndex(currentQuestionIndex + 1)
                }}
              >
                Yes
              </button>
              <button 
                className='px-4 py-2 rounded-lg bg-primary-surface/10 text-primary-text cursor-pointer hover:scale-105'
                onClick={() => {
                  setShowContinueModal(false)
                  onClose()
                  if (reviewMode && userID && currentFolder) {
                    updateReviewSchedule(userID, currentFolder, historyData, 'matching')
                  }
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      }
      <div className='w-full h-full flex flex-col items-center justify-center gap-8'>
        {questions.length > 0 && showMatchingCard &&
          <MatchingCard 
            data={questions[currentQuestionIndex]}
            onNext={handleNextCard}
            addToHistory={addToHistory}
          />
        }
        {/* {
          showResult && (
            <div>
              <h1>Kết quả</h1>
            </div>
          )
        } */}
        {data.length < 2 &&
          <div className='text-center'>
            <img 
              src="https://png.pngtree.com/png-vector/20250116/ourmid/pngtree-folder-empty-vector-png-image_15213864.png" 
              alt="" 
              className='w-48 h-48 mx-auto' 
            />
            <p className='text-xl text-primary-text'>Không đủ từ để luyện tập</p>
            <p className='text-sm text-secondary-text'>Vui lòng thêm ít nhất 2 từ vào thư mục</p>
          </div>
        }
      </div>
    </div>
  )
}

export default MatchingSection;

