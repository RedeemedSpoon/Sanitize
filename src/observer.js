// Observers to Detect Change in The DOM
import {initOptSettings} from './utils.js';

const message = (await initOptSettings())['showInfo'] || false;

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
      imgTags.includes(name) && dealwith(node, name);
      break;

    case 'video':
      videoTags.includes(name) && dealwith(node, name);
      break;

    case 'audio':
      audioTags.includes(name) && dealwith(node, name);
      break;

    case 'table':
      tableTags.includes(name) && dealwith(node, name);
      break;

    case 'form':
      formTags.includes(name) && dealwith(node, name);
      break;

    case 'embed':
      embedTags.includes(name) && dealwith(node, name);
      break;

    case 'grayscale':
      name === 'html' && (node.style.filter = 'grayscale(100%)');
      break;

    case 'zen':
      zen.includes(name) && node.remove();
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

const dealwith = (node, type) => {
  if (message) {
    const div = document.createElement('div');
    div.style.cssText =
      'background-color: #f8d7da; color: #721c24; padding: 5px; border: 1px solid #721c24; width: fit-content !important;';
    div.innerHTML = node.getBoundingClientRect().width > 50 ? `Blocked ${type}` : '🛇';
    node.parentNode.insertBefore(div, node);
  }

  node.remove();
};

export {addNewObserver, dealwith, zen};
