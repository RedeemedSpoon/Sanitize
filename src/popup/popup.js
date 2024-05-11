import {getUrl, setSettings, getSettings, initOptSettings, toggleOptSettings, resetSettings} from '../utils.js';

const allSettings = document.querySelectorAll('input');

const themeBtn = document.getElementById('darkTheme');
const infoBtn = document.getElementById('showInfo');
const activateBtn = document.getElementById('activateExt');
const optSettings = [themeBtn, infoBtn, activateBtn];

const globalBtn = document.getElementById('global');
const localBtn = document.getElementById('local');

const syncBtn = document.getElementById('sync');
const resetBtn = document.getElementById('reset');

const newBtn = document.getElementById('new');
const viewBtn = document.getElementById('view');

const warning = document.getElementById('warning');
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
    warning.style.display = 'block';
  }),
);

optSettings.forEach((optSetting) => {
  optSetting.addEventListener('click', () => {
    toggleOptSettings(optSetting.id);
    window.location.reload();
  });
});

warning.addEventListener('click', () => {
  warning.style.display = 'none';
});

// Functions
const reloadSettings = async () => {
  const results = await initOptSettings();
  results['darkTheme'] && toggleTheme();

  const url = globalBtn.classList.contains('active') ? 'global' : await getUrl();
  allSettings.forEach(async (setting) => {
    setting.checked = await getSettings(url, setting.id);
  });
};

const toggleTheme = () => {
  document.body.classList.add('dark');
  document.querySelectorAll('button').forEach((btn) => btn.classList.add('dark'));
  document.querySelectorAll('fieldset').forEach((fieldset) => fieldset.classList.add('dark'));
  document.querySelectorAll('img').forEach((img) => (img.src = img.src.replace('light', 'dark')));
};
