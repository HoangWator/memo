import { useState } from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus,faBookOpen,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'

function AccountPage({userAvatar, userName}) {
  return (
    <div className='w-full p-2.5'>
      <div className='w-full flex flex-col items-center'>
        <img src={userAvatar} alt="" className='rounded-full'/>
        <h2 className='text-primary-text mt-2.5'>{userName}</h2>
        <button className='click-btn text-primary-text mt-2.5 bg-secondary-surface hover:text-wrong' onClick={() => {
          // setShowLogoutSection(true)
          // setShowLogoutBtn(false)
        }}>Log out<FontAwesomeIcon icon={faArrowRightFromBracket} className='ml-2.5' /></button>
      </div>
    </div>
  )
}
  
function ThemePage() {
  return (
    <div className='p-2.5'>
      <h1 className='text-primary-text'>Theme options:</h1>
      
    </div>
  )
}

function LanguagePage() {
  return (
    <div className='p-2.5'>
      <h1 className='font-semibold'>Dictionary Display</h1>
      {/* Select language display on dictionary */}


    </div>
  )
}
export function SettingPage({onClose, userAvatar, userName}) {
  const [selectedPage, setSelectedPage] = useState(0);

  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 bg-black/50 flex items-center justify-center">
      <div className="bg-bg w-1/2 relative rounded-lg h-[80vh] flex flex-col">
        <h1 className="text-2xl text-primary-text text-center mt-5 mb-5">Settings</h1>
        <button 
          onClick={() => {
            onClose()
            setSelectedPage(0)
          }}
          className="quit-btn absolute top-2.5 right-2.5"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
        <div className="flex flex-1 pl-2.5 pr-2.5 pb-2.5">
          <ul className="pr-2.5 border-r-1 border-r-muted">
            <li 
              className={"pt-2.5 pb-2.5 pr-5 pl-5 mb-1 rounded-lg  cursor-pointer text-center hover:bg-primary-surface  " + (selectedPage === 0 ? 'bg-primary-surface text-primary-text' : 'text-secondary-text')}
              onClick={() => setSelectedPage(0)}
            >Account</li>
            <li 
              className={"pt-2.5 pb-2.5 pr-5 pl-5 mb-1 rounded-lg cursor-pointer text-center hover:bg-primary-surface  " + (selectedPage === 1 ? 'bg-primary-surface text-primary-text' : 'text-secondary-text')}
              onClick={() => setSelectedPage(1)}
            >Theme</li>
            <li 
              className={"pt-2.5 pb-2.5 pr-5 pl-5 mb-1 rounded-lg cursor-pointer text-center hover:bg-primary-surface  " + (selectedPage === 2 ? 'bg-primary-surface text-primary-text' : 'text-secondary-text')}
              onClick={() => setSelectedPage(2)}
            >Language</li>
          </ul>

          {selectedPage === 0 && <AccountPage userAvatar={userAvatar} userName={userName}/>}
          {selectedPage === 1 && <ThemePage />}
          {selectedPage === 2 && <LanguagePage />}
        </div>
      </div>


    </div>
  )
}