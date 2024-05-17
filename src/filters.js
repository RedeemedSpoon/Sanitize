// When Making New Filters
browser.runtime.onMessage.addListener(async (request) => {
  if (request.type === 'pickElement') {
    clearSelection();
    let selectMode = true;
    const {main, textArea, webpage, drawing, styleSheet} = init('select');

    document.body.replaceWith(document.body.cloneNode(true));
    document.querySelectorAll('body *').forEach((element) => {
      element.nodeName === 'A' && element.removeAttribute('href');

      for (const attribute of element.attributes) {
        if (attribute.name.startsWith('on')) {
          element.removeAttribute(attribute.name);
        }
      }

      element.addEventListener('mouseover', (e) => {
        if (selectMode) {
          e.stopPropagation();
          drawing.classList.remove('sn-selected');
          createBox(element, drawing, webpage);
        }
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

        clearSelection();
        const selector = getSelector(element);
        document.querySelectorAll(selector).forEach((element) => {
          createBox(element, drawing, webpage, 'HighlightAll');
        });

        main.classList.remove('minimized');
        textArea.value = selector;
      });
    });
  } else if (request.type === 'previewElement') {
    const {iframe, textArea, selectorBtns, webpage} = init();
    const text = textArea.value.trim();
    iframe.style.display = 'none';
    clearSelection();

    let callback;
    const selectedType = [...selectorBtns].find((btn) => btn.classList.contains('selected'));

    switch (selectedType.classList[0]) {
      case 'html':
        const selectors = document.querySelectorAll(text);
        selectors.length === 0 && (textArea.value += `\n\n--- Error: Invalid selector ---`);
        selectors.forEach((element) => previewElement(element, 'block'));

        callback = () => {
          selectors.forEach((element) => previewElement(element, 'none'));
        };
        break;
      case 'css':
        break;

      case 'js':
        break;
    }

    webpage.addEventListener('click', () => {
      iframe.style.display = 'block';
      callback();
    });
  } else if (request.type === 'getUrl') {
    const {urlInput} = init();
    const windowUrl = new URL(window.location.href);
    urlInput.value = windowUrl.hostname;
  }
});

const init = (mode) => {
  const webpage = document.querySelector('html');

  const iframe = document.querySelector('#sanitize');
  const innerDoc = iframe.contentDocument || iframe.contentWindow.document;

  const main = innerDoc.querySelector('main');
  const textArea = innerDoc.querySelector('textarea');
  const urlInput = innerDoc.querySelector('#url');
  const selectorBtns = innerDoc.querySelectorAll('#selector button');

  if (mode === 'select') {
    const styleSheet = document.createElement('style');
    const drawing = document.createElement('div');

    drawing.classList.add('sn-hover');
    styleSheet.classList.add('sn-style');
    styleSheet.textContent =
      'body * { user-select: none !important; cursor: crosshair !important; }' +
      '.sn-hover { position: absolute; background-color: rgba(200, 0, 0, 0.4); border: 3px solid rgba(100, 0, 0, 0.75); pointer-events: none; z-index: 2147483646; }' +
      '.sn-selected { background-color: rgba(140, 0, 0, 0.4) !important; border: 3px solid rgba(70, 0, 0, 0.75) !important; }' +
      '#sanitize { pointer-events: none; }';

    webpage.append(styleSheet);
    webpage.append(drawing);

    return {iframe, main, textArea, webpage, urlInput, selectorBtns, drawing, styleSheet};
  }

  return {iframe, main, textArea, urlInput, selectorBtns, webpage};
};

const clearSelection = () => {
  if (document.querySelector('.sn-selected')) {
    document.querySelectorAll('.sn-selected').forEach((element) => {
      element.remove();
    });
  }
};

const previewElement = (element, method) => {
  if (method === 'block') {
    element.style.cssText = `${element.style.cssText}; display: none !important;`;
  } else {
    element.style.cssText = element.style.cssText.replace('display: none !important;', '');
  }
};

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
    element.classList.forEach((name) => {
      if ([':', '&', '!', '[', ']', '#'].includes(name)) {
        selector += `.${name}`;
      }
    });
    if (document.querySelectorAll(selector).length === 1) {
      return selector;
    }
  }

  if (element.parentElement) {
    return getSelector(element.parentElement) + ` > ${selector}`;
  }

  return selector;
};
