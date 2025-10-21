import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey:  import.meta.env.VITE_API_KEY});

export async function geneAI(wordDetails, words) {
    // input: array of words
    // Eg: ['economics (noun: ...)', 'biology (noun: ...)']
    let newWords = wordDetails.join(', ')
    const instructions = `
    You are an expert in creating fill-in-the-blank questions for language learning.
    Create a fill-in-the-blank question for each word provided. It should be designed to help learners understand the usage and meaning of the word in round brackets.
    Each question should have one blank space represented square brackets ([]).
    Return in JSON format like this:
    {
        question: "The study of how societies use resources to produce goods and services is called [economics].",
        options: ["economics", "biology", "chemistry", "physics"],
        answer: "economics"
    }
    Make sure each question is clear and concise, focusing on the practical application of the word.
    Provide a variety of sentence structures to enhance learning.
    `
    const prompt = `
        Create fill-in-the-blank questions to learn how to use these words: ${newWords}
    `;
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
            systemInstruction: instructions,
        }
    });
    return processJSON(response.text);
    // return 
}

function processJSON(text) {
    let startIndex = text.indexOf('[');
    let endIndex = text.lastIndexOf(']') + 1;
    let jsonString = text.slice(startIndex, endIndex);
    return JSON.parse(jsonString);
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
        let otherOptions = shuffleArray(words.filter(word => word.toLowerCase() !== key.toLowerCase()));
        otherOptions = otherOptions.slice(0, 3); // Get only 3 other
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

export default async function meaningSuggestion(word) {
  function getJSONdata(text) {
      let newText = text.slice(text.indexOf('['), text.indexOf(']') + 1)
      return JSON.parse(newText)
  }
  const prompt = `
      Give me definition of ${word} in both Vietnamese and English containing type of the word. No need for example. No word 'json'
      Take an example of "objective", you should return in JSON like this:
      [{
          type: 'noun',
          vie: 'Mục đích.',
          eng: 'A thing aimed at or sought; a goal.'
      },
      {
          type: 'adjective',
          vie: 'khách quan'
          eng: '(of a person or their judgment) not influenced by personal feelings or opinions in considering and representing facts.'
      }]
      Take an example of "initiative", you should return in JSON like this:
      [{
          type: 'noun',
          vie: 'Sáng kiến, sáng tạo',
          eng: 'The ability to assess and initiate things independently.'
      }]
      Take an example of "intervention", you should return in JSON like this:
      [{
          type: 'noun',
          vie: 'Sự can thiệp, can dự',
          eng: 'The action or process of intervening, especially to improve a situation.'
      }]
  `;
  const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
  });
  return getJSONdata(response.text);
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

