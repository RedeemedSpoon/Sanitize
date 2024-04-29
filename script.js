const questions = document.querySelectorAll('.question');
const downloadBtn = document.querySelector('.download');
const upBtn = document.querySelector('#controls > p:nth-child(1)');
const downBtn = document.querySelector('#controls > p:nth-child(2)');
const main = document.querySelectorAll('#content > div');
const start = document.querySelector('#introduction');
const end = document.querySelector('footer');
const chapters = [start, ...main, end];
let index = 0;

const goToChapter = (direction) => {
  const way = direction === 'up' ? 1 : -1;
  const newIndex = Math.max(0, Math.min(chapters.length - 1, index + way));

  if (newIndex !== index) {
    index = newIndex;
    chapters[index].scrollIntoView({behavior: 'smooth', block: 'start'});
  }
};

upBtn.addEventListener('click', () => goToChapter('up'));
downBtn.addEventListener('click', () => goToChapter());
downloadBtn.addEventListener('click', () => {
  index = 3;
  chapters[3].scrollIntoView({behavior: 'smooth', block: 'start'});
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    goToChapter('down');
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    goToChapter('up');
  }
});

questions.forEach((question) => {
  question.addEventListener('click', () => {
    question.querySelector('.arrow').classList.toggle('active');
    question.querySelector('.answer').classList.toggle('visible');
  });
});
