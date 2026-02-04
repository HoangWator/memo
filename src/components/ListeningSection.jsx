import { useState } from 'react'
import { useEffect } from 'react';
import { faPlus,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ProgressBar from './ProgressBar'

export default function ListeningSection({listeningWords, onClose}) {
  const [listeningCardIndex, setListeningCardIndex] = useState(0)
  const [doneQuestions, setDoneQuestions] = useState(0)

  function ListeningCard({word, order}) {
    const speakWord = () =>  {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance);
    }

    const [userInput, setUserInput] = useState('')
    
    return (
      <div className="bg-primary-surface p-5 rounded-lg">
        <div className=" flex flex-col items-center listening-card">
          <div className="p-5 rounded-lg cursor-pointer text-secondary-text" onClick={speakWord}><FontAwesomeIcon icon={faVolumeHigh} className='text-4xl'/></div>
          <input 
            type="text" 
            placeholder='Gõ những gì bạn nghe...'
            onKeyDown={e => {
              if (e.key === 'Enter') {
                setUserInput(e.target.value)

                if (e.target.value.toLowerCase() === word.toLowerCase()) {

                }
                else {

                }
              }
            }}
            className={'input-field rounded-lg' + (userInput ? (userInput.toLowerCase() === word.toLowerCase() ? ' bg-success/10 border-l-4 border-success' : ' bg-wrong/10 border-l-4 border-wrong') : '')}
          />
        </div>

        { userInput && (
          <div className={'p-5 rounded-lg mt-2.5' + (userInput ? (userInput.toLowerCase() === word.toLowerCase() ? ' bg-success/10 border-l-4 border-success' : ' bg-wrong/10 border-l-4 border-wrong') : '')}>
            <h4 className='text-secondary-text select-none'>Đáp án:</h4>
            <p className='text-primary-text cursor-pointer'onClick={speakWord}>{word}<FontAwesomeIcon icon={faVolumeHigh} className='ml-2.5'/></p>
            <button onClick={() => {
              if (listeningCardIndex < listeningWords.length - 1) {
                setListeningCardIndex(listeningCardIndex + 1)
                setDoneQuestions(doneQuestions + 1);
              }
              else {
                setListeningCardIndex(0)
                setDoneQuestions(0);
                console.log(redoWords);
                onClose()
              }
              
              setUserInput('');
            }}
            className='click-btn mt-5 flex items-center justify-center'
            ><FontAwesomeIcon icon={faArrowRight} /></button>
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-bg flex flex-col justify-center items-center z-50 listening-section">
      <div className="w-full absolute top-0 left-0 p-2.5 flex items-center justify-center bg-bg z-50 listening-header">
        <button className='quit-btn absolute left-2.5 top-2.5' onClick={onClose}><FontAwesomeIcon icon={faArrowLeft} /></button>
        <div className="progress-bar">
          <ProgressBar done={doneQuestions} sum={listeningWords.length}/>
        </div>
      </div>
      <div className="listening-content">
        <ListeningCard key={listeningCardIndex} word={listeningWords[listeningCardIndex].name} order={listeningCardIndex}/>
      </div>
    </div>
  )
}