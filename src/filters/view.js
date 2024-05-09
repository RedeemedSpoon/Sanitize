import {initOptSettings, exportSettings, importSettings} from '../utils.js';

const readBtns = document.querySelectorAll('.read-bar button');
const writeBtns = document.querySelectorAll('.write-bar button');

const readPanel = document.getElementsByClassName('read')[0];
const writePanel = document.getElementsByClassName('write')[0];
const filterList = document.querySelector('ul');
const saveBtn = document.getElementById('save');

const exportBtn = document.getElementById('export');
const importBtn = document.getElementById('import');
const file = document.getElementById('file');

let buffer = {};
let url = '';

// Init Settings
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await initOptSettings();
  settings['darkTheme'] && toggleTheme();
  loadFilters(settings['filters']);
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
    changeBuffer(readPanel, readBtns);
  });
});

writeBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    writeBtns.forEach((btn) => btn.classList.remove('active'));
    e.target.classList.add('active');
    changeBuffer(writePanel, writeBtns);
  });
});

// Save Button
saveBtn.addEventListener('click', () => {});

// Functions
const toggleTheme = () => {
  document.body.classList.add('dark');
  document.querySelector('#filters').classList.add('dark');
  document.querySelector('#line').classList.add('dark');
  document.querySelectorAll('button').forEach((btn) => btn.classList.add('dark'));
  document.querySelectorAll('textarea').forEach((area) => area.classList.add('dark'));
  document.querySelector('img').src = document.querySelector('img').src.replace('light', 'dark');
};

const loadFilters = (filters) => {
  for (let filter in filters) {
    const line = document.createElement('li');
    line.innerText = filter;
    filterList.append(line);

    line.addEventListener('click', () => {
      buffer[filter] = filters[filter];
      url = filter;

      line.classList.add('active');
      changeBuffer(readPanel, readBtns);
      changeBuffer(writePanel, writeBtns);
    });
  }
};

const changeBuffer = (panel, btns) => {
  btns.forEach((btn) => {
    if (btn.classList[1]) {
      if (buffer[url]) {
        panel.textContent = buffer[url][btn.classList[0]];
      }
    }
  });
};
