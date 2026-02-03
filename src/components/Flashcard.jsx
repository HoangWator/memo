import { useState } from 'react'
import { useEffect } from 'react';
import { faPlus,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export default function Flashcard({data, onClose}) {
  const [indexLearn, setIndexLearn] = useState(0)
  

  function Card({word}) {
    const [showDef, setShowDef] = useState(false)

    const handleDef = () => {
      setShowDef(!showDef)
    }
    return (
      <div className="relative w-90 h-90 p-5 bg-primary-surface rounded-lg text-primary-text flex items-center justify-center select-none cursor-pointer mt-2.5 mb-2.5" onClick={handleDef}>
        {showDef ? <p className='text-center'>{word.definition_eng + ' (' + word.definition_vie + ')'}</p> : <h1 className='text-3xl'>{`${word.name} (${word.type})`}</h1>}
        <span className='absolute bottom-5 right-5'><FontAwesomeIcon icon={faArrowsLeftRight} /></span>
      </div>
    )
  }

  return (
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
  )
}