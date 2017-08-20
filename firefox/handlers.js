const bringTabForward = (tabId) =>
  browser.tabs.move(tabId, { index: 0 });

const handleTabActivated = ({ tabId }) => {
  bringTabForward(tabId);
}

const handleTabMoved = async () => {
  const [nowLeadingTab] = await browser.tabs.query({ currentWindow: true, index: 0 });
  const { id, active } = nowLeadingTab;

  if (!active) {
    browser.tabs.update(id, { active: true });
  }
};

const handleActiveTabOnInitialize = (tab) => {
  const { id, index } = tab;

  if (index > 0) {
    bringTabForward(id);
  }
};

const handleWindowFocus = async (windowId) => {
  const [activeTab] = await browser.tabs.query({ windowId, active: true });
  const { id, index } = activeTab;

  if (index > 0) {
    bringTabForward(id);
  }
}

browser.tabs.onActivated.addListener(handleTabActivated);
browser.tabs.onMoved.addListener(handleTabMoved);
browser.windows.onFocusChanged.addListener(handleWindowFocus);
browser.tabs.query({ currentWindow: true, active: true })
  .then(tabs => tabs[0])
  .then(handleActiveTabOnInitialize);
