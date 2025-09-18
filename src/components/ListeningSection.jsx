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
    
    const [listeningInputClassName, setListeningInputClassName] = useState('listeningInput')
    return (
      <div className="listening-card">
        <div className="listening-card-content">
          <div className="speak-word-btn" onClick={speakWord}><FontAwesomeIcon icon={faVolumeHigh} className='icon'/></div>
          <input 
            type="text" 
            placeholder='Type what you hear...'
            onKeyDown={e => {
              if (e.key === 'Enter') {
                setUserInput(e.target.value)

                if (e.target.value.toLowerCase() === word.toLowerCase()) {
                    setListeningInputClassName('listeningInput right')
                }
                else {
                  setListeningInputClassName('listeningInput wrong')
                }
              }
            }}
            className={listeningInputClassName}
          />
        </div>

        { userInput && (
          <div className={'listening-explain'}>
            <h4>Answer:</h4>
            <p className='listening-answer'onClick={speakWord}>{word}<FontAwesomeIcon icon={faVolumeHigh} className='icon'/></p>
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
            }}><FontAwesomeIcon icon={faArrowRight} /></button>
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="listening-section">
      <div className="listening-header">
        <button className='quitSectionBtn' onClick={onClose}><FontAwesomeIcon icon={faArrowLeft} /></button>
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