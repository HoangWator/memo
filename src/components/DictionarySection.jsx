import React from 'react';
import { useState } from 'react';
import { dictEngine } from './gemini';

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
      <div className="meaning-section">
        {meanings.map((meaning, index) => {
          const definition = meaning.definition;
          const partOfSpeech = meaning.partOfSpeech;
          const examples = meaning.examples;
          const synonyms = meaning.synonyms;
          const antonyms = meaning.antonyms;
          return (
            <div className="meaning-item flex gap-2.5" key={index}>
              <div className="meaning-order">{index + 1}</div>
              <div className="meaning-content">
                <p><span>{partOfSpeech}</span> {definition}</p>
                <p>Example:</p>
                {examples.map((ex, exIndex) => (
                  <li key={exIndex} className="example">{ex}</li>
                ))}
                <p>Synonyms:</p>
                <div className="syn-list flex gap-1.5 flex-wrap">
                  {synonyms.map((syn, synIndex) => <span key={synIndex}>{syn}</span>)}
                </div>
                <p>Antonyms:</p>
                <div className="ant-list flex gap-1.5 flex-wrap">
                  {antonyms.map((ant, antIndex) => <span key={antIndex}>{ant}</span>)}
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
      <div className="idioms-section">
        <h1>Idioms</h1>
        {idioms.length > 0 ? (
          <div className="idioms-list">
            {idioms.map((idiom, index) => (
              <div key={index} className="idiom-item flex gap-2.5">
                <div className="idiom-order">
                  {index + 1}
                </div>
                <div className="idiom-content">
                  <h2>{idiom.idiom}</h2>
                  <p>{idiom.definition}</p>
                  <p>Example:</p>
                  <li>{idiom.example}</li>
                </div>
              </div>
            ))}
          </div>
        ) : <p>No idioms found.</p>}
      </div>
    )
  }
  function WordFamilySection({nouns, verbs, adjectives, adverbs}) {
    return (
      <div className="word-family-section">
        <h1>Word family</h1>
        {nouns.length > 0 && (
          <div className="word-family-content">
            <h2>Nouns</h2>
            <ul>
              {nouns.map((noun, index) => (
                <li key={index} className='list-disc'>{noun}</li>
              ))}
            </ul>
          </div>
        )}
        {verbs.length > 0 && (
          <div className="word-family-content">
            <h2>Verbs</h2>
            <ul>
              {wordFamilyVerbs.map((verb, index) => (
                <li key={index} className='list-disc'>{verb}</li>
              ))}
            </ul>
          </div>
        )}
        {adjectives.length > 0 && (
          <div className="word-family-content">
            <h2>Adjectives</h2>
            <ul>
              {adjectives.map((adj, index) => (
                <li key={index} className='list-disc'>{adj}</li>
              ))}
            </ul>
          </div>
        )}
        {adverbs.length > 0 && (
          <div className="word-family-content">
            <h2>Adverb</h2>
            <ul>
              {adverbs.map((adv, index) => (
                <li key={index} className='list-disc'>{adv}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
      
  }
  return (
    <div className="dict-item text-gray-500 w-5/6">
      <h2 className='text-4xl '>{word}</h2>
      <p>{phonetics.text}</p>
      <div className="dict-nav flex gap-2.5 mt-5">
        {nouns.length > 0 && <button onClick={() => setPageName("noun")}>Noun</button>}
        {verbs.length > 0 && <button onClick={() => setPageName("verb")}>Verb</button>}
        {adjectives.length > 0 && <button onClick={() => setPageName("adj")}>Adjective</button>}
        {adverbs.length > 0 && <button onClick={() => setPageName("adv")}>Adverb</button>}
        {idioms.length > 0 && <button onClick={() => setPageName("idioms")}>Idioms</button>}
        {wordFamily != null && <button onClick={() => setPageName("wordFamily")}>Word Family</button>}
      </div>

      <div className="dict-pages pt-20 pb-20">
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

  const handleSearch = async (word) => {
    if (word.trim() !== "") {
      const datas = await dictEngine(word);
      const jsonData = datas.slice(datas.indexOf('{'), datas.lastIndexOf('}') + 1);
      setSearchResults(JSON.parse(jsonData));
      console.log(word)
      console.log(JSON.parse(jsonData));
    }
    else {
      alert("Please enter a word to search.");
    }
  }


  return (
    <div className="dict-section">
      
      <div className="dict-content">
        <div className="dict-searchbar">
          <h1>Dictionary</h1>
          <input 
            type="text" 
            placeholder="Search dictionary..." 
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button className="dict-search-button" onClick={() => handleSearch(searchTerm)}>Search</button>
        </div>
        {searchResults && <DictItem data={searchResults} />}
      </div>
    </div>
  )
}