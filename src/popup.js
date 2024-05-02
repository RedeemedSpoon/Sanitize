import {getSettings, setSettings, getUrl, initOptSettings, toggleOptSettings, resetSettings} from './utils.js';

const allSettings = document.querySelectorAll('input');
const optSettings = document.querySelectorAll('.optSetting');
const resetBtn = document.getElementById('reset');
const globalBtn = document.getElementById('global');
const localBtn = document.getElementById('local');
const warning = document.getElementById('warning');
const logo = document.getElementById('logo');

// On Load
document.addEventListener('DOMContentLoaded', () => reloadSettings());
logo.addEventListener('click', () => new Audio('./yay.mp3').play());

// Top Right Buttons
resetBtn.addEventListener('click', async () => {
  await resetSettings();
  window.location.reload();
});

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

// On Change / Click
allSettings.forEach((setting) =>
  setting.addEventListener('click', async () => {
    const url = globalBtn.classList.contains('active') ? 'global' : await getUrl();
    await setSettings(url, setting.id, setting.checked);
    warning.style.display = 'block';
    console.log(await browser.storage.local.get());
  }),
);

optSettings.forEach((optSetting) => {
  optSetting.addEventListener('click', () => toggleOptSettings(optSetting.id));
});

warning.addEventListener('click', () => {
  warning.style.display = 'none';
});

// Functions
const reloadSettings = async () => {
  await initOptSettings([...optSettings]);
  const url = globalBtn.classList.contains('active') ? 'global' : await getUrl();
  allSettings.forEach(async (setting) => {
    setting.checked = await getSettings(url, setting.id);
  });
};
