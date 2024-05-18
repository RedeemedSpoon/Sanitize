// Utility Functions
const getUrl = async () => {
  const tabs = await browser.tabs.query({active: true, currentWindow: true});
  return new URL(tabs[0].url).hostname;
};

const resetSettings = async () => {
  await browser.storage.local.clear();
};

const exportSettings = async () => {
  const settings = await browser.storage.local.get();
  const jsonString = JSON.stringify(settings);
  return new Blob([jsonString], {type: 'application/json'});
};

const importSettings = (file) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const settings = JSON.parse(e.target.result);
    await browser.storage.local.set(settings);
  };

  reader.readAsText(file);
};

const initOptSettings = async () => {
  const optSettings = ['activateExt', 'darkTheme', 'showInfo'];
  const settings = await browser.storage.local.get();

  optSettings.forEach(async (optSetting) => {
    if (settings[optSetting] === undefined) {
      settings[optSetting] = optSetting === 'activateExt' ? true : false;
      await browser.storage.local.set(settings);
    }
  });

  settings['filters'] = settings['filters'] || {global: {}};
  await browser.storage.local.set(settings);

  return settings;
};

const toggleOptSettings = async (settingId) => {
  const settings = await browser.storage.local.get();
  settings[settingId] = !settings[settingId];
  await browser.storage.local.set(settings);
};

const getSettings = async (scope, settingId) => {
  const settings = await browser.storage.local.get();
  return (settings[scope] && settings[scope].includes(settingId)) || false;
};

const setSettings = async (scope, settingId, newValue) => {
  const settings = await browser.storage.local.get();
  settings[scope] = settings[scope] || [];

  if (newValue) {
    settings[scope].push(settingId);
  } else {
    settings[scope] = settings[scope].filter((setting) => setting !== settingId);
    if (!settings[scope].length) {
      await browser.storage.local.remove(scope);
      return;
    }
  }

  await browser.storage.local.set(settings);
};

const checkSetting = async (setting, url) => {
  return (await getSettings('global', setting)) || (await getSettings(url, setting));
};

const getFilters = async (url, type) => {
  const settings = await browser.storage.local.get();
  const filters = settings['filters'];
  let local = [];
  let global = [];

  if (filters[url] && filters[url][type]) {
    local = filters[url][type];
  }

  if (filters['global'] && filters['global'][type]) {
    global = filters['global'][type];
  }

  return local.concat(global);
};

const createFilter = async (url, type, filters) => {
  const settings = await browser.storage.local.get();
  settings['filters'][url] = settings['filters'][url] || {};
  settings['filters'][url][type] = settings['filters'][url][type] || [];

  settings['filters'][url][type].push([...filters]);
  await browser.storage.local.set(settings);
};

const updateFilter = async (url, type, filters) => {
  const settings = await browser.storage.local.get();
  delete settings['filters'][url][type];

  settings['filters'][url][type] = filters;
  await browser.storage.local.set(settings);
};

const deleteFilter = async (url) => {
  const settings = await browser.storage.local.get();
  delete settings['filters'][url];
  await browser.storage.local.set(settings);
};

export {
  getUrl,
  setSettings,
  getSettings,
  initOptSettings,
  toggleOptSettings,
  resetSettings,
  exportSettings,
  importSettings,
  checkSetting,
  getFilters,
  createFilter,
  updateFilter,
  deleteFilter,
};
