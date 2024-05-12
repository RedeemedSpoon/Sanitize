import {checkSetting, setSettings, getSettings, toggleOptSettings, getContent} from './utils.js';
// import {updateEasyList, isInEasyList} from './easylist.js';

// Initialization
browser.runtime.onInstalled.addListener(async () => {
  browser.tabs.create({url: 'https://RedeemedSpoon.github.io/Sanitize#installation'});
  // await updateEasyList();
  browser.contextMenus.create({
    id: 'sanitize',
    title: 'Add new Filter',
    contexts: ['all'],
  });
});

// Context Menu
browser.contextMenus.onClicked.addListener(() => showFrame());

// Browser Shortcuts
browser.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case 'disable_sanitize':
      toggleOptSettings('activateExt');
      window.location.reload();
      break;

    case 'add_filter':
      showFrame();
      break;

    case 'view_filter':
      browser.tabs.create({url: await browser.runtime.getURL('src/view-filter/view.html')});
      break;

    case 'toggle_zen_mode':
      setSettings('global', 'zen', !(await getSettings('global', 'zen')));
      window.location.reload();
      break;

    case 'toggle_freeze_mode':
      setSettings('global', 'freeze', !(await getSettings('global', 'freeze')));
      window.location.reload();
      break;

    case 'toggle_grayscale_mode':
      setSettings('global', 'grayscale', !(await getSettings('global', 'grayscale')));
      window.location.reload();
      break;
  }
});

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
browser.runtime.onMessage.addListener(async (request) => {
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

    case 'freezeMode':
      browser.tabs.executeScript(null, {
        code:
          'const overlay = document.createElement("div");' +
          'overlay.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647";' +
          'document.querySelector("html").append(overlay)',
      });
      break;

    case 'syncTab':
      browser.tabs.create({url: await browser.runtime.getURL('src/view-filter/view.html')});
      break;

    case 'newFrame':
      showFrame();
      break;

    case 'closeFrame':
      closeFrame();
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

const showFrame = async () => {
  closeFrame();
  let source = await browser.runtime.getURL('src/new-filter/new.html');
  browser.tabs.executeScript(null, {
    code:
      `var iframe = document.createElement('iframe');` +
      `iframe.style = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647';` +
      `iframe.src = '${source}';` +
      `iframe.id = 'sanitize';` +
      `document.querySelector('html').append(iframe);`,
  });
};

const closeFrame = () => {
  browser.tabs.executeScript(null, {
    code: 'var iframe = document.getElementById("sanitize"); iframe && iframe.remove();',
  });
};
