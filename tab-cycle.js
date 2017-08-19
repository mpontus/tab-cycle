const bringTabForward = (tabId) =>
  browser.tabs.move(tabId, { index: 0 });

const handleTabActivated = ({ tabId }) => {
  bringTabForward(tabId);
}

const handleTabMoved = async () => {
  const [leadingTab] = await browser.tabs.query({ currentWindow: true, index: 0 });

  browser.tabs.update(leadingTab.id, { active: true });
};

const handleActiveTabOnInitialize = (tab) => {
  const { id, index } = tab;

  if (index !== 0) {
    bringTabForward(id);
  }
};

const handleWindowActivated = async (windowId) => {
  const [activeTab] = await browser.tabs.query({ windowId, active: true });
  const { id, index } = activeTab;

  if (index !== 0) {
    bringTabForward(id);
  }
}

const buryActiveTab = async () => {
  const [activeTab] = await browser.tabs.query({ currentWindow: true, active: true });

  browser.tabs.move(activeTab.id, { index: -1 });
};

const raiseLastTab = async () => {
  const [lastTab] = await browser.tabs.query({ currentWindow: true, active: true });

  browser.tabs.update(lastTab.id, { active: true });

}

browser.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'bury-active-tab':
      buryActiveTab();

      break;

    case 'raise-last-tab':
      raiseLastTab();

      break;
  }
});

browser.tabs.onActivated.addListener(handleTabActivated);
browser.tabs.onMoved.addListener(handleTabMoved);
browser.windows.onFocusChanged.addListener(handleWindowActivated);
browser.tabs.query({ currentWindow: true, active: true })
  .then(tabs => tabs[0])
  .then(handleActiveTabOnInitialize);
