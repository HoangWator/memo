import { useState } from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';
import { faPlus,faLightbulb,faPen,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight,faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ProgressBar from './ProgressBar'
import Loader from './Loader'
import Flashcard from './Flashcard.jsx'
import FillingSection from './FillingSection.jsx'
import ListeningSection from './ListeningSection.jsx'
import ReviewSection from './ReviewSection.jsx'
import MatchingSection from './MatchingSection.jsx'
import DeleteValid from './modals/DeleteValid.jsx'
import RenameFolder from './modals/RenameFolder.jsx'

import { addWordDB,deleteWordDB } from './handleData.js'
import { getFolderDataDB } from './handleData.js'
import meaningSuggestion from './gemini.js'

export default function WordSection({onClose, currentFolder, userID}) {
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [words, setWords] = useState([])
  const [allWords, setAllWords] = useState([])
  
  const meaningInputRef = useRef(null);
  const wordInputRef = useRef(null);
  
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [showWordSectionLeft, setShowWordSectionLeft] = useState(false)
  
  const [wordsToReview, setWordsToReview] = useState('')
  
  function getWordsToReview(words) {
    const currentDay = new Date()
    let wordsToReview = []
    let matchingReviewItems = []
    let fillingReviewItems = []
    let listeningReviewItems = []
    words.forEach(word => {
      let scheduleReview = word.scheduleReview
      let currentYear = currentDay.getFullYear()
      let currentMonth = currentDay.getMonth()
      let currentDate = currentDay.getDate()

      for (const item of scheduleReview) {
        let reviewDates = item.reviewDates

        if (item.lastReview === null) {
          let isReviewDay = reviewDates.some(date => {
            const reviewDate = new Date(date.seconds * 1000)
            return (
              reviewDate.getFullYear() === currentYear &&
              reviewDate.getMonth() === currentMonth && 
              reviewDate.getDate() === currentDate
            )
          })
          
          if (isReviewDay) {
            wordsToReview.push(word)
            if (item.mode === 'matching') {
              matchingReviewItems.push(word)
            }
            else if (item.mode === 'filling') {
              fillingReviewItems.push(word)
            }
            else if (item.mode === 'listening') {
              listeningReviewItems.push(word)
            }
            break
          }
        }
        else if (item.lastReview) {
          let lastReviewDate = new Date(item.lastReview.seconds * 1000)
          if (
            lastReviewDate.getFullYear() !== currentYear &&
            lastReviewDate.getMonth() !== currentMonth && 
            lastReviewDate.getDate() !== currentDate
          ) {
            let isReviewDay = reviewDates.some(date => {
              const reviewDate = new Date(date.seconds * 1000)
              return (
                reviewDate.getFullYear() === currentYear &&
                reviewDate.getMonth() === currentMonth && 
                reviewDate.getDate() === currentDate
              )
            })
            
            if (isReviewDay) {
              wordsToReview.push(word)
              if (item.mode === 'matching') {
                matchingReviewItems.push(word)
              }
              else if (item.mode === 'filling') {
                fillingReviewItems.push(word)
              }
              else if (item.mode === 'listening') {
                listeningReviewItems.push(word)
              }
              break
            }
          }
        }
        
        
      }
      
    })
    return {
      wordsToReview: wordsToReview,
      matchingReviewItems: matchingReviewItems,
      fillingReviewItems: fillingReviewItems,
      listeningReviewItems: listeningReviewItems
    };
  }
  
  
  useEffect(() => {
    setLoader(true)
    getFolderDataDB(userID, currentFolder).then((data) =>  {
        if (data) {
          console.log(getWordsToReview(data.words))
          setWordsToReview(getWordsToReview(data.words).wordsToReview)
          setWords(data.words);
          setAllWords(data.words);
          setLoader(false);
        }
    }).catch((error) => {
        console.error("Error fetching folder data:", error);
      });
  }, [])

  useEffect(() => {
    getFolderDataDB(userID, currentFolder).then((data) =>  {
        if (data) {
          setWordsToReview(getWordsToReview(data.words))
        }
    }).catch((error) => {
        console.error("Error fetching folder data:", error);
      });
  }, [words])

  
  
  // Suggest meaning feature
  const meaningRefs = useRef([]);
  const [meaningList, setMeaningList] = useState([])
  const [showMeaningList, setShowMeaningList] = useState(false)
  const [selectedMeaningIndex, setSelectedMeaningIndex] = useState(-1);
  const [showRemindSuggestion, setShowRemindSuggestion] = useState(false)
  const [meaningListLoader, setMeaningListLoader] = useState(false)
  const suggestMeaning = () => {
    if (word && word.trim() !== '' && word !== '/') {
      setMeaningList([])
      setMeaningListLoader(true);
      meaningSuggestion(word).then(data => {
        setMeaningList(data)
        setShowMeaningList(true);
        setMeaningListLoader(false)
      }).catch(error => {
        alert('Error fetching meaning suggestions. Please try again later.');
        setMeaningListLoader(false);
      })
    } 
  }
  useEffect(() => {
    if (
      showMeaningList &&
      selectedMeaningIndex !== -1 &&
      meaningRefs.current[selectedMeaningIndex]
    ) {
      meaningRefs.current[selectedMeaningIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedMeaningIndex, showMeaningList, meaningList]);

  //search word
  const searchWord = (e) => {
    const searchValue = e.target.value.toLowerCase()
    if (searchValue.length > 0) {
      const filteredWords = allWords.filter(word => {
        const name = word.name.toLowerCase()
        const mean = word.mean.toLowerCase()

        return name.includes(searchValue) || mean.includes(searchValue)
      });
      setWords(filteredWords);
    }
    else {
      setWords(allWords);
    }
  }

  // flashcard
  const [showLearn, setShowLearn] = useState(false)
  const [flashcardWords, setFlashcardWords] = useState([])
  const learnBtn = (words) => {
    setShowLearn(true)
    setFlashcardWords(words)
  }

  // Filling
  const [showFilling, setShowFilling] = useState(false)
  const [loader, setLoader] = useState(false)

  const generateFilling = () => {
    setShowFilling(true)
  }
  
  const quitFilling = () => {
    setShowFilling(false)
  }


  // Listening 
  const [listeningWords, setListeningWords] = useState('')
  const [showListening, setShowListening] = useState(false)

  function shuffleArray(array) {
    const arr = [...array]; // make a copy to avoid mutating original
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const generateListening = (words) => {
    if (words.length > 0) {
      setShowListening(true)
      setListeningWords(shuffleArray(words))
    }
    else {
      alert("Please enter at least 4 words!")
    }
  }

  //Matching 
  const [showMatching, setShowMatching] = useState(false)

  // Review Section
  function MeaningDisplay({word}) {
    let meaningCln;
    if (word.type === 'noun') {
      meaningCln = 'noun'
    }
    else if (word.type === 'verb') {
      meaningCln = 'verb'
    }
    else if (word.type === 'adjective') {
      meaningCln = 'adjective'
    }
    else if (word.type === 'adverb') {
      meaningCln = 'adverb'
    }
    else if (word.type === 'phverb') {
      meaningCln = 'phverb'
    }
    else if (word.type === 'idiom') {
      meaningCln = 'idiom'
    }
    return (
      <h3 className='text-primary-text font-bold text-xl'>{word.name.toLowerCase()}<span className={'ml-2.5 font-normal text-base ' + meaningCln}>{word.type === 'phverb' ? 'phrasal verb' : word.type}</span></h3>
    )
  }

  const [showWordList, setShowWordList] = useState(false)

  const [showDeleteValid, setShowDeleteValid] = useState(false)
  const [showRenameFolderSection, setShowRenameFolderSection] = useState(false)


  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-bg" onClick={() => {
      if (showRemindSuggestion) {
        setShowRemindSuggestion(false)
      }
    }}>
      {loader && <Loader />}

      {showDeleteValid && (
        <DeleteValid 
          onCloseDeleteValidSection={() => setShowDeleteValid(false)}
          onCloseWordSection={() => onClose()}
          currentFolder={currentFolder}
          userID={userID}
        />
      )}

      {showRenameFolderSection && (
        <RenameFolder 
          onCloseRenameFolderSection={() => setShowRenameFolderSection(false)}
          onCloseWordSection={() => onClose()}
          currentFolder={currentFolder}
          userID={userID}
        />
      )}
      <div className="p-2.5 flex items-center gap-2.5">
        <button onClick={onClose} className='quit-btn'><FontAwesomeIcon icon={faArrowLeft} /></button>
        <h2 className='text-xl text-secondary-text'>{currentFolder}</h2>
      </div>
      <div className="word-section-body flex">

        <div className="w-1/2 p-2.5">
          {wordsToReview.length > 0 && 
            <ReviewSection 
              data={wordsToReview} 
              userID={userID}
              currentFolder={currentFolder}  
            />
          }
          <h1 className='text-xl text-primary-text'>Chế độ học</h1>
          <div className="learning-modes flex gap-2.5 mt-2.5 flex-wrap">
              <button className='p-2.5 bg-primary-surface cursor-pointer rounded-lg flex items-center gap-2.5 text-secondary-text hover:bg-secondary-surface' onClick={() => learnBtn(words)}>
              <img src="https://cdn-icons-png.freepik.com/512/9100/9100957.png" alt="" className='h-10' />
              Thẻ nhớ
            </button>

            <button className='p-2.5 bg-primary-surface cursor-pointer rounded-lg flex items-center gap-2.5 text-secondary-text hover:bg-secondary-surface' onClick={() => generateFilling(words)}>
              <img src="https://cdn-icons-png.flaticon.com/512/6559/6559624.png" alt="" className='h-10' />
              Điền từ
            </button>

            <button className='p-2.5 bg-primary-surface cursor-pointer rounded-lg flex items-center gap-2.5 text-secondary-text hover:bg-secondary-surface' onClick={() => generateListening(words)}>
              <img src="https://cdn-icons-png.flaticon.com/512/8805/8805242.png" alt="" className='h-10' />
              Nghe
            </button>

            <button className='p-2.5 bg-primary-surface cursor-pointer rounded-lg flex items-center gap-2.5 text-secondary-text hover:bg-secondary-surface' onClick={() => setShowMatching(true)}>
              <img src="https://cdn-icons-png.flaticon.com/512/3952/3952841.png" alt="" className='h-10' />
              Ghép nối
            </button>
          </div>
          
          <h1 className='text-xl text-primary-text mt-5 mb-2.5'>Cài đặt</h1>
          
          
          <button className='p-2.5 rounded-lg bg-primary-surface cursor-pointer text-secondary-text block mb-2.5 hover:bg-secondary-surface' onClick={() => {
            setShowRenameFolderSection(true)
          }}><FontAwesomeIcon icon={faPen} className='mr-1'/> Đổi tên thư mục</button>
          
          <button className='p-2.5 rounded-lg bg-primary-surface cursor-pointer block text-wrong hover:bg-secondary-surface' onClick={() => {
            setShowDeleteValid(true)
          }}><FontAwesomeIcon icon={faTrash} className='mr-1'/> Xóa thư mục</button>
        </div>
        
        
        
        {showWordList && (
          <div className="word-list">
            <div className="word-list-header">
              <button onClick={() => setShowWordList(false)} className='quitSectionBtn'><FontAwesomeIcon icon={faArrowLeft}/></button>
              <h2>Từ của tôi</h2>
            </div>
            <div className="word-list-body">
              <button className='add-word-btn mobile' onClick={() => setShowWordSectionLeft(true)}><FontAwesomeIcon icon={faPlus}/> Thêm từ</button>
              <div className="word-list-content">
                <div className="searchBox-section">
                  <input 
                    type="text" 
                    className="searchBox bg-bg text-primary-text w-full pl-10 mb-2.5" 
                    placeholder='Tìm từ của bạn...'
                    onChange={searchWord}/>
                  <FontAwesomeIcon icon={faMagnifyingGlass} className='searchIcon'/>
                </div>
                <ul>
                  {
                    words.length > 0 ? (
                        words.map((word, index) => 
                          <li key={index}>
                            <MeaningDisplay word={word}/>
                            <p>{word.mean.toLowerCase()}</p>

                            <button 
                              className='deleteBtn'
                              onClick={() => {
                                const newWords = words.filter((words, i) => i !== index)
                                setAllWords(newWords)
                                setWords(newWords)
                                deleteWordDB(userID, currentFolder, word)
                              }}>
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                          </li>
                        )
                      ) : (
                      <p className='noWords mr-auto ml-auto text-secondary-text'>Không có từ nào!</p>
                    )
                  }
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="word-section-right w-1/2 p-2.5 flex flex-col">
          
          <div className="searchBox-section relative">
              <input 
              type="text" 
              className="input-field w-full pl-10 mb-2.5 bg-primary-surface text-primary-text" 
              placeholder='Tìm từ của bạn...'
              onChange={searchWord}/>
            <FontAwesomeIcon icon={faMagnifyingGlass} className='absolute left-4 top-3.5 text-secondary-text'/>
          </div>
          <div className="flex flex-1 overflow-auto max-h-[75vh]">
            <ul className='flex flex-col items-center w-full'>
              {
                words.length > 0 ? (
                    words.map((word, index) => 
                      <li key={index} className='p-2.5 rounded-lg flex items-center justify-between w-full'>
                        <div>
                          <MeaningDisplay word={word}/>
                          <p className='text-secondary-text text-base '>{word.definition_eng}</p>
                          <p className='text-secondary-text text-base '>{word.definition_vie}</p>
                        </div>

                        <button 
                          className='text-primary-surface cursor-pointer rounded-lg hover:text-wrong'
                          onClick={() => {
                            const newWords = words.filter((words, i) => i !== index)
                            setAllWords(newWords)
                            setWords(newWords)
                            deleteWordDB(userID, currentFolder, word)
                          }}>
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                      </li>
                    )
                ) : (
                  <p className='mt-10 text-secondary-text mr-auto ml-auto'>Không có từ nào!</p>
                )
              }
            </ul>
          </div>
        </div>
      </div>

      
      
      {showLearn && 
        <Flashcard data={flashcardWords} onClose={() => setShowLearn(false)}/>
      }

      {showFilling && 
        <FillingSection 
          onClose={quitFilling} 
          data={words}
        />
      }

      {showListening && (
        <ListeningSection listeningWords={listeningWords} onClose={() => setShowListening(false)}/>
      )}

      {showMatching && (
        <MatchingSection
          onClose={() => setShowMatching(false)}
          data={words}
          userID={userID}
          currentFolder={currentFolder}
        />
      )}

      
    </div>
  )
}