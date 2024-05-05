// Utility Function
const getUrl = async () => {
  const tabs = await browser.tabs.query({active: true, currentWindow: true});
  return new URL(tabs[0].url).hostname;
};

const resetSettings = async () => {
  await browser.storage.local.clear();
};

const initOptSettings = async (optSettings) => {
  const settings = await browser.storage.local.get();

  optSettings.forEach(async (optSetting) => {
    if (settings[optSetting.id] === undefined) {
      settings[optSetting.id] = optSetting.id === 'activateExt' ? true : false;
      await browser.storage.local.set(settings);
    }
  });

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

export {setSettings, getSettings, getUrl, initOptSettings, toggleOptSettings, resetSettings, checkSetting};
