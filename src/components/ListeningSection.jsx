import { useState } from 'react'
import { useEffect } from 'react';
import { faPlus,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ProgressBar from './ProgressBar'
import { puter } from "@heyputer/puter.js";

export default function ListeningSection({listeningWords, onClose}) {
  console.log(listeningWords);
  const [listeningCardIndex, setListeningCardIndex] = useState(0)
  const [doneQuestions, setDoneQuestions] = useState(0)

  function ListeningCard({word, order}) {
    const speakWord = () => {
      // const utterance = new SpeechSynthesisUtterance(word);
      // utterance.lang = 'en-US'
      // speechSynthesis.speak(utterance);

      puter.ai.txt2speech(word.name, {
        voice: "Joanna",
        engine: "standard",
        language: "en-US"
      })
      .then((audio)=> audio.play());

    }

    const [userInput, setUserInput] = useState('')
    
    return (
      <div className="p-5 rounded-lg">
        <div className=" flex flex-col items-center listening-card">
          <div className="p-5 rounded-lg cursor-pointer text-secondary-text" onClick={speakWord}><FontAwesomeIcon icon={faVolumeHigh} className='text-4xl'/></div>
          <input 
            type="text" 
            placeholder='Gõ những gì bạn nghe...'
            onKeyDown={e => {
              if (e.key === 'Enter') {
                setUserInput(e.target.value)

                if (e.target.value.toLowerCase() === word.name.toLowerCase()) {

                }
                else {

                }
              }
            }}
            className={'input-field bg-primary-surface text-secondary-text rounded-lg' + (userInput ? (userInput.toLowerCase() === word.name.toLowerCase() ? ' bg-success/10 border-l-4 border-success text-primary-text' : ' bg-wrong/10 border-l-4 border-wrong text-primary-text') : 'bg-primary-surface')}
          />
        </div>

        { userInput && (
          <div className={'p-5 rounded-lg mt-2.5 overflow-hidden' + (userInput ? (userInput.toLowerCase() === word.name.toLowerCase() ? ' bg-primary-surface border-l-4 border-success' : ' bg-primary-surface border-l-4 border-wrong') : '')}>
            {/* <h4 className='text-secondary-text select-none'>Đáp án:</h4> */}
            <div className='flex'>
              <p className='text-primary-text cursor-pointer text-xl'onClick={speakWord}>{word.name}<FontAwesomeIcon icon={faVolumeHigh} className='ml-2.5'/></p>
              <span className={word.type + ' ml-2 text-sm bg-transparent'}>{word.type}</span>
            </div>
            <div className='mt-1'>
              <p className='italic text-secondary-text'>{word.definition_eng}</p>
              <p className='italic text-secondary-text'>{word.definition_vie}</p>
            </div>
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
            className='click-btn mt-5 flex items-center justify-center float-right'
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
        <p className='text-primary-text text-xl text-center mb-5'>{listeningCardIndex + 1}/{listeningWords.length}</p>
        {
          listeningWords.length >= 2 ? 
            <ListeningCard 
              key={listeningCardIndex} 
              word={listeningWords[listeningCardIndex]} 
              order={listeningCardIndex}
            /> 
          : <div className='text-center'>
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