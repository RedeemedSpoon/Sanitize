// Message Listener for New Filters
chrome.runtime.onMessage.addListener(async (request) => {
  // Choose An Element
  if (request.type === 'pickElement') {
    clearSelection();
    let selectMode = true;
    const {iframe, webpage, drawing, styleSheet} = init('select');

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

        iframe.contentWindow.postMessage({type: 'selectedElement', content: selector}, '*');
      });
    });
    // Preview An Element
  } else if (request.type === 'previewElement') {
    const {iframe, webpage} = init();
    const text = request.content[0];
    const selectedType = request.content[1];
    let callback;

    iframe.style.display = 'none';
    clearSelection();

    switch (selectedType) {
      case 'html':
        const selectors = document.querySelectorAll(text);
        selectors.forEach((element) => previewElement(element, 'block'));

        callback = () => selectors.forEach((element) => previewElement(element, 'none'));

        break;
      case 'css':
        const tempStyle = document.createElement('style');
        tempStyle.textContent = text;
        webpage.append(tempStyle);

        callback = () => tempStyle.remove();
        break;
      case 'js':
        const tempScript = document.createElement('script');
        tempScript.textContent = text;
        webpage.append(tempScript);

        callback = () => tempScript.remove();
        break;
    }

    webpage.addEventListener('click', () => {
      iframe.style.display = 'block';
      callback();
    });
    // Retrieve URL
  } else if (request.type === 'getUrl') {
    const {iframe} = init();
    const url = window.location.hostname;
    await iframe.contentWindow.postMessage({type: 'createFilter', content: url}, '*');
  }
});

// Functions
const init = (mode) => {
  const webpage = document.querySelector('html');
  const iframe = document.querySelector('#sanitize');

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

    return {iframe, webpage, drawing, styleSheet};
  }

  return {iframe, webpage};
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
