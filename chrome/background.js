// How often should we reattempt movign the tab if it fails due to known error?
const MOVE_REATTEMPT_INTERVAL = 17;

// Hardcoded message of the known error. Better workaround is unknown.
const ERROR_MESSAGE_MOVE_WHILE_DRAGGING =
  'Tabs cannot be edited right now (user may be dragging a tab).';

/**
 * Returns currently active tab in active window.
 */
function getActiveTab(cb) {
  chrome.windows.getCurrent(({ id: windowId }) => {
    chrome.tabs.query({ active: true, windowId }, (([activeTab]) => {
      cb(activeTab);
    }));
  });
}

/**
 * Returns tab at the given index in active window.
 */
function getTabByIndex(index, cb) {
  chrome.windows.getCurrent(({ windowId }) => {
    chrome.tabs.query({ index, windowId }, (([activeTab]) => {
      cb(activeTab);
    }));
  });
}

/**
 * Ensure that active tab is at the front of all others in active window.
 */
function ensureActiveTabInFront() {
  getActiveTab((tab) => {
    if (tab.index !== 0) {
      // Moving tab after it has been activated by mouse will cause an error
      // unless the button is released. We work around this problem by
      // scheduling reattempt after catching the error.
      chrome.tabs.move(tab.id, { index: 0 }, (args) => {
        const { lastError } = chrome.runtime;

        if (
          (lastError !== undefined) &&
          (lastError && lastError.message === ERROR_MESSAGE_MOVE_WHILE_DRAGGING)
        ) {
          setTimeout(ensureActiveTabInFront, MOVE_REATTEMPT_INTERVAL);
        }
      });
    }
  })
}

// Callback is invoked when different tab is activated
chrome.tabs.onActivated.addListener(ensureActiveTabInFront);

// Callback is invoked when active tab changes places
chrome.tabs.onMoved.addListener(ensureActiveTabInFront);

/**
 * Move current tab at the end of the list before activating next tab.
 */
chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'bury-tab': {
      getTabByIndex(0, (currentTab) => {
        getTabByIndex(1, (nextTab) => {
          if (!nextTab) return;

          // Move first tab (which is active) all the way to the back
          chrome.tabs.move(currentTab.id, { index: -1 });

          // Activate the second (now first) tab
          chrome.tabs.update(nextTab.id, { active: true });
        });
      });

      return;
    }

    default:
      return;
  }
});