export async function dictEngine(word) {
  const instructions = `
      You are Oxford dictionary.
      if word is not available, return like this:
      "unavailable"
      If word is available, tell me all infomations of that word including partOfSpeech, phonetics, meanings, examples for each meanings, idioms (if possible), synonyms, antonyms and word family. Respond in json. Make sure the json is correct and can be parsed.
      With "work", you should return in JSON like this:
      {
        "word": "work",
        "phonetics": {
            "text": "/wɜːrk/",
            "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/work-uk.mp3"
        },
        "meanings": [
            {
            "partOfSpeech": "verb",
            "definition": "To perform labor or engage in physical or mental activity to achieve a purpose or result.",
            "examples": [
                "She works as a software engineer at a tech company.",
                "He worked tirelessly to finish the project before the deadline."
            ],
            "synonyms": [
                "labor",
                "toil",
                "slave",
                "drudge",
                "exert oneself",
                "endeavor"
            ],
            "antonyms": [
                "rest",
                "relax",
                "idle",
                "laze",
                "play"
            ]
            },
            {
            "partOfSpeech": "verb",
            "definition": "To function or operate effectively.",
            "examples": [
                "The new software doesn't work properly on my computer.",
                "This strategy won't work in our current situation."
            ],
            "synonyms": [
                "function",
                "operate",
                "run",
                "perform",
                "be effective"
            ],
            "antonyms": [
                "malfunction",
                "fail",
                "break down"
            ]
            },
            {
            "partOfSpeech": "verb",
            "definition": "To shape, form, or process a material.",
            "examples": [
                "The blacksmith worked the hot iron into a horseshoe.",
                "She worked the clay into a beautiful vase."
            ],
            "synonyms": [
                "shape",
                "form",
                "mold",
                "fashion",
                "craft",
                "manipulate"
            ],
            "antonyms": [
                "destroy",
                "ruin",
                "demolish"
            ]
            },
            {
            "partOfSpeech": "noun",
            "definition": "Activity involving mental or physical effort done to achieve a purpose or result.",
            "examples": [
                "Hard work is the key to success.",
                "I have a lot of work to finish before Friday."
            ],
            "synonyms": [
                "labor",
                "toil",
                "effort",
                "exertion",
                "industry"
            ],
            "antonyms": [
                "leisure",
                "rest",
                "play",
                "relaxation"
            ]
            },
            {
            "partOfSpeech": "noun",
            "definition": "A task or tasks to be undertaken; something a person or thing has to do.",
            "examples": [
                "She gave me some work to do while she was away.",
                "The repair work on the bridge will take three months."
            ],
            "synonyms": [
                "task",
                "job",
                "duty",
                "assignment",
                "chore"
            ],
            "antonyms": [
                "hobby",
                "pastime",
                "entertainment"
            ]
            },
            {
            "partOfSpeech": "noun",
            "definition": "A place of employment.",
            "examples": [
                "I'm going to work early tomorrow.",
                "He left work at 5 PM as usual."
            ],
            "synonyms": [
                "workplace",
                "office",
                "job",
                "place of employment"
            ],
            "antonyms": [
                "home",
                "residence"
            ]
            },
            {
            "partOfSpeech": "noun",
            "definition": "Something produced or accomplished through effort, skill, or agency.",
            "examples": [
                "This novel is considered her greatest work.",
                "The museum displays works by famous artists."
            ],
            "synonyms": [
                "creation",
                "product",
                "composition",
                "opus",
                "piece"
            ],
            "antonyms": [
                "destruction",
                "ruin"
            ]
            }
        ],
        "idioms": [
            {
            "idiom": "work like a charm",
            "meaning": "To function perfectly or have the desired effect immediately.",
            "example": "The new marketing strategy worked like a charm, and sales doubled within a month."
            },
            {
            "idiom": "all work and no play makes Jack a dull boy",
            "meaning": "Constant work without time for relaxation is not good for one's health or personality.",
            "example": "You've been studying for ten hours straight - remember, all work and no play makes Jack a dull boy."
            },
            {
            "idiom": "work your fingers to the bone",
            "meaning": "To work extremely hard for a long time.",
            "example": "She worked her fingers to the bone to put her children through college."
            },
            {
            "idiom": "work out for the best",
            "meaning": "To eventually have a good result or conclusion after a period of uncertainty.",
            "example": "I was worried about changing jobs, but it all worked out for the best in the end."
            },
            {
            "idiom": "have your work cut out for you",
            "meaning": "To have a very difficult task ahead.",
            "example": "With three projects due by Friday, she certainly has her work cut out for her."
            }
        ],
        "word_family": {
            "nouns": [
            "work",
            "worker",
            "workforce",
            "workaholic",
            "workload",
            "workplace",
            "workshop",
            "homework",
            "housework"
            ],
            "adjectives": [
            "working",
            "workable",
            "overworked",
            "hardworking"
            ],
            "verbs": [
            "work",
            "rework",
            "overwork"
            ],
            "adverbs": [
            "workably"
            ]
        }
        }
  `;
  const prompt = `Give me all informations of '${word}'`
  const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: instructions
      }
  });
  return response.text;
}


