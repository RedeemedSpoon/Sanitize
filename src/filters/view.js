import {initOptSettings, exportSettings, importSettings} from '../utils.js';

const readBtns = document.querySelectorAll('.read-bar button');
const writeBtns = document.querySelectorAll('.write-bar button');

const exportBtn = document.getElementById('export');
const importBtn = document.getElementById('import');
const saveBtn = document.getElementById('save');
const file = document.getElementById('file');

// Init Settings
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await initOptSettings();
  if (settings['darkTheme']) {
    document.body.classList.add('dark');
    document.querySelector('#filters').classList.add('dark');
    document.querySelector('#line').classList.add('dark');
    document.querySelectorAll('button').forEach((btn) => btn.classList.add('dark'));
    document.querySelectorAll('textarea').forEach((area) => area.classList.add('dark'));
    document.querySelector('img').src = document.querySelector('img').src.replace('light', 'dark');
  }
});

// Export-Import Settings
exportBtn.addEventListener('click', async () => {
  const file = await exportSettings();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = 'settings.json';
  a.click();
});

importBtn.addEventListener('click', async () => {
  file.click();
  file.onchange = async (e) => {
    const file = e.target.files[0];
    importSettings(file);
  };
});

// Read-Write Settings
readBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    readBtns.forEach((btn) => btn.classList.remove('active'));
    e.target.classList.add('active');
  });
});

writeBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    writeBtns.forEach((btn) => btn.classList.remove('active'));
    e.target.classList.add('active');
  });
});
