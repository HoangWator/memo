import { useState } from 'react'
import { useEffect } from 'react';
import { faPlus,faBars,faChevronDown,faCaretRight,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ProgressBar from './ProgressBar';
import Flashcard from './Flashcard';
import FillingSection from './FillingSection';
import MatchingSection from './MatchingSection';

export default function ReviewSection({data, onClose, userID, currentFolder}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Show only top 3 items if not expanded
  const displayedWords = isExpanded ? data : data.slice(0, 3);

  const [reviewSession, setReviewSession] = useState(null);
  const generateReviewSession = () => {
    setReviewSession(true)
    let matchingReviewItems = []
    let fillingReviewItems = []
    let listeningReviewItems = []

    data.forEach((item) => {
      let scheduleReview = item.scheduleReview 
      scheduleReview.forEach((schedule) => {
        if (schedule.mode === 'matching') {
          matchingReviewItems.push(item)
        } else if (schedule.mode === 'filling') {
          fillingReviewItems.push(item)
        } else if (schedule.mode === 'listening') {
          listeningReviewItems.push(item)
        }
      })
    })
  }

  return (
    <div className="w-full">
      
      {/* Compact Widget / Card Container */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 ring-1 ring-slate-900/5 transition-all duration-300">
        
        {/* Simplified Header */}
        <div className="bg-indigo-600 p-6 text-white relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Mục tiêu hôm nay</p>
              <h2 className="text-3xl font-bold">{data.length} Từ</h2>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold opacity-90">1 phút</div>
              <p className="text-indigo-200 text-xs">ước tính</p>
            </div>
          </div>
        </div>

        {/* Word List Section */}
        <div className="px-2 pt-3 pb-2 bg-bg">
          
          <div className="space-y-1">
            {displayedWords.map((word, index) => {
              return (
                <div key={index} className="group flex items-center p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                  {/* Difficulty Indicator */}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-bold text-slate-800 truncate">{word.name}</h3>
                      <span className={"text-xs  flex-shrink-0 " + word.type}>{word.type}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{word.definition_eng}</p>
                  </div>

                  {/* <ChevronRight size={16} className="text-slate-300 ml-2 flex-shrink-0 group-hover:text-indigo-400 transition-colors" /> */}
                </div>
              )
            })}
          </div>

          {/* Expand / Collapse Toggle */}
          {data.length > 3 && 
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full py-3 mt-1 text-xs text-slate-500 font-bold hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all flex items-center justify-center gap-1 uppercase tracking-wide cursor-pointer"
            >
              {isExpanded ? (
                <>Ẩn bớt</>
              ) : (
                <>
                  Xem thêm
                  <FontAwesomeIcon icon={faChevronDown} />
                </>
              )}
            </button>
          }
        </div>

        {/* Main Action Area */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold shadow-lg shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            onClick={generateReviewSession}
          >
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <FontAwesomeIcon icon={faCaretRight} />
            </div>
            Bắt đầu ôn tập
          </button>
        </div>

      </div>

      {reviewSession && 
      <div>
        <MatchingSection 
          reviewMode={true}
          data={data} 
          onClose={() => setReviewSession(null)} 
          userID={userID} 
          currentFolder={currentFolder}
        />
      </div>
      }
    </div>
  )
}