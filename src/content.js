(async () => {
  const annoyances = ['image', 'video', 'audio', 'table', 'form', 'list', 'link', 'semantic', 'embed'];
  const utilsSrc = browser.runtime.getURL('./src/utils.js');
  const url = window.location.hostname;
  const utils = await import(utilsSrc);
  const {checkSetting, initOptConf, getAllFilters} = utils;
  const settings = await initOptConf();

  const observerSrc = browser.runtime.getURL('./src/observer.js');
  const observer = await import(observerSrc);
  const {addNewObserver, dealwith, allTags} = observer;

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
      allTags['zen'].includes(name) && element.remove();

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

  // Block Annoyances
  annoyances.forEach(async (type) => {
    if (await checkSetting(type, url)) {
      if (!['link', 'semantic'].includes(type)) {
        const elements = document.querySelectorAll(allTags[type]);
        elements.forEach((element) => dealwith(element, type));
        addNewObserver(type);
      }

      switch (type) {
        case 'image':
          const image = document.createElement('style');
          image.textContent = '* { background-image: none !important; } img { display: none !important; }';
          document.head.append(image);
          break;

        case 'audio':
          browser.runtime.sendMessage({type: 'muteTab'});
          break;

        case 'link':
          const link = document.querySelectorAll('a');
          link.forEach((a) => (a.href = 'javascript:void(0)'));
          addNewObserver(type);
          break;

        case 'semantic':
          const semantic = document.createElement('style');
          semantic.textContent =
            '* { font-weight: normal !important; font-style: normal !important; text-decoration: none !important; ' +
            'text-transform: none !important; letter-spacing: normal !important; line-height: normal !important; ' +
            'text-indent: each-line !important; text-shadow: none !important;}';
          document.head.append(semantic);
          break;
      }
    }
  });

  // Html Filters
  if (await checkSetting('htmlFilter', url)) {
    const filters = await getAllFilters(url, 'html');
    filters.forEach((filter) => {
      document.querySelectorAll(filter).forEach((element) => {
        dealwith(element, 'Filters');
      });
    });

    addNewObserver('html', filters);
  }

  // Css Filters
  if (await checkSetting('cssFilter', url)) {
    const filters = await getAllFilters(url, 'css');
    filters.forEach((filter) => {
      const styleSheet = document.createElement('style');
      styleSheet.textContent = filter;
      document.querySelector('head').append(styleSheet);
    });
  }

  // Js filters
  if (await checkSetting('jsFilter', url)) {
    const filters = await getAllFilters(url, 'js');
    filters.forEach((filter) => {
      const script = document.createElement('script');
      script.textContent = filter;
      document.querySelector('head').append(script);
    });
  }
})();
