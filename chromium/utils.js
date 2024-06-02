// Utility Functions
const getUrl = async () => {
  const tabs = await chrome.tabs.query({active: true, currentWindow: true});
  return new URL(tabs[0].url).hostname;
};

const resetSettings = async () => {
  await chrome.storage.local.clear();
};

const exportConf = async () => {
  const settings = await chrome.storage.local.get();
  const jsonString = JSON.stringify(settings);
  return new Blob([jsonString], {type: 'application/json'});
};

const importConf = (file) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const settings = JSON.parse(e.target.result);
    await chrome.storage.local.set(settings);
  };

  reader.readAsText(file);
};

const checkSetting = async (setting, url) => {
  return (await getSettings('global', setting)) || (await getSettings(url, setting));
};

const initOptConf = async () => {
  const optSettings = ['activateExt', 'darkTheme', 'showInfo'];
  const settings = await chrome.storage.local.get();

  optSettings.forEach(async (optSetting) => {
    if (settings[optSetting] === undefined) {
      settings[optSetting] = optSetting === 'activateExt' ? true : false;
      await chrome.storage.local.set(settings);
    }
  });

  settings['filters'] = settings['filters'] || {global: {}};
  await chrome.storage.local.set(settings);

  return settings;
};

const toggleOptConf = async (settingId) => {
  const settings = await chrome.storage.local.get();
  settings[settingId] = !settings[settingId];
  await chrome.storage.local.set(settings);
};

const getSettings = async (scope, settingId) => {
  const settings = await chrome.storage.local.get();
  return (settings[scope] && settings[scope].includes(settingId)) || false;
};

const setSettings = async (scope, settingId, newValue) => {
  const settings = await chrome.storage.local.get();
  settings[scope] = settings[scope] || [];

  if (newValue) {
    settings[scope].push(settingId);
  } else {
    settings[scope] = settings[scope].filter((setting) => setting !== settingId);
    if (!settings[scope].length) {
      await chrome.storage.local.remove(scope);
      return;
    }
  }

  await chrome.storage.local.set(settings);
};

const getFilters = async (url) => {
  let settings = await chrome.storage.local.get();
  return settings['filters'][url] || {};
};

const getAllFilters = async (url, type) => {
  let globalFilters = await getFilters('global');
  let localFilters = await getFilters(url);
  globalFilters = globalFilters && globalFilters[type] ? globalFilters[type] : [];
  localFilters = localFilters && localFilters[type] ? localFilters[type] : [];

  return globalFilters.concat(localFilters);
};

const createFilter = async (url, type, filters) => {
  const settings = await chrome.storage.local.get();
  settings['filters'][url] = settings['filters'][url] || {};
  settings['filters'][url][type] = settings['filters'][url][type] || [];

  settings['filters'][url][type].push(filters);
  await chrome.storage.local.set(settings);
};

const updateFilter = async (url, type, filters) => {
  const settings = await chrome.storage.local.get();
  delete settings['filters'][url][type];

  filters[0] ? (settings['filters'][url][type] = filters) : null;
  await chrome.storage.local.set(settings);
};

const deleteFilter = async (url) => {
  const settings = await chrome.storage.local.get();
  delete settings['filters'][url];
  await chrome.storage.local.set(settings);
};

export {
  getUrl,
  checkSetting,
  resetSettings,
  exportConf,
  importConf,
  setSettings,
  getSettings,
  initOptConf,
  toggleOptConf,
  getFilters,
  getAllFilters,
  createFilter,
  updateFilter,
  deleteFilter,
};
