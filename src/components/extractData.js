import * as cheerio from 'cheerio';

export const extractData = async (word) => {
  const url = `https://dictionary.cambridge.org/dictionary/english-vietnamese/${word}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  let result = {
    'word': word,
    'phonetics': null,
    'meanings': [],
    'word_family': [],
    'cefr': null,
  }

  result.phonetics = $('.pron.dpron .ipa.dipa').text().trim();

  for (const mean of $('.d.pr.di.english-vietnamese.kdic').toArray()) {
    const partOfSpeech = $(mean).find('.pos.dpos').text().trim();
    for (const sense_block of $(mean).find('div.sense-block').toArray()) {
      const def_eng = $(sense_block).find('.def.ddef_d.db').text().trim();
      const def_vie = $(sense_block).find('.trans.dtrans').text().trim();
      let examples = []
      $(sense_block).find('.eg.deg').each((i, el) => {
        examples.push($(el).text().trim());
      });
      result.meanings.push({
        'partOfSpeech': partOfSpeech,
        'definition_en': def_eng,
        'definition_vi': def_vie,
        'examples': examples,
      });
    }
  }

  return result
}

extractData('patient').then(data => console.log(data)).catch(err => console.error(err));
