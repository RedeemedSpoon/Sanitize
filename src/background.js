import {checkSetting} from './utils.js';

// Initialization
browser.runtime.onInstalled.addListener(() => {
  browser.tabs.create({url: 'https://RedeemedSpoon.github.io/Sanitize#usage'});
  browser.contextMenus.create({
    id: 'sanitize',
    title: 'Sanitize Them All !',
    contexts: ['all'],
  });
});

// Context Menu
browser.contextMenus.onClicked.addListener(() => {
  browser.tabs.create({url: 'https://RedeemedSpoon.github.io/Sanitize'});
});

// Browser Action

// Message Listener
browser.runtime.onMessage.addListener((request) => {
  if (request.type === 'imgBlock') {
    console.log(request);
    browser.tabs.query({active: true, currentWindow: true}).then(async (tabs) => {
      await browser.tabs.insertCSS({
        tabId: tabs[0].id,
        code: '* { background-image: none !important; }',
      });
    });
  } else if (request.type === 'audioBlock') {
    browser.tabs.query({active: true, currentWindow: true}).then(async (tabs) => {
      await browser.tabs.update(tabs[0].id, {muted: true});
    });
  }
});

// Web Requests
browser.webRequest.onBeforeRequest.addListener(
  async (details) => {
    const forbiddenElements = await getElementsToBlock();
    if (forbiddenElements.includes(details.type)) {
      return {cancel: true};
    }
  },
  {urls: ['<all_urls>']},
  ['blocking'],
);

const getElementsToBlock = async () => {
  const settingsName = ['css', 'js', 'image', 'video', 'audio', 'font', 'embed'];
  const result = [];

  for (let settingName of settingsName) {
    if (await checkSetting(settingName)) {
      switch (settingName) {
        case 'css':
          result.push('stylesheet');
          break;
        case 'js':
          result.push('script');
          break;
        case 'image':
          result.push('image');
          result.push('imageSet');
          break;
        case 'video':
          result.push('media');
          break;
        case 'audio':
          break;
        case 'font':
          result.push('font');
          break;
        case 'embed':
          result.push('object');
          result.push('object_subrequest');
          break;
      }
    }
  }

  return result;
};
