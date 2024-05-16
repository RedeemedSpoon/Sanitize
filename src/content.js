(async () => {
  const utilsSrc = browser.runtime.getURL('./src/utils.js');
  const url = window.location.hostname;
  const utils = await import(utilsSrc);
  const {checkSetting, initOptSettings} = utils;
  const settings = await initOptSettings();

  const observerSrc = browser.runtime.getURL('./src/observer.js');
  const observer = await import(observerSrc);
  const {addNewObserver, dealwith, zen} = observer;

  if (!settings['activateExt']) {
    return;
  }

  // Zen Mode
  if (await checkSetting('zen', url)) {
    document.body.replaceWith(document.body.cloneNode(true));

    document.querySelectorAll('link').forEach((cssLink) => {
      cssLink.rel === 'stylesheet' && cssLink.remove();
    });

    const styleTags = document.querySelectorAll('style');
    styleTags.forEach((styleTag) => styleTag.remove());

    const scriptTags = document.querySelectorAll('script');
    scriptTags.forEach((scriptTag) => scriptTag.remove());

    let elements = document.querySelectorAll('*');
    elements.forEach((element) => {
      const name = element.tagName.toLowerCase();
      zen.includes(name) && element.remove();

      element.style.cssText = '';
      for (const attribute of element.attributes) {
        if (attribute.name.startsWith('on')) {
          element.removeAttribute(attribute.name);
        }
      }
    });

    const allContent =
      document.querySelector('article') ||
      document.querySelector('main') ||
      document.querySelector('#root') ||
      document.querySelector('.root') ||
      document.querySelector('#main') ||
      document.querySelector('.main') ||
      document.querySelector('#content') ||
      document.querySelector('.content') ||
      document.querySelector('#article') ||
      document.querySelector('.article') ||
      document.querySelector('#container') ||
      document.querySelector('.container') ||
      document.querySelector('body');

    const styleSheet = document.createElement('style');
    styleSheet.innerText =
      'body {margin: 6.5% 28.5%; font-size: 20px} body.dark {background-color:#252525; color: #f9f9f9}';

    if (settings['darkTheme']) {
      document.body.classList.add('dark');
    }

    document.body.innerHTML = allContent.innerHTML;
    document.querySelector('head').append(styleSheet);
  }

  // GreyScale Mode
  if (await checkSetting('grayscale', url)) {
    const page = document.querySelector('html');
    page.style.filter = 'grayscale(100%)';
    addNewObserver('grayscale');
  }

  // FreezeMode
  if (await checkSetting('freeze', url)) {
    browser.runtime.sendMessage({type: 'freezeMode'});
  }

  // Disable Css
  if ((await checkSetting('css', url)) && !(await checkSetting('zen', url))) {
    const cssLinks = document.querySelectorAll('link');
    cssLinks.forEach((cssLink) => {
      if (cssLink.rel === 'stylesheet') {
        cssLink.remove();
      }
    });

    const styleTags = document.querySelectorAll('style');
    styleTags.forEach((styleTag) => {
      styleTag.remove();
    });

    const elements = document.querySelectorAll('*');
    elements.forEach((element) => {
      element.style.cssText = '';
    });

    addNewObserver('css');
  }

  // Disable Js
  if ((await checkSetting('js', url)) && !(await checkSetting('zen', url))) {
    document.body.replaceWith(document.body.cloneNode(true));

    const scriptTags = document.querySelectorAll('script');
    scriptTags.forEach((scriptTag) => {
      scriptTag.remove();
    });

    const elements = document.querySelectorAll('*');
    elements.forEach((element) => {
      for (const attribute of element.attributes) {
        if (attribute.name.startsWith('on')) {
          element.removeAttribute(attribute.name);
        }
      }
    });

    addNewObserver('js');
  }

  //Block Images
  if (await checkSetting('image', url)) {
    const images = document.querySelectorAll('img, picture, svg, img source, area, map, image');
    images.forEach((image) => dealwith(image, 'image'));
    browser.runtime.sendMessage({type: 'imageBlock'});
    addNewObserver('image');
  }

  // Block Videos
  if (await checkSetting('video', url)) {
    const videos = document.querySelectorAll('video, video source, track');
    videos.forEach((video) => dealwith(video, 'video'));
    addNewObserver('video');
  }

  // Block Audios
  if (await checkSetting('audio', url)) {
    const audios = document.querySelectorAll('audio, audio source, track');
    audios.forEach((audio) => dealwith(audio, 'audio'));
    browser.runtime.sendMessage({type: 'audioBlock'});
    addNewObserver('audio');
  }

  // Block Tables
  if (await checkSetting('table', url)) {
    const tables = document.querySelectorAll('table, thead, tbody, tfoot, tr, th, td, caption, col, colgroup');
    tables.forEach((table) => dealwith(table, 'table'));
    addNewObserver('table');
  }

  // Block Forms
  if (await checkSetting('form', url)) {
    const forms = document.querySelectorAll('form, input, textarea, select, button, fieldset, legend, label, output');
    forms.forEach((form) => dealwith(form, 'form'));
    addNewObserver('form');
  }

  // Block Embedded Objects
  if (await checkSetting('embed', url)) {
    const embeds = document.querySelectorAll('iframe, embed, object, slot, template, portal, frame, frameSet, shadow');
    embeds.forEach((embed) => dealwith(embed, 'embed'));
    addNewObserver('embed');
  }

  // HTML Filters
  if (await checkSetting('htmlFilter', url)) {
  }

  // CSS Filters
  if (await checkSetting('cssFilter', url)) {
  }

  // Js filters
  if (await checkSetting('jsFilter', url)) {
  }

  // When Making New Filters
  browser.runtime.onMessage.addListener(async (request) => {
    if (request.type === 'pickElement') {
      const webpage = document.querySelector('html');
      const drawing = document.createElement('div');
      drawing.classList.add('sn-hover');
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
          e.stopPropagation();
          drawing.classList.remove('sn-selected');
          createBox(element);
        });

        element.addEventListener('click', (e) => {
          e.stopPropagation();
          drawing.classList.add('sn-selected');

          const selector = getSelector(element);
          document.querySelectorAll('.sn-selected').forEach((element) => element.remove());
          document.querySelectorAll(selector).forEach((element) => createBox(element, 'HighlightAll'));

          const iframe = document.querySelector('#sanitize');
          const innerDoc = iframe.contentDocument || iframe.contentWindow.document;

          const main = innerDoc.querySelector('main');
          const textArea = innerDoc.querySelector('textarea');

          main.classList.remove('minimized');
          textArea.value = selector;
        });

        const createBox = (element, type) => {
          const res = element.getBoundingClientRect();

          drawing.style.top = `${res.top + window.scrollY}px`;
          drawing.style.left = `${res.left + window.scrollX}px`;
          drawing.style.width = `${res.width}px`;
          drawing.style.height = `${res.height}px`;

          if (type === 'HighlightAll') {
            const clone = drawing.cloneNode();
            webpage.append(clone);
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
      });
    }
  });
})();
