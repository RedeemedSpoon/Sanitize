const allSettings = document.querySelectorAll('input');
const exportBtn = document.getElementById('export');
const importBtn = document.getElementById('import');
const globalBtn = document.getElementById('global');
const localBtn = document.getElementById('local');
const audio = document.querySelector('audio');
const logo = document.querySelector('img[alt="Zenify"]');

logo.addEventListener('click', () => audio.play());

globalBtn.addEventListener('click', (e) => {
  e.preventDefault();
  globalBtn.classList.add('active');
  localBtn.classList.remove('active');
});

localBtn.addEventListener('click', (e) => {
  e.preventDefault();
  globalBtn.classList.remove('active');
  localBtn.classList.add('active');
});

allSettings.forEach((setting) =>
  setting.addEventListener('click', () => {
    console.log({[setting.id]: setting.checked});
  }),
);
