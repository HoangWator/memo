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
      <div className="card">
        {showDef ? <p>{word.mean}</p> : <h1>{word.name}</h1>}
        <button onClick={handleDef}><FontAwesomeIcon icon={faArrowsLeftRight} /></button>
      </div>
    )
  }

  return (
    <div className="learn-section">
      <button onClick={onClose} className='quitLearnSectionBtn quitSectionBtn'><FontAwesomeIcon icon={faArrowLeft} /></button>

      <div className="card-list">
        <p className="card-number">
          {indexLearn + 1} / {data.length}
        </p>

        <Card word={data[indexLearn]} />

        <div className="nav-btns">
          {indexLearn > 0 ? (
            <button className="prev-btn" onClick={() => {
              if (indexLearn > 0) {
                setIndexLearn(indexLearn - 1)
              }
            }}><FontAwesomeIcon icon={faArrowLeft} /></button>
          ) : (
            <button className="disabled prev-btn"><FontAwesomeIcon icon={faArrowLeft} /></button>
          )
          }

          {indexLearn < data.length - 1 ? (
            <button className="next-btn" onClick={() => {
              if (indexLearn < data.length - 1) {
                setIndexLearn(indexLearn + 1)
              }
            }}><FontAwesomeIcon icon={faArrowRight} /></button>
          )
          : (
            <button className="disabled next-btn"><FontAwesomeIcon icon={faArrowRight} /></button>
          )
          }
        </div>
      </div>
    </div>
  )
}