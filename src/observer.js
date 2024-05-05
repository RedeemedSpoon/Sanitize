function addNewObserver(type) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (type === 'css') {
            node.nodeName === 'LINK' && node.rel === 'stylesheet' && node.remove();
            node.nodeName === 'STYLE' && node.remove();
            node.style && (node.style.cssText = '');
          } else if (type === 'js') {
            node.nodeName === 'LINK' && node.src && node.src.includes('.js') && node.remove();
            node.nodeName === 'SCRIPT' && node.remove();
            node.replaceWith(node.cloneNode(true));
            node.attributes &&
              node.attributes.forEach((attribute) => {
                attribute.name.startsWith('on') && node.removeAttribute(attribute.name);
              });
          }
        });
      }
    });
  });

  observer.observe(document, {attributes: true, childList: true, subtree: true});
}

export {addNewObserver};
