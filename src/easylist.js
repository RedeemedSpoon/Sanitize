// Huge big up to the people behind easylist.to & their contributors for making this possible
import {getSettings, getContent} from './utils.js';

const updateEasyList = async () => {
  const ads = 'https://easylist.to/easylist/easylist.txt';
  const trackers = 'https://easylist.to/easylist/easyprivacy.txt';
  const popups = 'https://secure.fanboy.co.nz/fanboy-annoyance.txt';
  const lists = {
    easylist: ads,
    easyprivacy: trackers,
    annoyance: popups,
  };

  for (const [key, url] of Object.entries(lists)) {
    const response = await fetch(url);

    if (response.ok) {
      const raw = await response.text();
      const data = await parseEasyList(raw);
      await browser.storage.local.set({[key]: data});
    }
  }
};

const parseEasyList = async (text) => {
  const lines = text.split('\n');
  let filter1, filter2, filter3;
  const cleanUrls = [];

  for (const line of lines.slice(1)) {
    if (line.includes('#')) {
      continue;
    }

    if (line.startsWith('!') || line.trim() === '') {
      continue;
    }

    if (line.includes('^')) {
      filter1 = line.replace(/\^/, '');
    } else {
      filter1 = line;
    }

    if (filter1.startsWith('||') || filter1.startsWith('@@')) {
      filter2 = filter1.replace(/^(\|\||@@\|\|)*/, '');
    } else {
      filter2 = filter1;
    }

    if (filter2.includes('$')) {
      filter3 = filter2.split('$')[0];
    } else {
      filter3 = filter2;
    }

    if (['*', '@', '|', '$', '^', '~', '(', '['].includes(filter3)) {
      continue;
    }

    cleanUrls.push(...filter3.split(','));
  }

  return cleanUrls;
};

const isInEasyList = async (url) => {
  const keys = ['easylist', 'easyprivacy', 'annoyance'];
  const ids = ['ad', 'tracker', 'popup'];
  const scopes = ['global', url];
  const searchList = [];

  for (let i = 0; i < keys.length; i++) {
    for (const scope of scopes) {
      const setting = await getSettings(scope, ids[i]);
      if (setting) {
        const content = await getContent(keys[i]);
        content && searchList.push(...content);
      }
    }
  }

  return searchList.includes(url);
};

export {updateEasyList, isInEasyList};
