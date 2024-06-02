import {createFilter, initOptConf} from '../utils.js';

const main = document.querySelector('main');
const textarea = document.getElementById('content');

const pickBtn = document.getElementById('pick');
const createBtn = document.getElementById('create');
const previewBtn = document.getElementById('preview');

const minimizeBtn = document.querySelector('#controls p:first-child');
const closeBtn = document.querySelector('#controls p:last-child');

const selectorBtns = document.querySelectorAll('#selector button');
const scopeBtns = document.querySelectorAll('#scope button');

// On Load
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await initOptConf();
  settings['darkTheme'] && main.classList.add('dark');
});

// Selector Buttons
selectorBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    selectorBtns.forEach((btn) => btn.classList.remove('selected'));
    btn.classList.add('selected');

    if (btn.classList.contains('html')) {
      pickBtn.classList.remove('disabled');
    } else {
      pickBtn.classList.add('disabled');
    }
  });
});

// Scope Buttons
scopeBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    scopeBtns.forEach((btn) => btn.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// Controls Buttons
minimizeBtn.addEventListener('click', () => {
  main.classList.toggle('minimized');
});

closeBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({type: 'closeFrame'});
});

// Actions Buttons
pickBtn.addEventListener('click', () => {
  if (!pickBtn.classList.contains('disabled')) {
    main.classList.toggle('minimized');
    document.body.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    chrome.runtime.sendMessage({type: 'pickElement'});
  }
});

previewBtn.addEventListener('click', () => {
  if (textarea.value) {
    chrome.runtime.sendMessage({
      type: 'previewElement',
      content: [textarea.value.trim(), getType()],
    });
  }
});

createBtn.addEventListener('click', async () => {
  if (textarea.value) {
    await chrome.runtime.sendMessage({type: 'getUrl'});
  }
});

// Listeners
window.addEventListener('message', (event) => {
  const message = event.data;
  if (message.type === 'selectedElement') {
    main.classList.remove('minimized');
    textarea.value = message.content;
  } else if (message.type === 'createFilter') {
    const url = scopeBtns[1].classList.contains('selected') ? message.content : 'global';
    const filters = textarea.value.trim().split('\n---\n');
    const type = getType();

    filters.forEach((filter) => createFilter(url, type, filter));
    chrome.runtime.sendMessage({type: 'reloadPage'});
  }
});

//Functions
const getType = () => {
  return selectorBtns[0].classList.contains('selected')
    ? 'html'
    : selectorBtns[1].classList.contains('selected')
      ? 'css'
      : 'js';
};
