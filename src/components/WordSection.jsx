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
import AddWordModal from './modals/AddWordModal.jsx'

import { addWordDB,deleteWordDB,updateWordDB } from './handleData.js'
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
  
  // Date sort 
  const sortWordsByDate = (wordsArray) => {
    // Sort by createdAt date, newest first. "dateAdded" is a property of each word object that stores the timestamp of when the word was added.
    return wordsArray.slice().sort((a, b) => {
      const dateA = a.dateAdded ? new Date(a.dateAdded.seconds * 1000) : new Date(0);
      const dateB = b.dateAdded ? new Date(b.dateAdded.seconds * 1000) : new Date(0);
      return dateB - dateA; // Newest first
    });
  };

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
          setWords(sortWordsByDate(data.words));
          setAllWords(sortWordsByDate(data.words));
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
        const defEng = word.definition_eng.toLowerCase()
        const defVie = word.definition_vie.toLowerCase()
        return name.includes(searchValue) || defEng.includes(searchValue) || defVie.includes(searchValue)
      });
      setWords(sortWordsByDate(filteredWords));
    }
    else {
      setWords(sortWordsByDate(allWords));
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
    setShowListening(true)
    setListeningWords(shuffleArray(words))
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
    else if (word.type === 'other') {
      meaningCln = 'other'
    }
    return (
      <h3 className='text-primary-text font-bold text-xl'>{word.name.toLowerCase()}<span className={'ml-2.5 font-normal text-base ' + meaningCln}>{word.type === 'phverb' ? 'phrasal verb' : word.type}</span></h3>
    )
  }

  const [showWordList, setShowWordList] = useState(false)

  const [showDeleteValid, setShowDeleteValid] = useState(false)
  const [showRenameFolderSection, setShowRenameFolderSection] = useState(false)
  const [showAddWordModal, setShowAddWordModal] = useState(false)
  const [editingWordIndex, setEditingWordIndex] = useState(null)
  const [editWordForm, setEditWordForm] = useState({ name: '', definition_eng: '', definition_vie: '', type: '' })

  const wordTypes = [
    { id: 'noun', label: 'Noun', color: 'from-blue-500 to-blue-600' },
    { id: 'verb', label: 'Verb', color: 'from-green-500 to-green-600' },
    { id: 'adjective', label: 'Adjective', color: 'from-orange-500 to-orange-600' },
    { id: 'adverb', label: 'Adverb', color: 'from-yellow-500 to-yellow-600' },
    { id: 'idiom', label: 'Idiom', color: 'from-purple-500 to-purple-600' },
    { id: 'phverb', label: 'Phrasal Verb', color: 'from-indigo-500 to-indigo-600' },
    { id: 'other', label: 'Other', color: 'from-amber-500 to-amber-600' }
  ];

  const [wordType, setWordType] = useState('noun')
  const [editingLoad, setEditingLoad] = useState(false)

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-bg flex flex-col z-100" onClick={() => {
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

      {showAddWordModal && (
        <AddWordModal 
          onClose={() => setShowAddWordModal(false)}
          userID={userID}
          currentFolder={currentFolder}
          onWordAdded={() => {
            // Refresh the word list
            getFolderDataDB(userID, currentFolder).then((data) => {
              if (data) {
                setWords(sortWordsByDate(data.words));
                setAllWords(sortWordsByDate(data.words));
                setWordsToReview(getWordsToReview(sortWordsByDate(data.words)).wordsToReview);
              }
            }).catch((error) => {
              console.error("Error fetching folder data:", error);
            });
          }}
        />
      )}

      <div className="p-3 sm:p-4 flex items-center gap-3 bg-primary-surface">
        <button onClick={onClose} className='quit-btn'><FontAwesomeIcon icon={faArrowLeft} /></button>
        <h2 className='text-lg sm:text-xl text-secondary-text font-semibold'>{currentFolder}</h2>
        <div className='ml-auto flex items-center gap-2'>
        </div>
      </div>

      <div className="word-section-body flex flex-1 flex-col md:flex-row overflow-hidden bg-bg">

        <div className="md:w-1/2 w-full p-4 overflow-auto border-r-0 md:border-r-1 border-r-muted">
          {/* {wordsToReview.length > 0 && 
            <ReviewSection 
              data={wordsToReview} 
              userID={userID}
              currentFolder={currentFolder}  
            />
          } */}
          <button 
            onClick={() => setShowWordList(true)} 
            className='sm:hidden w-full p-3 rounded-lg bg-primary-surface text-secondary-text mb-2 cursor-pointer transform transition duration-150 hover:scale-105'
          >
            View All Words {`(${words.length})`}
          </button>
          <button 
            onClick={() => setShowAddWordModal(true)}
            className='w-full sm:w-3/10 p-3 rounded-lg bg-primary text-bg mb-4 cursor-pointer transform transition duration-150 hover:scale-105 font-semibold'
          >
            <FontAwesomeIcon icon={faPlus} className='mr-2'/> Thêm từ
          </button>
          <h3 className='text-lg text-primary-text font-semibold mb-3'>Chế độ học</h3>
          <div className="learning-modes grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button className='p-3 bg-primary-surface cursor-pointer rounded-lg flex flex-col items-center gap-2 text-secondary-text transform transition duration-150 hover:scale-105' onClick={() => learnBtn(words)}>
              <img src="https://cdn-icons-png.freepik.com/512/9100/9100957.png" alt="" className='h-10' />
              <span className='text-sm font-medium'>Flashcard</span>
            </button>

            <button className='p-3 bg-primary-surface cursor-pointer rounded-lg flex flex-col items-center gap-2 text-secondary-text transform transition duration-150 hover:scale-105' onClick={() => generateFilling(words)}>
              <img src="https://cdn-icons-png.flaticon.com/512/6559/6559624.png" alt="" className='h-10' />
              <span className='text-sm font-medium'>Điền từ</span>
            </button>

            <button className='p-3 bg-primary-surface cursor-pointer rounded-lg flex flex-col items-center gap-2 text-secondary-text transform transition duration-150 hover:scale-105' onClick={() => generateListening(words)}>
              <img src="https://cdn-icons-png.flaticon.com/512/8805/8805242.png" alt="" className='h-10' />
              <span className='text-sm font-medium'>Nghe</span>
            </button>

            <button className='p-3 bg-primary-surface cursor-pointer rounded-lg flex flex-col items-center gap-2 text-secondary-text transform transition duration-150 hover:scale-105' onClick={() => setShowMatching(true)}>
              <img src="https://cdn-icons-png.flaticon.com/512/3952/3952841.png" alt="" className='h-10' />
              <span className='text-sm font-medium'>Matching</span>
            </button>
          </div>

          <div className='mt-6'>
            <h4 className='text-base text-primary-text font-semibold mb-2'>Quản lý thư mục</h4>
            <button 
              className='w-full block sm:w-1/2 p-3 rounded-lg bg-primary-surface text-secondary-text mb-2 cursor-pointer transform transition duration-150 hover:scale-105' 
              onClick={() => setShowRenameFolderSection(true)}
            >
              <FontAwesomeIcon icon={faPen} className='mr-2'/> Đổi tên thư mục
            </button>
            <button 
              className='w-full block sm:w-1/2 p-3 rounded-lg bg-primary-surface text-secondary-text mb-2 cursor-pointer transform transition duration-150 hover:scale-105 hover:text-wrong' 
              onClick={() => setShowDeleteValid(true)}
            >
              <FontAwesomeIcon icon={faTrash} className='mr-2'/> Xóa thư mục
            </button>
          </div>
        </div>

        
        <div className={"max-sm:fixed top-0 bottom-0 bg-bg w-full pr-4 pl-4 sm:w-1/2 sm:flex flex-col overflow-auto " + (showWordList ? "block" : "hidden")} >
          <button className=' p-2 text-secondary-text cursor-pointer -mx-3 sm:hidden' onClick={() => setShowWordList(false)}><FontAwesomeIcon icon={faX}/></button>
          <div className='sticky top-0 bg-bg z-10 p-2 -mx-4 mb-3'>
            <div className='relative'>
              <input 
                type="text" 
                className="input-field w-full pl-10 pr-3 py-2 rounded-md border border-transparent bg-primary-surface text-primary-text" 
                placeholder='Tìm từ của bạn...'
                onChange={searchWord}/>
              <FontAwesomeIcon icon={faMagnifyingGlass} className='absolute left-3 top-3 text-secondary-text'/>
            </div>
          </div>

          <ul className='flex-1 flex-col gap-2 overflow-y-scroll overflow-x-hidden pr-2 pl-2 pb-2'>
            {
              words.length > 0 ? (
                words.map((word, index) => (
                  <li 
                    key={index} 
                    className='cursor-pointer p-4 mb-2 rounded-lg bg-bg flex flex-col sm:flex-row items-start sm:items-center justify-between transform transition duration-150 hover:scale-101 shadow-md'
                    onClick={() => {
                      setEditingWordIndex(index)
                      setEditWordForm({ 
                        name: word.name, 
                        definition_eng: word.definition_eng, 
                        definition_vie: word.definition_vie,
                        type: word.type
                      })
                      setWordType(word.type)
                    }}
                  >
                    <div className='flex-1'>
                      <MeaningDisplay word={word}/>
                      <p className='text-secondary-text text-sm mt-1'>{word.definition_eng}</p>
                      <p className='text-secondary-text text-sm'>{word.definition_vie}</p>
                    </div>
                    
                  </li>
                ))
              ) : (
                <li className='mt-6 text-secondary-text text-center'>Không có từ nào!</li>
              )
            }
          </ul>
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

      {editingWordIndex !== null && (
        <div className="fixed top-0 bottom-0 right-0 left-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingWordIndex(null)}>
          <div className="w-full max-sm:h-screen max-w-md sm:max-h-9/10 overflow-scroll sm:mx-4 bg-bg dark:bg-primary-surface sm:rounded-xl shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h2 className='text-xl font-semibold text-primary-text'>Chỉnh sửa từ</h2>
                <p className='text-sm text-secondary-text mt-1'>Cập nhật thông tin từ vựng</p>
              </div>
              <button onClick={() => setEditingWordIndex(null)} className='text-secondary-text hover:text-primary-text cursor-pointer'><FontAwesomeIcon icon={faX} /></button>
            </div>

            <div className='space-y-4 mb-6'>
              <div>
                <label className='block text-sm text-secondary-text mb-2 font-medium'>Tên từ</label>
                <input
                  type='text'
                  value={editWordForm.name}
                  onChange={(e) => setEditWordForm({...editWordForm, name: e.target.value})}
                  className='w-full px-4 py-2 rounded-lg bg-primary-surface text-primary-text focus:outline-none focus:border-primary'
                  placeholder='Nhập tên từ...'
                />
              </div>

              {/* Word Type  */}
              <div className="mb-4">
                <label className="text-secondary-text text-sm font-medium block mb-3">
                  Loại từ
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {wordTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setEditWordForm({...editWordForm, type: type.id})
                        setWordType(type.id)
                      }}
                      className={`p-3 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer ${
                        wordType === type.id
                          ? `bg-gradient-to-br ${type.color} text-white shadow-lg scale-105`
                          : 'bg-primary-surface text-secondary-text hover:bg-opacity-80 border border-transparent hover:border-primary'
                      }`}
                    >
                      <span className="text-sm font-medium text-center">
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className='block text-sm text-secondary-text mb-2 font-medium'>Định nghĩa (Tiếng Anh)</label>
                <textarea
                  value={editWordForm.definition_eng}
                  onChange={(e) => setEditWordForm({...editWordForm, definition_eng: e.target.value})}
                  className='w-full px-4 py-2 rounded-lg bg-primary-surface text-primary-text focus:outline-none focus:border-primary resize-none'
                  placeholder='Nhập định nghĩa tiếng Anh...'
                  rows='3'
                />
              </div>

              <div>
                <label className='block text-sm text-secondary-text mb-2 font-medium'>Định nghĩa (Tiếng Việt)</label>
                <textarea
                  value={editWordForm.definition_vie}
                  onChange={(e) => setEditWordForm({...editWordForm, definition_vie: e.target.value})}
                  className='w-full px-4 py-2 rounded-lg bg-primary-surface text-primary-text focus:outline-none focus:border-primary resize-none'
                  placeholder='Nhập định nghĩa tiếng Việt...'
                  rows='3'
                />
              </div>
            </div>

            <div className='flex items-center justify-between gap-3'>
              <button 
                onClick={() => {
                  const newWords = words.filter((w, i) => i !== editingWordIndex)
                  setAllWords(sortWordsByDate(newWords));
                  setWords(sortWordsByDate(newWords))
                  deleteWordDB(userID, currentFolder, words[editingWordIndex])
                  setEditingWordIndex(null)
                }}
                className='px-4 py-2 rounded-lg bg-wrong hover:bg-wrong/90 text-white cursor-pointer transition-colors font-medium'
              >
                <FontAwesomeIcon icon={faTrash} className='mr-2'/>
                Xóa
              </button>
              <div className='flex gap-2 ml-auto'>
                <button 
                  onClick={() => setEditingWordIndex(null)} 
                  className='px-4 py-2 rounded-lg text-secondary-text hover:text-primary-text hover:bg-primary-surface cursor-pointer transition-colors'
                >
                  Hủy
                </button>
                <button 
                  onClick={() => {
                    // Update the word in the database
                    setEditingLoad(true)
                    const originalWord = words[editingWordIndex];
                    updateWordDB(userID, currentFolder, originalWord, editWordForm).then(() => {
                      // Update the word in the local state
                      const updatedWords = [...words];
                      updatedWords[editingWordIndex] = {
                        ...updatedWords[editingWordIndex],
                        name: editWordForm.name,
                        definition_eng: editWordForm.definition_eng,
                        definition_vie: editWordForm.definition_vie,
                        type: editWordForm.type
                      };
                      setWords(sortWordsByDate(updatedWords));
                      setAllWords(sortWordsByDate(updatedWords));
                      setEditingWordIndex(null);
                      setEditingLoad(false);
                    }).catch((error) => {
                      console.error("Error updating word: ", error);
                      alert("Failed to update word. Please try again.");
                    });
                  }}
                  className='px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-bg cursor-pointer transition-colors font-medium'
                >
                  {editingLoad ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
    </div>
  )
}