const minimizeBtn = document.querySelector('#controls p:first-child');
const closeBtn = document.querySelector('#controls p:last-child');

const selectorBtns = document.querySelectorAll('#selector button');

selectorBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    selectorBtns.forEach((btn) => btn.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

minimizeBtn.addEventListener('click', () => {
  document.querySelector('main').classList.toggle('minimized');
});

closeBtn.addEventListener('click', () => {
  browser.runtime.sendMessage({type: 'closeFrame'});
});
