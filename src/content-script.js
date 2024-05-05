(async () => {
  const utilsSrc = browser.runtime.getURL('./src/utils.js');
  const url = window.location.hostname;
  const utils = await import(utilsSrc);
  const {checkSetting} = utils;

  const observerSrc = browser.runtime.getURL('./src/observer.js');
  const observer = await import(observerSrc);
  const {addNewObserver} = observer;

  // Disable Css
  if (await checkSetting('css', url)) {
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
  if (await checkSetting('js', url)) {
    document.querySelector('body').replaceWith(document.querySelector('body').cloneNode(true));

    const jsLinks = document.querySelectorAll('link');
    jsLinks.forEach((jsLink) => {
      jsLink.src && jsLink.src.includes('.js') && jsLink.remove();
    });

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
})();
