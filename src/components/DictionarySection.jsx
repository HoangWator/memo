import React, { useState } from 'react';
import { dictEngine } from './gemini';
import Loader from './Loader';
import LoaderDict from './LoaderDict';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus,faBookOpen,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faCheck,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'
import { addWordDB } from '../components/handleData';
import { extractData } from './extractData';
import { addWordToDictDB,searchWordInDictDB,checkWordInDictDB } from '../components/handleData';

function createReviewDates(startDate) {
  // Date distance between review times
  let nums = [0, 1, 2]
  let i = 1
  while (nums.length < 10) {
    nums.push(nums[i] + nums[i + 1])
    i++
  }
  function dateAdd(nums, i) {
    let add = 0
    for (let j = 0; j <= i; j++) {
      add += nums[j]
    }
    return add
  }
  // Add dates to review
  const dates = [];
  for (let i = 0; i < nums.length; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + dateAdd(nums, i));
    dates.push(d);
  }
  
  return dates;
}

function DictItem({data, handleSearch, folderList, userID}) {
  const word = data.word
  const phonetics = data.phonetics
  const meanings = data.meanings
  const CEFRlevel = data.CEFR_level
  let nouns = []
  let verbs = []
  let adjectives = []
  let adverbs = []
  let phverb = []
  let phrasalVerbs = data.phrasal_verbs || []
  const idioms = data.idioms || []
  const wordFamily = data.word_family
  const wordFamilyNouns = wordFamily.nouns || []
  const wordFamilyVerbs = wordFamily.verbs || []
  const wordFamilyAdjectives = wordFamily.adjectives || []
  const wordFamilyAdverbs = wordFamily.adverbs || []
  meanings.forEach(meaning => {
    if (meaning.partOfSpeech === "noun") {
      nouns.push(meaning)
    }
    else if (meaning.partOfSpeech === "verb") {
      verbs.push(meaning)
    }
    else if (meaning.partOfSpeech === "adjective") {
      adjectives.push(meaning)
    }
    else if (meaning.partOfSpeech === "adverb") {
      adverbs.push(meaning)
    }
    else if (meaning.partOfSpeech === "phrasal verb") {
      phverb.push(meaning)
    }
  });

  const [pageName, setPageName] = useState(nouns.length > 0 ? "noun" : verbs.length > 0 ? "verb" : adjectives.length > 0 ? "adj" : adverbs.length > 0 ? "adv" : phverb.length > 0 ? "phv" : idioms.length > 0 ? "idioms" : wordFamily != null ? "wordFamily" : "");

  function MeaningSection({meanings, word, folderList}) {
    const [showFolderList, setShowFolderList] = useState(false);
    const [meaningIndex, setMeaningIndex] = useState(0);
    const [addedNoti, setAddedNoti] = useState(false);


    const addWordToFolder = (folderName, word, definitionEng, definitionVie, partOfSpeech) => {
      const d = new Date()
      addWordDB(userID, folderName, {
        name: word.toLowerCase(), 
        definition_eng: definitionEng,
        definition_vie: definitionVie,
        type: partOfSpeech,
        dateAdded: d,
        scheduleReview: [
          {
            mode: 'matching',
            reviewCount: 0,
            lastReview: null,
            rateAccuracy: null,
            reviewDates: [new Date()]
          },
          {
            mode: 'filling',
            reviewCount: 0,
            lastReview: null,
            rateAccuracy: null,
            reviewDates: [new Date()]
          },
          {
            mode: 'listening',
            reviewCount: 0,
            lastReview: null,
            rateAccuracy: null,
            reviewDates: [new Date()]
          }
        ],
      }).then(() => {
        setAddedNoti(true);
        setTimeout(() => {
          setAddedNoti(false);
        }, 2600);

      });
      setShowFolderList(false);
    }
    return (
      <div>
        {
          addedNoti &&
          <div className="added-noti fixed bottom-5 right-5 bg-bg text-primary-text p-2.5 rounded-lg shadow-lg flex items-center gap-2.5 z-50">
            "{word}" đã thêm thành công! <span className='bg-success text-white text-base w-5 h-5 rounded-full flex justify-center items-center'><FontAwesomeIcon icon={faCheck} /></span>
          </div>
        }
        {meanings.map((meaning, index) => {
          const definitionEng = meaning.definition_eng;
          const definitionVie = meaning.definition_vie;
          const partOfSpeech = meaning.partOfSpeech === 'phrasal verb' ? 'phverb' : meaning.partOfSpeech;
          const examples = meaning.examples;
          const synonyms = meaning.synonyms || [];
          const antonyms = meaning.antonyms || [];

          
          return (
            <div className="meaning-container flex flex-col md:flex-row items-start md:items-baseline mt-5 gap-3" key={index}>
              <div className="meaning-number mr-2.5 text-xl text-primary font-extrabold flex-none">{index + 1}</div>
              <div className="meaning-content flex-1">
                <div className="meaning-def text-primary-text flex items-center gap-2.5 mb-2">
                  <span className={"bg-primary-surface " + partOfSpeech}>{partOfSpeech === 'phverb' ? 'phrasal verb' : partOfSpeech}</span> 
                  <div>
                    <p>{definitionEng}</p> 
                    <p className='italic'>{definitionVie}</p>
                  </div>
                  <button 
                    className='text-primary h-8 w-8 rounded-full flex justify-center items-center cursor-pointer hover:bg-primary-surface' 
                    onClick={() => {
                      setShowFolderList(true)
                      setMeaningIndex(index)
                    }}
                  >
                    <FontAwesomeIcon className='' icon={faPlus}/>
                  </button>
                </div>
                <p className="font-medium text-primary-text">Ví dụ:</p>
                {examples.map((ex, exIndex) => (
                  <li key={exIndex} className="example-list text-primary-text">{ex}</li>
                ))}
                <p className="font-medium mt-2.5 text-primary-text">Từ đồng nghĩa:</p>
                <div className="flex flex-wrap gap-2.5 mb-2.5">
                  {synonyms.map((syn, synIndex) => 
                    <span 
                      key={synIndex} 
                      className="p-1 bg-bg rounded-lg cursor-pointer hover:text-primary-text"
                      onClick={() => handleSearch(syn)}
                    >{syn}</span>
                  )}
                </div>
                <p className="font-medium text-primary-text">Từ trái nghĩa:</p>
                <div className="flex flex-wrap gap-2.5 mb-2.5">
                  {antonyms.map((ant, antIndex) => 
                    <span 
                      key={antIndex} 
                      className="p-1 bg-bg rounded-lg cursor-pointer hover:text-primary-text"
                      onClick={() => handleSearch(ant)}
                    >{ant}</span>
                  )}
                </div>
              </div>
              
              {meaningIndex === index && showFolderList && 
              <div className="w-full h-screen fixed top-0 left-0 bg-black/50 flex justify-center items-center z-50">
                <div className='bg-bg p-4 sm:p-6 rounded-lg w-full max-w-sm md:max-w-md max-h-[80vh] overflow-y-auto relative'>
                  <h2 className="mb-2.5 text-primary-text">Thêm vào thư mục</h2>
                  <button className="quit-btn absolute right-2.5 top-2.5" onClick={() => setShowFolderList(false)}>
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                  <div className="">
                    {folderList.length > 0 ? (
                      <ul className="flex flex-col gap-2.5">
                        {folderList.map((folder, index) => (
                          <li 
                            key={index} 
                            className="bg-primary-surface p-2.5 rounded-lg cursor-pointer hover:bg-secondary-surface"
                            onClick={() => {
                              addWordToFolder(folder.name, word, definitionEng, definitionVie, partOfSpeech)
                            }}
                          >
                            <FontAwesomeIcon icon={faFolder} className='mr-2.5' />{folder.name}
                          </li>
                        ))}
                      </ul>
                      ) : (
                      <p className="no-folders-message">Chưa có thư mục. Vui lòng tạo thư mục trước.</p>
                    )}
                  </div>

                </div>
              </div>}
            </div>
          )
        })}

        
      </div>
    )
  }
  function IdiomsSection({idioms, folderList}) {
    const [showFolderList, setShowFolderList] = useState(false);
    const [meaningIndex, setMeaningIndex] = useState(0);

    const addWordToFolder = (folderName, word, definition_eng, definition_vie, partOfSpeech) => {
      const d = new Date()
      addWordDB(userID, folderName, {
        name: word.toLowerCase(), 
        definition_eng: definition_eng,
        definition_vie: definition_vie,
        type: partOfSpeech,
        dateAdded: d,
        lastReview: null,
        reviewCount: 0,
        scheduleReview: createReviewDates(d)
      });
      setShowFolderList(false);
    }
    return (
      <div className="space-y-6">
        <h1 className="text-2xl text-primary-text font-bold mb-2.5">Thành ngữ</h1>
        {idioms.length > 0 ? (
          <div className="space-y-6">
            {idioms.map((idiom, index) => (
              <div key={index} className="flex gap-2.5">
                <div className="text-lg font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg mb-2 text-primary-text">{idiom.idiom}</h2>
                  <p className="text-primary-text">{idiom.definition_eng}</p>
                  <p className="mb-2 text-primary-text italic">{idiom.definition_vie}</p>
                  <p className="font-medium text-primary-text">Ví dụ:</p>
                  <li className="ml-4 italic text-primary-text">{idiom.example}</li>
                </div>
                <button 
                  className='h-8 w-8 rounded-full text-primary cursor-pointer hover:bg-primary-surface'
                  onClick={() => {
                    setShowFolderList(true)
                    setMeaningIndex(index)
                  }}
                ><FontAwesomeIcon icon={faPlus}/></button>
                {meaningIndex === index && showFolderList && 
                  <div className="w-full h-screen fixed top-0 left-0 bg-black/50 flex justify-center items-center z-50">
                    <div className='bg-bg p-4 sm:p-6 rounded-lg w-full max-w-sm md:max-w-md max-h-[80vh] overflow-y-auto relative'>
                      <h2 className="mb-2.5 text-primary-text">Thêm vào thư mục</h2>
                      <button className="quit-btn absolute right-2.5 top-2.5" onClick={() => setShowFolderList(false)}>
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                      <div className="">
                        {folderList.length > 0 ? (
                          <ul className="flex flex-col gap-2.5">
                            {folderList.map((folder, index) => (
                              <li 
                                key={index} 
                                className="bg-primary-surface p-2.5 rounded-lg cursor-pointer hover:bg-secondary-surface hover:text-primary-text"
                                onClick={() => {
                                  addWordToFolder(folder, idiom.idiom, idiom.definition_eng, idiom.definition_vie, 'idiom')
                                }}
                              >
                                <FontAwesomeIcon icon={faFolder} className='mr-2.5' />{folder.name}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="no-folders-message">Chưa có thư mục. Vui lòng tạo thư mục trước.</p>
                        )}
                      </div>

                    </div>
                  </div>
                }
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500">Không tìm thấy thành ngữ.</p>}

        
      </div>
    )
  }
  function PhrasalVerbsSection({phrasalVerbs, folderList}) {
    const [showFolderList, setShowFolderList] = useState(false);
    const [meaningIndex, setMeaningIndex] = useState(0);

    const addWordToFolder = (folderName, word, definition_eng, definition_vie, partOfSpeech) => {
      const d = new Date()
      addWordDB(userID, folderName, {
        name: word.toLowerCase(), 
        definition_eng: definition_eng,
        definition_vie: definition_vie,
        type: partOfSpeech,
        dateAdded: d,
        lastReview: null,
        reviewCount: 0,
        scheduleReview: createReviewDates(d)
      });
      setShowFolderList(false);
    }
    return (
      <div className="space-y-6">
        <h1 className="text-2xl text-primary-text font-bold mb-2.5">Cụm động từ</h1>
        {phrasalVerbs.length > 0 ? (
          <div>
            {phrasalVerbs.map((phv, index) => (
              <p 
                key={index}
                className='text-secondary-text underline cursor-pointer hover:text-primary-text'
                onClick={() => handleSearch(phv)}
              >{phv}</p>
            ))}
          </div>
        ) : <p className="text-gray-500">Không tìm thấy cụm động từ.</p>}

        
      </div>
    )
  }
  function WordFamilySection({nouns, verbs, adjectives, adverbs}) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-4 text-primary-text">Word family</h1>
        <div className='flex justify-evenly'>
          {nouns.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-primary-text">Nouns</h2>
              <ul className="list-disc space-y-1 flex flex-col">
                {nouns.map((noun, index) => (
                  <a key={index} className='list-none cursor-pointer underline text-secondary-text hover:text-primary' onClick={() => handleSearch(noun)}>{noun}</a>
                ))}
              </ul>
            </div>
          )}
          {verbs.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-primary-text">Verbs</h2>
              <ul className="list-disc space-y-1">
                {wordFamilyVerbs.map((verb, index) => (
                  <a 
                    key={index} 
                    className='list-none block cursor-pointer underline hover:text-primary' 
                    onClick={() => handleSearch(verb)}
                    >{verb}</a>
                  ))}
              </ul>
            </div>
          )}
          {adjectives.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-primary-text">Adjectives</h2>
              <ul className="list-disc space-y-1">
                {adjectives.map((adj, index) => (
                  <a 
                    key={index} 
                    className='list-none block cursor-pointer underline hover:text-primary'
                    onClick={() => handleSearch(adj)}
                  >{adj}</a>
                ))}
              </ul>
            </div>
          )}
          {adverbs.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-primary-text">Adverb</h2>
              <ul className="list-disc space-y-1">
                {adverbs.map((adv, index) => (
                  <a 
                    key={index} 
                    className='list-none block cursor-pointer underline hover:text-primary'
                    onClick={() => handleSearch(adv)}
                  >{adv}</a>
                ))}
              </ul>
            </div>
          )}
          {
            nouns.length === 0 &&
            verbs.length === 0 &&
            adjectives.length === 0 &&
            adverbs.length === 0 && (
            <p className="text-gray-500">Không tìm thấy họ từ.</p>
          )}
        </div>
      </div>
    )
      
  }

  return (
    <div id="dict-item" className="text-gray-500 w-full p-4">
      <div className="dict-card bg-bg p-6 rounded-lg shadow-md w-full max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <h2 className='text-3xl text-primary-text font-semibold'>{word}</h2>
            <p className="text-primary italic mt-1">{phonetics.text}</p>
            <div className="mt-3">
              <span className='text-primary bg-bg inline-block p-1 rounded-lg font-bold'>{CEFRlevel}</span>
            </div>
          </div>
          <div className="md:col-span-3">
            <div className="flex gap-2.5 mb-5 border-b-muted border-b-1 overflow-x-auto whitespace-nowrap pb-2">
              {nouns.length > 0 && 
                <button 
                  className={"p-2.5 cursor-pointer flex-none " + (pageName === "noun" ? " border-b-2 border-b-primary text-primary" : "text-secondary-text hover:text-primary-text")}
                  onClick={() => setPageName("noun")}
                >Noun
                </button>
              }
              {verbs.length > 0 && 
                <button 
                  className={"p-2.5 cursor-pointer flex-none " + (pageName === "verb" ? " border-b-2 border-b-primary text-primary" : "text-secondary-text hover:text-primary-text")}
                  onClick={() => setPageName("verb")}
                >Verb</button>}
              {adjectives.length > 0 && 
                <button 
                  className={"p-2.5 cursor-pointer flex-none " + (pageName === "adj" ? " border-b-2 border-b-primary text-primary" : "text-secondary-text hover:text-primary-text")}
                  onClick={() => setPageName("adj")}
                >Adjective</button>}
              {adverbs.length > 0 && 
                <button 
                  className={"p-2.5 cursor-pointer flex-none " + (pageName === "adv" ? " border-b-2 border-b-primary text-primary" : "text-secondary-text hover:text-primary-text")}
                  onClick={() => setPageName("adv")}
                >Adverb</button>}
              {phverb.length > 0 && 
                <button 
                  className={"p-2.5 cursor-pointer flex-none " + (pageName === "phv" ? " border-b-2 border-b-primary text-primary" : "text-secondary-text hover:text-primary-text")}
                  onClick={() => setPageName("phv")}
                >Phrasal Verb</button>}
              {idioms.length > 0 && 
                <button 
                  className={"p-2.5 cursor-pointer flex-none " + (pageName === "idioms" ? " border-b-2 border-b-primary text-primary" : "text-secondary-text hover:text-primary-text")}
                  onClick={() => setPageName("idioms")}
                >Idioms</button>}
              {phrasalVerbs.length > 0 && 
                <button 
                  className={"p-2.5 cursor-pointer flex-none " + (pageName === "phrasalVerbs" ? " border-b-2 border-b-primary text-primary" : "text-secondary-text hover:text-primary-text")}
                  onClick={() => setPageName("phrasalVerbs")}
                >Phrasal Verbs</button>}
              {wordFamily != null && 
                <button 
                  className={"p-2.5 cursor-pointer flex-none " + (pageName === "wordFamily" ? " border-b-2 border-b-primary text-primary" : "text-secondary-text hover:text-primary-text")}
                  onClick={() => setPageName("wordFamily")}
                >Word Family</button>}
            </div>

            <div className="page-content">
              {pageName === "noun" && nouns.length > 0 && <MeaningSection meanings={nouns} word={word} folderList={folderList} />}
              {pageName === "verb" && verbs.length > 0 && <MeaningSection meanings={verbs} word={word} folderList={folderList}/>}
              {pageName === "adj" && adjectives.length > 0 && <MeaningSection meanings={adjectives} word={word} folderList={folderList}/>}
              {pageName === "adv" && adverbs.length > 0 && <MeaningSection meanings={adverbs} word={word} folderList={folderList}/>}
              {pageName === "phv" && phverb.length > 0 && <MeaningSection meanings={phverb} word={word} folderList={folderList}/>}
              {pageName === "idioms" && <IdiomsSection idioms={idioms} word={word} folderList={folderList} />}
              {/* {pageName === "phrasalVerbs" && <PhrasalVerbsSection phrasalVerbs={phrasalVerbs} folderList={folderList} />} */}
              {pageName === "wordFamily" && <WordFamilySection 
                nouns={wordFamilyNouns} 
                verbs={wordFamilyVerbs} 
                adjectives={wordFamilyAdjectives} 
                adverbs={wordFamilyAdverbs} 
              />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export function DictionarySection({folderList, userID}) {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [showLoader, setShowLoader] = useState(false);

  const handleSearch = async (word) => {
    if (word.trim() !== "") {
      setShowLoader(true);

      const isInDict = await checkWordInDictDB(word);

      if (isInDict) {
        const wordInDict = await searchWordInDictDB(word);
        setSearchResults(wordInDict);
        setShowLoader(false);
        setSearchTerm('');
      }
      else {
        extractData(word).then((data) => {
          setShowLoader(false);
          if (data.meanings.length > 0) {
            setSearchResults(data);
            addWordToDictDB(data);
          }
          else {
            alert("Không tìm thấy từ trong từ điển.");
          }
          setSearchTerm('')
        }).catch((error) => {
          setShowLoader(false);
          alert("Đã xảy ra lỗi khi lấy định nghĩa. Vui lòng thử lại.");
          console.error("Error fetching definition:", error);
        })
        // dictEngine(word).then((datas) => {
        //   const processedData = datas.slice(datas.indexOf('{'), datas.lastIndexOf('}') + 1);
        //   setShowLoader(false);
        //   if (processedData.length > 0) {
        //     const jsonData = JSON.parse(processedData)
        //     console.log(jsonData)
        //     setSearchResults(jsonData);
        //     addWordToDictDB(jsonData);
        //   }
        //   else {
        //     alert("Không tìm thấy từ trong từ điển.");
        //   }
        //   setSearchTerm('')
        // }).catch((error) => {
        //   setShowLoader(false);
        //   alert("Đã xảy ra lỗi khi lấy định nghĩa. Vui lòng thử lại.");
        //   console.error("Error fetching definition:", error);
        // })
      }
    }
    else {
      alert("Vui lòng nhập từ để tìm kiếm.");
    }
  }


  return (
    <div className="w-full h-screen overflow-auto">
      <div className='text-muted w-full h-screen flex justify-center items-center'>
        <img 
          src="../assets/imgs/image-removebg-preview.png" 
          alt="" 
        />
        Sắp ra mắt!
      </div>
      {/* <div className={"w-full h-screen dict-container flex flex-col items-center pt-10 pb-10 " + (searchResults ? "justify-start" : "justify-center")}>
        <div className="search-section w-full flex flex-col items-center">
          <div className="w-full max-w-2xl bg-bg p-6 rounded-lg shadow-sm">
            <h1 className="text-primary text-3xl text-center mb-1 font-bold">Memo Dict</h1>
            <p className='text-secondary-text mb-4 text-center'>Tra cứu như Oxford</p>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Tìm trong từ điển..." 
                className="input-field w-full bg-bg text-primary-text transition-shadow focus:shadow-outline"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(searchTerm) }}
                aria-label="Tìm từ"
              />
              {searchTerm && (
                <button aria-label="clear-search" className="quit-btn" onClick={() => setSearchTerm('') }>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
              <button 
                className=" ml-2.5 pt-2.5 pb-2.5 text-bg text-base bg-primary rounded-full cursor-pointer hover:bg-primary pr-4 pl-4"
                onClick={() => handleSearch(searchTerm)}
                aria-label="search"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>
            {showLoader && <div className="mt-4"><LoaderDict /></div>}
          </div>
        </div>
        {searchResults && <DictItem data={searchResults} handleSearch={handleSearch} folderList={folderList} userID={userID}/>}
      </div> */}
    </div>
  )
}