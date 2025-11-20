import React, { useState } from 'react';
import { dictEngine } from './gemini';
import Loader from './Loader';
import LoaderDict from './LoaderDict';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus,faBookOpen,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faCheck,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'
import { addWordDB } from '../components/handleData';
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
  let nouns = []
  let verbs = []
  let adjectives = []
  let adverbs = []
  let phverb = []
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
        lastReview: null,
        reviewCount: 0,
        scheduleReview: createReviewDates(d)
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
          <div className="added-noti fixed top-5 left-1/2 transform -translate-x-1/2 bg-bg text-primary-text p-2.5 rounded-lg">
            "{word}" added successfully! <span className='bg-success text-white text-base w-10 h-10 rounded-full'><FontAwesomeIcon icon={faCheck} /></span>
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
            <div className="meaning-container flex items-baseline mt-5" key={index}>
              <div className="meaning-number mr-2.5 text-primary-text">{index + 1}</div>
              <div className="meaning-content">
                <p className="meaning-def text-primary-text flex items-center gap-2.5 mb-2">
                  <span className={"bg-primary-surface " + partOfSpeech}>{partOfSpeech === 'phverb' ? 'phrasal verb' : partOfSpeech}</span> {definitionEng} ({definitionVie})
                  <button 
                    className='text-primary h-8 w-8 rounded-full flex justify-center items-center cursor-pointer hover:bg-primary-surface' 
                    onClick={() => {
                      setShowFolderList(true)
                      setMeaningIndex(index)
                    }}
                  >
                    <FontAwesomeIcon className='' icon={faPlus}/>
                  </button>
                </p>
                <p className="font-medium text-primary-text">Example:</p>
                {examples.map((ex, exIndex) => (
                  <li key={exIndex} className="example-list text-primary-text">{ex}</li>
                ))}
                <p className="font-medium mt-2.5 text-primary-text">Synonyms:</p>
                <div className="flex flex-wrap gap-2.5 mb-2.5">
                  {synonyms.map((syn, synIndex) => 
                    <span key={synIndex} className="p-1 bg-primary-surface rounded-lg">{syn}</span>
                  )}
                </div>
                <p className="font-medium text-primary-text">Antonyms:</p>
                <div className="flex flex-wrap gap-2.5 mb-2.5">
                  {antonyms.map((ant, antIndex) => 
                    <span key={antIndex} className="p-1 bg-primary-surface rounded-lg">{ant}</span>
                  )}
                </div>
              </div>
              
              {meaningIndex === index && showFolderList && 
              <div className="w-full h-screen fixed top-0 left-0 bg-black/50 flex justify-center items-center z-50">
                <div className='bg-bg p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto relative'>
                  <h2 className="mb-2.5 text-primary-text">Add to folder</h2>
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
                              addWordToFolder(folder, word, definitionEng, definitionVie, partOfSpeech)
                            }}
                          >
                            <FontAwesomeIcon icon={faFolder} className='mr-2.5' />{folder}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-folders-message">No folders available. Please create a folder first.</p>
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
  function IdiomsSection({idioms, word, folderList}) {
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
        <h1 className="text-2xl text-primary-text font-bold mb-2.5">Idioms</h1>
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
                  <p className="mb-2 text-primary-text">{idiom.definition_vie}</p>
                  <p className="font-medium text-primary-text">Example:</p>
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
                    <div className='bg-bg p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto relative'>
                      <h2 className="mb-2.5 text-primary-text">Add to folder</h2>
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
                                <FontAwesomeIcon icon={faFolder} className='mr-2.5' />{folder}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="no-folders-message">No folders available. Please create a folder first.</p>
                        )}
                      </div>

                    </div>
                  </div>
                }
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500">No idioms found.</p>}

        
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
            <p className="text-gray-500">No word family found.</p>
          )}
        </div>
      </div>
    )
      
  }

  return (
    <div id="dict-item" className="text-gray-500 w-5/6 p-4">
      <h2 className='text-3xl text-primary-text font-semibold'>{word}</h2>
      <p className="text-primary italic">{phonetics.text}</p>
      <div className="flex gap-2.5 mt-5 mb-5 border-b-muted border-b-1">
        {nouns.length > 0 && 
          <button 
            className={"p-2.5 cursor-pointer " + (pageName === "noun" ? " border-b-2 border-b-primary text-primary" : "text-secondary-text hover:text-primary-text")}
            onClick={() => setPageName("noun")}
          >Noun
          </button>
        }
        {verbs.length > 0 && 
          <button 
            className={"p-2.5 cursor-pointer " + (pageName === "verb" ? " border-b-2 border-b-primary text-primary" : "text-secondary-text hover:text-primary-text")}
            onClick={() => setPageName("verb")}
          >Verb</button>}
        {adjectives.length > 0 && 
          <button 
            className={"p-2.5 cursor-pointer " + (pageName === "adj" ? " border-b-2 border-b-primary text-primary" : "text-secondary-text hover:text-primary-text")}
            onClick={() => setPageName("adj")}
          >Adjective</button>}
        {adverbs.length > 0 && 
          <button 
            className={"p-2.5 cursor-pointer " + (pageName === "adv" ? " border-b-2 border-b-primary text-primary" : "text-secondary-text hover:text-primary-text")}
            onClick={() => setPageName("adv")}
          >Adverb</button>}
        {phverb.length > 0 && 
          <button 
            className={"p-2.5 cursor-pointer " + (pageName === "phv" ? " border-b-2 border-b-primary text-primary" : "text-secondary-text hover:text-primary-text")}
            onClick={() => setPageName("phv")}
          >Phrasal verb</button>}
        {idioms.length > 0 && 
          <button 
            className={"p-2.5 cursor-pointer " + (pageName === "idioms" ? " border-b-2 border-b-primary text-primary" : "text-secondary-text hover:text-primary-text")}
            onClick={() => setPageName("idioms")}
          >Idioms</button>}
        {wordFamily != null && 
          <button 
            className={"p-2.5 cursor-pointer " + (pageName === "wordFamily" ? " border-b-2 border-b-primary text-primary" : "text-secondary-text hover:text-primary-text")}
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
        {pageName === "wordFamily" && <WordFamilySection 
          nouns={wordFamilyNouns} 
          verbs={wordFamilyVerbs} 
          adjectives={wordFamilyAdjectives} 
          adverbs={wordFamilyAdverbs} 
        />}
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
        dictEngine(word).then((datas) => {
          const processedData = datas.slice(datas.indexOf('{'), datas.lastIndexOf('}') + 1);
          setShowLoader(false);
          if (processedData.length > 0) {
            const jsonData = JSON.parse(processedData)
            console.log(jsonData)
            setSearchResults(jsonData);
            addWordToDictDB(jsonData);
          }
          else {
            alert("Word not found in the dictionary.");
          }
          setSearchTerm('')
        }).catch((error) => {
          setShowLoader(false);
          alert("An error occurred while fetching the definition. Please try again.");
          console.error("Error fetching definition:", error);
        })
      }
    }
    else {
      alert("Please enter a word to search.");
    }
  }


  return (
    <div className="w-full h-screen overflow-auto">
      <div className={"w-full h-screen dict-container flex flex-col items-center pt-10 pb-10 " + (searchResults ? "justify-start" : "justify-center")}>
        <div className="search-section">
          <h1 className="text-primary text-4xl text-center mb-2.5 font-bold">Dictionary</h1>
          <p className='text-secondary-text mb-6'>Search for definitions, examples, and word families.</p>
          <div className="flex">
            <input 
              type="text" 
              placeholder="Search dictionary..." 
              className="input-field w-full bg-bg"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSearch(searchTerm)
                  
                }
              }}
            />
            <button 
              className=" ml-2.5 pt-2.5 pb-2.5 text-bg text-base bg-primary rounded-full cursor-pointer hover:bg-primary pr-4 pl-4"
              onClick={() => handleSearch(searchTerm)}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>

          {showLoader && <LoaderDict />}

        </div>
        {searchResults && <DictItem data={searchResults} handleSearch={handleSearch} folderList={folderList} userID={userID}/>}
      </div>
    </div>
  )
}