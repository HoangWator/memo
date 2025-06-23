import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey:  import.meta.env.VITE_API_KEY});



export async function geneAI(words) {
    let newWords = words.join(', ')
    const prompt = `
        Create 3 fill-in-the-blank questions to learn how to use word '${newWords}'. 
        No '*', '_', '[', and ']' contained (important). 
        Each questions have at least 7 words. 
        Each words, I want you to return like this:
        [ordinal number]. [word that need to learn]
        -[Question 1]
        -[Question 2]
        -[Question 3]
        For example, I want to learn 'exhaustive' and 'biology'. You should return like this:
        1. Economics
        -The study of [economics] involves analyzing how societies allocate scarce resources to satisfy the unlimited needs and wants of their citizens within various market structures.
        -Understanding [economics] is crucial for governments to make informed decisions about taxation, public spending, and the regulation of financial markets across international borders.
        -Many political debates center around different perspectives on [economics], with each side proposing policies intended to improve economic growth and social welfare.
        2. Biology
        -Modern [biology] integrates principles from chemistry and physics to understand the complex biochemical processes that drive life at the cellular level for all living organisms.
        -Conservation [biology] aims to protect endangered species and their habitats by applying ecological and genetic principles to manage and restore ecosystems to their natural state.
        -Evolutionary [biology] explains the diversity of life on Earth through the process of natural selection, which leads to adaptation and the formation of new species over extended periods of time.
        Avoid returning like this: 
        1. Economics
        -The study of _____ [economics] involves analyzing how societies allocate scarce resources to satisfy the unlimited needs and wants of their citizens within various market structures.
        -Understanding _____ [economics] is crucial for governments to make informed decisions about taxation, public spending, and the regulation of financial markets across international borders.
        -Many political debates center around different perspectives on _____ [economics], with each side proposing policies intended to improve economic growth and social welfare.
        2. Biology
        -Modern _____ [biology] integrates principles from chemistry and physics to understand the complex biochemical processes that drive life at the cellular level for all living organisms.
        -Conservation _____ [biology] aims to protect endangered species and their habitats by applying ecological and genetic principles to manage and restore ecosystems to their natural state.
        -Evolutionary _____ [biology] explains the diversity of life on Earth through the process of natural selection, which leads to adaptation and the formation of new species over extended periods of time.
    `;
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
    });
    return getContents(response.text, words);
}

function getContents(texts, words) {
    let contents = []

    function shuffleArray(array) {
        const arr = [...array]; // make a copy to avoid mutating original
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function getQuestions(data) { 
        let questions = []
        let newDatas = data.split('\n')
        
        newDatas.forEach(newData => {
            if (newData.indexOf('-') != -1) {
                questions.push(newData.replace('-', '').trim())
            }
        }); 

        return questions //Return an array of questions
    }

    // Return an array of options (containing the word to learn and 3 other options)
    function getOptions(key, words) {
        let otherOptions = words.filter(word => word.toLowerCase() !== key.toLowerCase());
        otherOptions = shuffleArray(otherOptions.slice(0, 3)); // Get only 3 other
        let options = [key, ...otherOptions];
        return shuffleArray(options);
    }


    for (let i = 1; i <= words.length; i++) {
        if (i == words.length) {
            let newText = texts.slice(texts.indexOf(i))
            let questionList = getQuestions(newText)
            questionList.forEach(element => {
                let options
                if (element.indexOf('[') != -1 && element.indexOf(']') != -1) {
                    let key = element.slice(element.indexOf('[') + 1, element.indexOf(']')).toLowerCase()
                    options = getOptions(key, words)
                }
                if (element.indexOf('_') != -1) {
                    let key = words[i - 1].toLowerCase()
                    options = getOptions(key, words)
                }
                if (element.indexOf('[') != -1 && element.indexOf(']') != -1 && element.indexOf('_') != -1) {
                    element.replace(/_/g, '')
                    let key = element.slice(element.indexOf('[') + 1, element.indexOf(']')).toLowerCase()
                    options = getOptions(key, words)
                }
                contents.push({
                    word: words[i - 1], 
                    question: element,
                    options: options
                })   
            })
        }
        else {
            let newText = texts.slice(texts.indexOf(i), texts.indexOf(i + 1))
            let questionList = getQuestions(newText)
            questionList.forEach(element => {
                let options
                if (element.indexOf('[') != -1 && element.indexOf(']') != -1) {
                    let key = element.slice(element.indexOf('[') + 1, element.indexOf(']')).toLowerCase()
                    options = getOptions(key, words)
                }
                if (element.indexOf('_') != -1) {
                    let key = words[i - 1].toLowerCase()
                    options = getOptions(key, words)
                }
                contents.push({
                    word: words[i - 1], 
                    question: element, 
                    options: options
            })})
        }
    }
    return shuffleArray(contents)
}

export async function getWordData(word) {
  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

  const data = await res.json();
  const wordData = data[0];
  const phonetics = wordData.phonetics;

  let phoneticTxt = "", phoneticAudio = "";

  for(const phonetic of phonetics){
      if(phonetic.text && !phoneticTxt)
            phoneticTxt = phonetic.text
      if(phonetic.audio && !phoneticAudio)
            phoneticAudio = phonetic.audio;
      if(phoneticTxt && phoneticAudio) break;
  }

  const meaning = wordData.meanings[0];

  return {
    word: word.toLowerCase(),
    phonetic: {
          text: phoneticTxt,
          audio: phoneticAudio
    },
    speechPart: meaning.partOfSpeech,
    definition: meaning.definitions,
    synonyms: meaning.synonyms,
    antonyms: meaning.antonyms,
    example: meaning.definitions[0].example || ""
  }
}