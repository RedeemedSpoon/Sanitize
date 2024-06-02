// Observers to Detect Change in The DOM
import {initOptConf} from './utils.js';

const message = (await initOptConf())['showInfo'] || false;

const embedTags = ['iframe', 'embed', 'object', 'slot', 'template', 'portal', 'frame', 'frameset', 'shadow'];
const formTags = ['form', 'input', 'textarea', 'select', 'button', 'fieldset', 'legend', 'label', 'output'];
const tableTags = ['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'col', 'colgroup'];
const imgTags = ['img', 'picture', 'svg', 'source', 'area', 'map', 'image'];
const listTags = ['ul', 'ol', 'dl', 'li', 'dd', 'dt', 'menu'];
const videoTags = ['video'];
const audioTags = ['audio'];

const zen = [...embedTags, ...formTags, ...imgTags, 'video', 'audio', 'track', 'script', 'style', 'link', 'dialog'];
const allTags = {
  image: imgTags,
  video: videoTags,
  audio: audioTags,
  form: formTags,
  table: tableTags,
  list: listTags,
  embed: embedTags,
  zen: zen,
};

const addNewObserver = (type, data) => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          traverseNode(node, type, data);
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

const traverseNode = (node, type, data) => {
  checkObserver(node, type, data);
  node.childNodes.forEach((child) => {
    traverseNode(child, type, data);
  });
};

const checkObserver = (node, type, data) => {
  const name = node.nodeName.toLowerCase();
  switch (type) {
    case 'image':
      imgTags.includes(name) && dealwith(node, 'image');
      break;

    case 'video':
      videoTags.includes(name) && dealwith(node, 'video');
      break;

    case 'audio':
      audioTags.includes(name) && dealwith(node, 'audio');
      break;

    case 'table':
      tableTags.includes(name) && dealwith(node, 'table');
      break;

    case 'form':
      formTags.includes(name) && dealwith(node, 'form');
      break;

    case 'list':
      listTags.includes(name) && dealwith(node, 'list');
      break;

    case 'link':
      name === 'a' ? (node.href = 'javascript:void(0)') : null;
      break;

    case 'embed':
      embedTags.includes(name) && dealwith(node, 'embed');
      break;

    case 'grayscale':
      name === 'html' && (node.style.filter = 'grayscale(100%)');
      break;

    case 'zen':
      zen.includes(name) && node.remove();
      break;

    case 'html':
      data.forEach((filter) => {
        if (node.nodeType === 2 || node.nodeType === 3) return;
        node.matches(filter) && dealwith(node, 'Filters');
      });
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

// Remove Element Or Replace By Message When Called
const dealwith = (node, type) => {
  if (node.id === 'sanitize') {
    return;
  }

  if (message) {
    const div = document.createElement('div');
    div.style.cssText =
      'background-color: #f8d7da; color: #721c24; padding: 5px; border: 1px solid #721c24; width: fit-content !important;';
    div.textContent = node.getBoundingClientRect().width > 50 ? `Blocked ${type}` : '🛇';
    node.parentNode.insertBefore(div, node);
  }

  node.remove();
};

export {addNewObserver, dealwith, allTags};
