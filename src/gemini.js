import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey:  import.meta.env.VITE_API_KEY});



export async function geneAI(words) {
    let newWords = words.join(', ')
    const prompt = `
        Create 3 fill-in-the-blank questions to learn how to use word '${newWords}'. 
        No '*', '_', '[', and ']' contained (important). 
        Each questions have at least 10 words. 
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
    for (let i = 1; i <= words.length; i++) {
        if (i == words.length) {
            let newText = texts.slice(texts.indexOf(i))
            let questionList = getQuestions(newText)
            questionList.forEach(element => contents.push({word: words[i - 1], question: element}))
        }
        else {
            let newText = texts.slice(texts.indexOf(i), texts.indexOf(i + 1))
            let questionList = getQuestions(newText)
            questionList.forEach(element => contents.push({word: words[i - 1], question: element}))
        }
    }
    return shuffleArray(contents)
}