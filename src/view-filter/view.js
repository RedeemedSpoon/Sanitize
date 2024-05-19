import {initOptConf, exportConf, importConf, deleteFilter, createFilter, updateFilter, getFilters} from '../utils.js';

const readBtns = document.querySelectorAll('.read-bar button');
const writeBtns = document.querySelectorAll('.write-bar button');

const readPanel = document.getElementById('read');
const writePanel = document.getElementById('write');
const filterList = document.querySelector('ul');
const saveBtn = document.getElementById('save');

const exportBtn = document.getElementById('export');
const importBtn = document.getElementById('import');
const file = document.getElementById('file');
const logo = document.querySelector('img');

let url;

// On Load
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await initOptConf();
  loadFilters(settings['filters']);
  if (settings['darkTheme']) {
    document.body.classList.add('dark');
    logo.src = logo.src.replace('light', 'dark');
  }
});

// Export-Import Settings
exportBtn.addEventListener('click', async () => {
  const file = await exportConf();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = 'settings.json';
  a.click();
});

importBtn.addEventListener('click', async () => file.click());
file.addEventListener('change', () => {
  importConf(file.files[0]);
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
saveBtn.addEventListener('click', async () => {
  const writeType = getType(writeBtns);
  const readType = getType(readBtns);
  const buffer = getFilters(url)[writeType] || [];

  if (!url || (!writePanel.value && !buffer)) return;

  const newCode = writePanel.value.trim().split('\n---\n');

  !buffer
    ? newCode.forEach(async (code) => await createFilter(url, writeType, code))
    : await updateFilter(url, writeType, newCode);

  readType === writeType && changeBuffer(readPanel, readBtns);
  saveBtn.innerText = 'Saved Successfully!';
  setTimeout(() => (saveBtn.innerText = 'Save'), 2000);
});

// Functions
const loadFilters = (filters) => {
  for (let filter in filters) {
    const line = document.createElement('li');
    const hostname = document.createElement('p');
    const deleteCross = document.createElement('p');

    hostname.innerText = filter;
    deleteCross.innerText = '×';

    hostname.classList.add('hostname');
    deleteCross.classList.add('delete');

    line.append(hostname);
    line.append(deleteCross);
    filterList.append(line);

    deleteCross.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteFilter(filter);
      line.remove();
    });

    line.addEventListener('click', () => {
      for (let siblingline of filterList.children) {
        siblingline.classList.remove('active');
      }

      url = filter;
      line.classList.add('active');
      changeBuffer(readPanel, readBtns);
      changeBuffer(writePanel, writeBtns);
    });
  }
};

const getType = (btns) => {
  const result = [...btns].find((btn) => btn.classList.contains('active'));
  return result.classList[0];
};

const changeBuffer = async (panel, btns) => {
  const type = getType(btns);
  const buffer = await getFilters(url);
  panel.value = buffer && buffer[type] ? buffer[type].join('\n---\n') : '';
};
