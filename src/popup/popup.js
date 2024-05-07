import {getUrl, setSettings, getSettings, initOptSettings, toggleOptSettings, resetSettings} from '../utils.js';

const allSettings = document.querySelectorAll('input');

const themeBtn = document.getElementById('darkTheme');
const infoBtn = document.getElementById('showInfo');
const activateBtn = document.getElementById('activateExt');
const resetBtn = document.getElementById('reset');
const optSettings = [themeBtn, infoBtn, activateBtn];

const globalBtn = document.getElementById('global');
const localBtn = document.getElementById('local');

const exportBtn = document.getElementById('export');
const importBtn = document.getElementById('import');

const warning = document.getElementById('warning');
const logo = document.getElementById('logo');

// On Load
document.addEventListener('DOMContentLoaded', () => reloadSettings());
logo.addEventListener('click', () => new Audio('./yay.mp3').play());

// Export & Import Buttons
exportBtn.addEventListener('click', (e) => {
  e.preventDefault();
  browser.runtime.sendMessage({type: 'export'});
});

importBtn.addEventListener('click', (e) => {
  e.preventDefault();
  browser.runtime.sendMessage({type: 'import'});
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

resetBtn.addEventListener('click', async () => {
  await resetSettings();
  window.location.reload();
});

// Functions
const reloadSettings = async () => {
  const results = await initOptSettings([themeBtn.id, infoBtn.id, activateBtn.id]);
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
