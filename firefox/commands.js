const buryActiveTab = async () => {
  const [nextTab] = await browser.tabs.query({ currentWindow: true, index: 1 });
  const [activeTab] = await browser.tabs.query({ currentWindow: true, active: true });

  browser.tabs.update(nextTab.id, { active: true });
  browser.tabs.move(activeTab.id, { index: -1 });
};

const raiseLastTab = async () => {
  const tabs = await browser.tabs.query({ currentWindow: true });
  const lastTab = tabs[tabs.length - 1];

  if (lastTab.active !== true) {
    browser.tabs.update(lastTab.id, { active: true });
    browser.tabs.move(lastTab.id, { index: 0 });
  }
}

browser.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'bury-active-tab':
      buryActiveTab();

      return;

    case 'raise-last-tab':
      raiseLastTab();

      return;
  }
});
