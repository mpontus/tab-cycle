// In Chrome tab, activated through click, can't be programmatically moved until press is released.
// To bypass this, when we recognize the error, we schedule a reattempt after some interval.
const recognizeError = () => {
  const { lastError } = chrome.runtime;

  if (!lastError) {
    return false;
  }

  return 'Tabs cannot be edited right now (user may be dragging a tab).'
    .match(lastError.message);
}

/**
 * Attempt to move the tab until successful.
 *
 * Argument to this function must be a callback, which will perform the movement.
 * It must accept callback and invoke it after the movement is complete.
 */
const ensureMove = f => {
  const attemptMove = () => f(() => {
    if (recognizeError()) {
      setTimeout(attemptMove, 50);
    };
  });

  attemptMove();
}

const handleTabActivated = ({ tabId }) => {
  ensureMove((cb) => {
    chrome.tabs.move(tabId, { index: 0 }, cb);
  });
}

const handleTabMoved = async () => {
  const [nowLeadingTab] = await chrome.tabs.query({ currentWindow: true, index: 0 });
  const { id, active } = nowLeadingTab;

  if (!active) {
    chrome.tabs.update(id, { active: true });
  }
};

const bringTabForward = (tab) => {
  if (tab.index > 0) {
    chrome.tabs.move(tab.id, { index: 0 });
  }
}

const handleWindowFocus = (windowId) => {
  chrome.tabs.query({ windowId, active: true }, (tabs) => {
    bringTabForward(tabs[0]);
  });
}

const handleInitialize = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    bringTabForward(tabs[0]);
  });
}

chrome.tabs.onActivated.addListener(handleTabActivated);
chrome.tabs.onMoved.addListener(handleTabMoved);
chrome.windows.onFocusChanged.addListener(handleWindowFocus);
handleInitialize();
