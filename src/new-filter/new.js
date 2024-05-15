import {initOptSettings} from '../utils.js';

const main = document.querySelector('main');
const textarea = document.getElementById('content');

const pickBtn = document.getElementById('pick');
const createBtn = document.getElementById('create');
const previewBtn = document.getElementById('preview');

const minimizeBtn = document.querySelector('#controls p:first-child');
const closeBtn = document.querySelector('#controls p:last-child');

const selectorBtns = document.querySelectorAll('#selector button');
const methodBtns = document.querySelectorAll('#method button');

// Load
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await initOptSettings();
  settings['darkTheme'] && main.classList.add('dark');
});

// Actions Buttons
pickBtn.addEventListener('click', () => {
  main.classList.add('minimized');
  document.body.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
  browser.runtime.sendMessage({type: 'pickElement'});
});

// Selector-Method Buttons
selectorBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    selectorBtns.forEach((btn) => {
      btn.classList.remove('selected');
    });

    btn.classList.add('selected');
    if (btn.classList.contains('html')) {
      methodBtns[0].innerHTML = 'Add Elements';
      methodBtns[1].innerHTML = 'Remove Elements';
    } else if (btn.classList.contains('css')) {
      methodBtns[0].innerHTML = 'Add Rules';
      methodBtns[1].innerHTML = 'Remove Rules';
    } else if (btn.classList.contains('js')) {
      methodBtns[0].innerHTML = 'Add Scripts';
      methodBtns[1].innerHTML = 'Remove Scripts';
    }
  });
});

methodBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    methodBtns.forEach((btn) => btn.classList.remove('selected'));
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
