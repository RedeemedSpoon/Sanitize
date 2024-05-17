import {createFilter, initOptSettings} from '../utils.js';

const main = document.querySelector('main');
const textarea = document.getElementById('content');
const urlInput = document.getElementById('url');

const pickBtn = document.getElementById('pick');
const createBtn = document.getElementById('create');
const previewBtn = document.getElementById('preview');

const minimizeBtn = document.querySelector('#controls p:first-child');
const closeBtn = document.querySelector('#controls p:last-child');

const selectorBtns = document.querySelectorAll('#selector button');
const scopeBtns = document.querySelectorAll('#scope button');

// Load
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await initOptSettings();
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
  browser.runtime.sendMessage({type: 'closeFrame'});
});

// Actions Buttons
pickBtn.addEventListener('click', () => {
  if (!pickBtn.classList.contains('disabled')) {
    main.classList.toggle('minimized');
    document.body.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    browser.runtime.sendMessage({type: 'pickElement'});
  }
});

previewBtn.addEventListener('click', () => {
  if (textarea.value) {
    browser.runtime.sendMessage({type: 'previewElement'});
  }
});

createBtn.addEventListener('click', async () => {
  if (textarea.value) {
    urlInput.value = '';
    if (scopeBtns[1].classList.contains('selected')) {
      await browser.runtime.sendMessage({type: 'getUrl'});
    }

    const url = urlInput.value || 'global';
    const filter = textarea.value.trim().split('\n---\n');

    const type = selectorBtns[0].classList.contains('selected')
      ? 'html'
      : selectorBtns[1].classList.contains('selected')
        ? 'css'
        : 'js';

    createFilter(url, type, filter);
    browser.runtime.sendMessage({type: 'reloadPage'});
  }
});
