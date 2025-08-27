import { useState } from 'react'
import { useEffect } from 'react';
import { faPlus,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ProgressBar from './ProgressBar';
import Flashcard from './Flashcard';

export default function ReviewSection({data, onClose}) {
  console.log(data)
  return (
    <div className="review-section">
      <div className="review-header">
        <button className='quitSectionBtn' onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
        <h2>Review</h2>
      </div>
      <div className="review-content">
        <Flashcard data={data} onClose={onClose}/>
      </div>
    </div>
  )
}