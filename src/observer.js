const embedTags = ['IFRAME', 'EMBED', 'OBJECT', 'SLOT', 'TEMPLATE', 'PORTAL', 'FRAME', 'FRAMESET', 'SHADOW'];
const formTags = ['FORM', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'FIELDSET', 'LEGEND', 'LABEL', 'OUTPUT'];
const tableTags = ['TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TH', 'TD', 'CAPTION', 'COL', 'COLGROUP'];
const imgTags = ['IMG', 'PICTURE', 'SVG', 'SOURCE', 'AREA', 'MAP', 'IMAGE'];
const videoTags = ['VIDEO'];
const audioTags = ['AUDIO'];

const addNewObserver = (type) => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => traverseNode(node, type));
      }
    });
  });

  observer.observe(document, {
    attributes: true,
    childList: true,
    subtree: true,
  });
};

const traverseNode = (node, type) => {
  checkObserver(node, type);
  node.childNodes.forEach((child) => {
    traverseNode(child, type);
  });
};

const checkObserver = (node, type) => {
  const name = node.nodeName.toUpperCase();
  switch (type) {
    case 'image':
      imgTags.includes(name) && node.remove();
      break;

    case 'video':
      videoTags.includes(name) && node.remove();
      break;

    case 'audio':
      audioTags.includes(name) && node.remove();
      break;

    case 'table':
      tableTags.includes(name) && node.remove();
      break;

    case 'form':
      formTags.includes(name) && node.remove();
      break;

    case 'embed':
      embedTags.includes(name) && node.remove();
      break;

    case 'css':
      name === 'LINK' && node.rel === 'stylesheet' && node.remove();
      name === 'STYLE' && node.remove();
      node.style && (node.style.cssText = '');
      break;

    case 'js':
      name === 'LINK' && node.src && node.src.includes('.js') && node.remove();
      name === 'SCRIPT' && node.remove();
      node.replaceWith(node.cloneNode(true));
      node.attributes.forEach((attribute) => {
        if (attribute.name.startsWith('on')) {
          node.removeAttribute(attribute.name);
        }
      });
      break;
  }
};

export {addNewObserver};
