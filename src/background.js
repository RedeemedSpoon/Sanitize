import {checkSetting, getContent} from './utils.js';
// import {updateEasyList, isInEasyList} from './easylist.js';

// Initialization
browser.runtime.onInstalled.addListener(async () => {
  // await updateEasyList();
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

// Browser Shortcuts

// Alarms
browser.alarms.create('EasyList Update', {
  delayInMinutes: 30,
  periodInMinutes: 45,
});

browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'EasyList Update') {
    // updateEasyList();
  }
});

// Message Listener
browser.runtime.onMessage.addListener((request) => {
  switch (request.type) {
    case 'imageBlock':
      browser.tabs.query({active: true, currentWindow: true}).then(async (tabs) => {
        await browser.tabs.insertCSS({
          tabId: tabs[0].id,
          code: '* { background-image: none !important; }',
        });
      });
      break;

    case 'audioBlock':
      browser.tabs.query({active: true, currentWindow: true}).then(async (tabs) => {
        await browser.tabs.update(tabs[0].id, {muted: true});
      });
      break;

    case 'export':
      console.log('export');
      break;

    case 'import':
      console.log('import');
      break;
  }
});

// Web Requests
browser.webRequest.onBeforeRequest.addListener(
  async (details) => {
    if (!(await getContent('activateExt'))) {
      return;
    }

    const forbiddenElements = await getElementsToBlock();
    // const inEasyList = await isInEasyList(details.url);
    if (forbiddenElements.includes(details.type)) {
      return {cancel: true};
    }
  },
  {urls: ['<all_urls>']},
  ['blocking'],
);

// Functions
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
