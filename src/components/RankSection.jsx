import { useState } from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';
import { faPlus,faLightbulb,faPen,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight,faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getUserData, addFolderDB } from './handleData.js'
import { getFolderDataDB } from './handleData.js'
import meaningSuggestion from './gemini.js'

export function RankSection() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <h2 className='text-secondary-text'>Sắp ra mắt!</h2>
    </div>
  );
}