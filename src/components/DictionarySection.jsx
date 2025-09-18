import React, { useState } from 'react';
import { dictEngine } from './gemini';
import Loader from './Loader';
import LoaderDict from './LoaderDict';
import '../styles/DictionarySection.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus,faBookOpen,faBars,faArrowLeft,faArrowRight,faArrowDown,faArrowUp,faTrash,faXmark,faMagnifyingGlass,faVolumeHigh,faFolder,faDumbbell,faTrophy,faChartSimple,faEllipsis,faPenToSquare,faX,faArrowRightFromBracket,faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'


function DictItem({data}) {
  const word = data.word
  const phonetics = data.phonetics
  const meanings = data.meanings
  let nouns = []
  let verbs = []
  let adjectives = []
  let adverbs = []
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
  });

  const [pageName, setPageName] = useState(nouns.length > 0 ? "noun" : verbs.length > 0 ? "verb" : adjectives.length > 0 ? "adj" : adverbs.length > 0 ? "adv" : idioms.length > 0 ? "idioms" : wordFamily != null ? "wordFamily" : "");

  function MeaningSection({meanings}) {
    return (
      <div>
        {meanings.map((meaning, index) => {
          const definition = meaning.definition;
          const partOfSpeech = meaning.partOfSpeech;
          const examples = meaning.examples;
          const synonyms = meaning.synonyms || [];
          const antonyms = meaning.antonyms || [];

          let partOfSpeechClassName;
          if (partOfSpeech === 'noun') {
            partOfSpeechClassName = "noun";
          }
          else if (partOfSpeech === 'verb') {
            partOfSpeechClassName = "verb";
          }
          else if (partOfSpeech === 'adjective') {
            partOfSpeechClassName = "adjective";
          }
          else if (partOfSpeech === 'adverb') {
            partOfSpeechClassName = "adverb";
          }
          return (
            <div className="meaning-container" key={index}>
              <div className="meaning-number">{index + 1}</div>
              <div className="meaning-content">
                <p className="meaning-def"><span className={"part-of-speech " + partOfSpeech}>{partOfSpeech}</span> {definition}</p>
                <p className="font-medium">Example:</p>
                {examples.map((ex, exIndex) => (
                  <li key={exIndex} className="example-list">{ex}</li>
                ))}
                <p className="font-medium">Synonyms:</p>
                <div className="tag-container">
                  {synonyms.map((syn, synIndex) => 
                    <span key={synIndex} className="tag">{syn}</span>
                  )}
                </div>
                <p className="font-medium">Antonyms:</p>
                <div className="tag-container">
                  {antonyms.map((ant, antIndex) => 
                    <span key={antIndex} className="tag">{ant}</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
  function IdiomsSection({idioms}) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-4">Idioms</h1>
        {idioms.length > 0 ? (
          <div className="space-y-6">
            {idioms.map((idiom, index) => (
              <div key={index} className="flex gap-2.5 border-b pb-4">
                <div className="text-lg font-bold text-blue-500 w-8">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg mb-2">{idiom.idiom}</h2>
                  <p className="mb-2">{idiom.meaning}</p>
                  <p className="font-medium">Example:</p>
                  <li className="ml-4 text-gray-600 italic">{idiom.example}</li>
                </div>
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
        <h1 className="text-2xl font-bold mb-4">Word family</h1>
        {nouns.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Nouns</h2>
            <ul className="list-disc pl-5 space-y-1">
              {nouns.map((noun, index) => (
                <li key={index}>{noun}</li>
              ))}
            </ul>
          </div>
        )}
        {verbs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Verbs</h2>
            <ul className="list-disc pl-5 space-y-1">
              {wordFamilyVerbs.map((verb, index) => (
                <li key={index}>{verb}</li>
              ))}
            </ul>
          </div>
        )}
        {adjectives.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Adjectives</h2>
            <ul className="list-disc pl-5 space-y-1">
              {adjectives.map((adj, index) => (
                <li key={index}>{adj}</li>
              ))}
            </ul>
          </div>
        )}
        {adverbs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Adverb</h2>
            <ul className="list-disc pl-5 space-y-1">
              {adverbs.map((adv, index) => (
                <li key={index}>{adv}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
      
  }
  return (
    <div className="dict-item text-gray-500 w-5/6 p-4">
      <h2 className='word-title'>{word}</h2>
      <p className="text-gray-600 italic">{phonetics.text}</p>
      <div className="flex gap-2.5 mt-5 mb-5">
        {nouns.length > 0 && 
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setPageName("noun")}
          >Noun
          </button>
        }
        {verbs.length > 0 && 
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setPageName("verb")}
          >Verb</button>}
        {adjectives.length > 0 && 
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setPageName("adj")}
          >Adjective</button>}
        {adverbs.length > 0 && 
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setPageName("adv")}
          >Adverb</button>}
        {idioms.length > 0 && 
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setPageName("idioms")}
          >Idioms</button>}
        {wordFamily != null && 
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setPageName("wordFamily")}
          >Word Family</button>}
      </div>

      <div className="page-content">
        {pageName === "noun" && nouns.length > 0 && <MeaningSection meanings={nouns} />}
        {pageName === "verb" && verbs.length > 0 && <MeaningSection meanings={verbs} />}
        {pageName === "adj" && adjectives.length > 0 && <MeaningSection meanings={adjectives} />}
        {pageName === "adv" && adverbs.length > 0 && <MeaningSection meanings={adverbs} />}
        {pageName === "idioms" && <IdiomsSection idioms={idioms} />}
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


export function DictionarySection() {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [showLoader, setShowLoader] = useState(false);

  const handleSearch = async (word) => {
    if (word.trim() !== "") {
      setShowLoader(true);
      const datas = await dictEngine(word);
      const processedData = datas.slice(datas.indexOf('{'), datas.lastIndexOf('}') + 1);
      setShowLoader(false);
      if (processedData.length > 0) {
        const jsonData = JSON.parse(processedData)
        setSearchResults(jsonData);
      }
      else {
        alert("Word not found in the dictionary.");
      }
      console.log(datas);
      console.log(typeof datas);
      console.log(processedData);
      console.log(typeof processedData);
      
    }
    else {
      alert("Please enter a word to search.");
    }
  }


  return (
    <div className="container">
      {showLoader && <LoaderDict />}
      <div className="dict-container">
        <div className="search-section">
          <h1 className="search-title">Dictionary</h1>
          <div className="search-form">
            <input 
              type="text" 
              placeholder="Search dictionary..." 
              className="search-input"
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button 
              className="btn"
              onClick={() => handleSearch(searchTerm)}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>
        </div>
        {searchResults && <DictItem data={searchResults} />}
      </div>
    </div>
  )
}