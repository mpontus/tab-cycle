const buryActiveTab = () => {
  chrome.tabs.query({ currentWindow: true, index: 1 }, ([nextTab]) => {
    chrome.tabs.query({ currentWindow: true, active: true }, ([activeTab]) => {
      chrome.tabs.update(nextTab.id, { active: true });
      chrome.tabs.move(activeTab.id, { index: -1 });
    });
  });
};

const raiseLastTab = () => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const lastTab = tabs[tabs.length - 1];

    if (lastTab.active !== true) {
      chrome.tabs.update(lastTab.id, { active: true });
      chrome.tabs.move(lastTab.id, { index: 0 });
    }
  });
};

chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'bury-active-tab':
      buryActiveTab();

      return;

    case 'raise-last-tab':
      raiseLastTab();

      return;
  }
});
