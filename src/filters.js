// When Making New Filters
browser.runtime.onMessage.addListener(async (request) => {
  if (request.type === 'pickElement') {
    if (document.querySelector('.sn-selected')) {
      document.querySelectorAll('.sn-selected').forEach((element) => element.remove());
    }

    const webpage = document.querySelector('html');
    const styleSheet = document.createElement('style');
    const drawing = document.createElement('div');
    let selectMode = true;

    drawing.classList.add('sn-hover');
    styleSheet.id = 'sn-style';
    styleSheet.textContent =
      'body * { user-select: none !important; cursor: crosshair !important; }' +
      '.sn-hover { position: absolute; background-color: rgba(200, 0, 0, 0.4); border: 3px solid rgba(100, 0, 0, 0.75); pointer-events: none; z-index: 2147483646; }' +
      '.sn-selected { background-color: rgba(140, 0, 0, 0.4) !important; border: 3px solid rgba(70, 0, 0, 0.75) !important; }' +
      '#sanitize { pointer-events: none; }';

    webpage.append(styleSheet);
    webpage.append(drawing);

    document.body.replaceWith(document.body.cloneNode(true));
    document.querySelectorAll('body *').forEach((element) => {
      for (const attribute of element.attributes) {
        if (attribute.name.startsWith('on')) {
          element.removeAttribute(attribute.name);
        }
      }

      if (element.nodeName === 'A') {
        element.setAttribute('href', 'javascript:void(0)');
      }

      element.addEventListener('mouseover', (e) => {
        if (!selectMode) {
          return;
        }

        e.stopPropagation();
        drawing.classList.remove('sn-selected');
        createBox(element, drawing, webpage);
      });

      element.addEventListener('click', (e) => {
        if (!selectMode) {
          return;
        }

        e.stopPropagation();
        drawing.classList.add('sn-selected');
        selectMode = false;

        styleSheet.textContent +=
          '#sanitize { pointer-events: auto; } body * { user-select: auto !important; cursor : auto !important; }';

        const selector = getSelector(element);
        document.querySelectorAll('.sn-selected').forEach((element) => element.remove());
        document.querySelectorAll(selector).forEach((element) => createBox(element, drawing, webpage, 'HighlightAll'));

        const iframe = document.querySelector('#sanitize');
        const innerDoc = iframe.contentDocument || iframe.contentWindow.document;

        const main = innerDoc.querySelector('main');
        const textArea = innerDoc.querySelector('textarea');

        main.classList.remove('minimized');
        textArea.value = selector;
      });
    });
  } else if (request.type === 'previewElement') {
  }
});

const createBox = (element, drawing, webpage, type) => {
  const res = element.getBoundingClientRect();

  drawing.style.top = `${res.top + window.scrollY}px`;
  drawing.style.left = `${res.left + window.scrollX}px`;
  drawing.style.width = `${res.width}px`;
  drawing.style.height = `${res.height}px`;

  if (type === 'HighlightAll') {
    const clone = drawing.cloneNode();
    webpage.append(clone);
    return;
  }

  webpage.append(drawing);
};

const getSelector = (element) => {
  let selector = element.nodeName.toLowerCase();

  if (document.querySelectorAll(selector).length === 1) {
    return selector;
  }

  if (element.id) {
    return `#${element.id}`;
  }

  if (element.classList.length > 0) {
    element.classList.forEach((name) => (selector += `.${name}`));
    if (document.querySelectorAll(selector).length === 1) {
      return selector;
    }
  }

  if (element.parentElement) {
    return getSelector(element.parentElement) + ` > ${selector}`;
  }

  return selector;
};
