// Observers to Detect Change in The DOM
const embedTags = ['iframe', 'embed', 'object', 'slot', 'template', 'portal', 'frame', 'frameset', 'shadow'];
const formTags = ['form', 'input', 'textarea', 'select', 'button', 'fieldset', 'legend', 'label', 'output'];
const tableTags = ['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'col', 'colgroup'];
const imgTags = ['img', 'picture', 'svg', 'source', 'area', 'map', 'image'];
const videoTags = ['video'];
const audioTags = ['audio'];

const zen = [...embedTags, ...formTags, ...imgTags, 'video', 'audio', 'track', 'script', 'style', 'link', 'dialog'];

const addNewObserver = (type) => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          traverseNode(node, type);
        });
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
  const name = node.nodeName.toLowerCase();
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

    case 'grayscale':
      name === 'html' && (node.style.filter = 'grayscale(100%)');
      break;

    case 'zen':
      break;

    case 'css':
      name === 'link' && node.rel === 'stylesheet' && node.remove();
      name === 'style' && node.remove();
      node.style && (node.style.cssText = '');
      break;

    case 'js':
      name === 'script' && node.remove();
      node.replaceWith(node.cloneNode(true));
      node.attributes.forEach((attribute) => {
        if (attribute.name.startsWith('on')) {
          node.removeAttribute(attribute.name);
        }
      });
      break;
  }
};

export {addNewObserver, zen};
