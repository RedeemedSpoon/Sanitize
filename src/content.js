(async () => {
  const utilsSrc = browser.runtime.getURL('./src/utils.js');
  const url = window.location.hostname;
  const utils = await import(utilsSrc);
  const {checkSetting, getContent} = utils;

  const observerSrc = browser.runtime.getURL('./src/observer.js');
  const observer = await import(observerSrc);
  const {addNewObserver} = observer;

  if (!(await getContent('activateExt'))) {
    return;
  }

  // Zen Mode
  if (await checkSetting('zen', url)) {
  }

  // GreyScale Mode
  if (await checkSetting('greyscale', url)) {
  }

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

  //Block Images
  if (await checkSetting('image', url)) {
    const images = document.querySelectorAll('img, picture, svg, img source, area, map, image');
    images.forEach((image) => image.remove());
    browser.runtime.sendMessage({type: 'imageBlock'});
    addNewObserver('image');
  }

  // Block Videos
  if (await checkSetting('video', url)) {
    const videos = document.querySelectorAll('video, video source, track');
    videos.forEach((video) => video.remove());
    addNewObserver('video');
  }

  // Block Audios
  if (await checkSetting('audio', url)) {
    const audios = document.querySelectorAll('audio, audio source, track');
    audios.forEach((audio) => audio.remove());
    browser.runtime.sendMessage({type: 'audioBlock'});
    addNewObserver('audio');
  }

  // Block Tables
  if (await checkSetting('table', url)) {
    const tables = document.querySelectorAll('table, thead, tbody, tfoot, tr, th, td, caption, col, colgroup');
    tables.forEach((table) => table.remove());
    addNewObserver('table');
  }

  // Block Forms
  if (await checkSetting('form', url)) {
    const forms = document.querySelectorAll('form, input, textarea, select, button, fieldset, legend, label, output');
    forms.forEach((form) => form.remove());
    addNewObserver('form');
  }

  // Block Embedded Objects
  if (await checkSetting('embed', url)) {
    const embeds = document.querySelectorAll('iframe, embed, object, slot, template, portal, frame, frameSet, shadow');
    embeds.forEach((embed) => embed.remove());
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
})();
