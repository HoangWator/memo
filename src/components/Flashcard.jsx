import { useState } from 'react'
import { useEffect } from 'react';
import { faPlus,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export default function Flashcard({data, onClose}) {
  const [indexLearn, setIndexLearn] = useState(0)
  

  function Card({word}) {
    const [isFlipped, setIsFlipped] = useState(false)

    const handleFlip = () => {
      setIsFlipped(!isFlipped)
    }
    return (
      <div className="flip-card w-90 h-90 mt-2.5 mb-2.5" onClick={handleFlip}>
        <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
          {/* Front of card */}
          <div className="flip-card-front">
            <div className="w-full h-full p-5 bg-primary-surface rounded-lg text-primary-text flex items-center justify-center flex-col">
              <h1 className='text-3xl text-center'>{word.name}</h1>
              <p className={'text-base mt-2 ' + word.type}>{word.type == 'phverb' ? 'Phrasal Verb' : word.type}</p>
              <span className='absolute bottom-5 right-5'><FontAwesomeIcon icon={faArrowsLeftRight} /></span>
            </div>
          </div>
          
          {/* Back of card */}
          <div className="flip-card-back">
            <div className="w-full h-full p-5 bg-primary-surface rounded-lg text-primary-text flex items-center justify-center flex-col select-none">
              <p className='text-center mb-3'><span className='font-semibold'></span> {word.definition_eng}</p>
              <p className='text-center'><span className='font-semibold'></span> {word.definition_vie}</p>
              <span className='absolute bottom-5 right-5'><FontAwesomeIcon icon={faArrowsLeftRight} /></span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .flip-card {
          perspective: 1000px;
          cursor: pointer;
          position: relative;
        }
        
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        
        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
        
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
      
      <div className="fixed top-0 bottom-0 left-0 right-0 bg-bg flex flex-col items-center justify-center p-4 z-50">
      <button onClick={onClose} className='quit-btn absolute top-2.5 left-2.5'><FontAwesomeIcon icon={faArrowLeft} /></button>

      <div className="card-list flex flex-col items-center">
        <p className="text-secondary-text">
          {indexLearn + 1} / {data.length}
        </p>

        <Card word={data[indexLearn]} />

        <div className="nav-btns">
          <button className="p-2.5 bg-primary-surface rounded-lg cursor-pointer text-secondary-text mr-2.5 hover:bg-secondary-surface" onClick={() => {
            if (indexLearn > 0) {
              setIndexLearn(indexLearn - 1)
            }
          }}><FontAwesomeIcon icon={faArrowLeft} /></button>
          <button className="p-2.5 bg-primary-surface rounded-lg cursor-pointer text-secondary-text hover:bg-secondary-surface" onClick={() => {
            if (indexLearn < data.length - 1) {
              setIndexLearn(indexLearn + 1)
            }
          }}><FontAwesomeIcon icon={faArrowRight} /></button>
        </div>
      </div>
    </div>
    </>
  )
}