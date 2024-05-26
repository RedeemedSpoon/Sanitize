import {getUrl, setSettings, getSettings, initOptConf, toggleOptConf, resetSettings} from '../utils.js';

const optSettings = document.querySelectorAll('header div img');
const showInfo = document.getElementById('showInfo');
const activateExt = document.getElementById('activateExt');

const allSettings = document.querySelectorAll('input');

const globalBtn = document.getElementById('global');
const localBtn = document.getElementById('local');

const syncBtn = document.getElementById('sync');
const resetBtn = document.getElementById('reset');

const newBtn = document.getElementById('new');
const viewBtn = document.getElementById('view');
const logo = document.getElementById('logo');

// On Load
document.addEventListener('DOMContentLoaded', () => reloadSettings());
logo.addEventListener('click', () => new Audio('./yay.mp3').play());

// Scope Buttons
globalBtn.addEventListener('click', (e) => {
  e.preventDefault();
  globalBtn.classList.add('active');
  localBtn.classList.remove('active');
  reloadSettings();
});

localBtn.addEventListener('click', (e) => {
  e.preventDefault();
  globalBtn.classList.remove('active');
  localBtn.classList.add('active');
  reloadSettings();
});

// On Button Click
newBtn.addEventListener('click', () => {
  browser.runtime.sendMessage({type: 'newFrame'});
  window.close();
});

resetBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  await resetSettings();
  window.location.reload();
});

[syncBtn, viewBtn].forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    browser.runtime.sendMessage({type: 'syncTab'});
    window.close();
  });
});

// On Input Change
allSettings.forEach((setting) =>
  setting.addEventListener('click', async () => {
    const url = globalBtn.classList.contains('active') ? 'global' : await getUrl();
    await setSettings(url, setting.id, setting.checked);
  }),
);

optSettings.forEach((optSetting) => {
  optSetting.addEventListener('click', () => {
    toggleOptConf(optSetting.id);
    if (optSetting.id === 'darkTheme') {
      document.body.classList.toggle('dark');
      logo.src = document.body.classList.contains('dark')
        ? '../icons/sanitize_dark.png'
        : '../icons/sanitize_light.png';
    } else {
      optSetting.classList.toggle('off');
    }
  });
});

// Functions
const reloadSettings = async () => {
  const results = await initOptConf();
  !results['showInfo'] && showInfo.classList.add('off');
  !results['activateExt'] && activateExt.classList.add('off');
  if (results['darkTheme']) {
    document.body.classList.add('dark');
    logo.src = '../icons/sanitize_dark.png';
  }

  const url = globalBtn.classList.contains('active') ? 'global' : await getUrl();
  allSettings.forEach(async (setting) => {
    setting.checked = await getSettings(url, setting.id);
  });
};
