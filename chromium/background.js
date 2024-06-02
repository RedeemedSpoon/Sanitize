import {checkSetting, toggleOptConf, initOptConf} from './utils.js';

// Initialization
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({url: 'https://RedeemedSpoon.github.io/Sanitize#installation'});
  chrome.contextMenus.create({
    id: 'sanitize',
    title: 'Add New Filter',
    contexts: ['all'],
  });
});

// Context Menu
chrome.contextMenus.onClicked.addListener(() => showFrame());

// Storage Listener
chrome.storage.onChanged.addListener(() => updateRules());

// Browser Shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case 'disable_sanitize':
      toggleOptConf('activateExt');
      break;

    case 'add_filter':
      showFrame();
      break;

    case 'view_filter':
      chrome.tabs.create({url: await chrome.runtime.getURL('view-filter/view.html')});
      break;
  }
});

// Message Listener
chrome.runtime.onMessage.addListener(async (request) => {
  let tab = (await chrome.tabs.query({active: true, currentWindow: true}))[0].id;
  switch (request.type) {
    case 'pickElement':
      chrome.tabs.sendMessage(tab, {type: request.type});
      break;

    case 'previewElement':
      chrome.tabs.sendMessage(tab, {type: request.type, content: request.content});
      break;

    case 'getUrl':
      chrome.tabs.sendMessage(tab, {type: request.type});
      break;

    case 'reloadPage':
      chrome.tabs.reload(tab);
      break;

    case 'freezeMode':
      chrome.scripting.executeScript({
        target: {tabId: tab, allFrames: true},
        func: () => {
          const overlay = document.createElement('div');
          overlay.style = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647';
          document.querySelector('html').append(overlay);
        },
      });
      break;

    case 'muteTab':
      chrome.tabs.update(tab, {muted: true});
      break;

    case 'syncTab':
      const file = await chrome.runtime.getURL('view-filter/view.html');
      chrome.tabs.create({url: file});
      break;

    case 'newFrame':
      showFrame();
      break;

    case 'closeFrame':
      closeFrame();
      break;
  }
});

// Functions
const updateRules = async () => {
  const oldRules = (await chrome.declarativeNetRequest.getDynamicRules()) || {};
  const oldRuleIds = oldRules.map((rule) => rule.id);

  if ((await initOptConf()).activateExt) {
    const blockedElements = await getElementsToBlock();
    const rules = [];

    blockedElements.forEach((type) => {
      rules.push({
        id: Math.floor(Math.random() * 1_000_000),
        priority: 1,
        action: {type: 'block'},
        condition: {
          urlFilter: '*',
          resourceTypes: [type],
        },
      });
    });

    chrome.declarativeNetRequest.updateDynamicRules({addRules: rules});
  }

  chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds: oldRuleIds});
};

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
          break;
      }
    }
  }

  return result;
};

const showFrame = async () => {
  let id = (await chrome.tabs.query({active: true, currentWindow: true}))[0].id;
  await closeFrame();

  chrome.scripting.executeScript({
    target: {tabId: id, allFrames: true},
    func: async () => {
      const iframe = document.createElement('iframe');
      iframe.id = 'sanitize';
      iframe.style =
        'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647; color-scheme: normal;';

      iframe.src = await chrome.runtime.getURL('new-filter/new.html');
      document.querySelector('html').append(iframe);
    },
  });
};

const closeFrame = async () => {
  let id = (await chrome.tabs.query({active: true, currentWindow: true}))[0].id;

  chrome.scripting.executeScript({
    target: {tabId: id, allFrames: true},
    func: () => {
      const sanitize = document.getElementById('sanitize');
      sanitize && sanitize.remove();

      const styleElements = document.querySelectorAll('.sn-style');
      styleElements.forEach((el) => el.remove());

      const selectedElements = document.querySelectorAll('.sn-selected');
      selectedElements.forEach((el) => el.remove());
    },
  });
};
