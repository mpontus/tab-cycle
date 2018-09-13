const buryActiveTab = async () => {
  // Get current tab
  chrome.tabs.query(
    {
      currentWindow: true,
      active: true
    },
    ([currentTab]) =>
      // Get next tab
      chrome.tabs.query(
        { currentWindow: true, index: currentTab.index + 1 },
        ([nextTab]) => {
          if (nextTab === undefined) {
            return;
          }

          // Activate following tab
          chrome.tabs.update(nextTab.id, { active: true });

          // Move previous tab to the end
          chrome.tabs.move(currentTab.id, { index: -1 });
        }
      )
  );
};

const raiseLastTab = async () => {
  chrome.tabs.query({ currentWindow: true }, tabs => {
    if (tabs.length === 0) {
      return;
    }

    const lastTab = tabs[tabs.length - 1];

    if (lastTab.active !== true) {
      chrome.tabs.update(lastTab.id, { active: true });
      chrome.tabs.move(lastTab.id, { index: 0 });
    }
  });
};

chrome.commands.onCommand.addListener(command => {
  switch (command) {
    case "bury-active-tab":
      buryActiveTab();

      return;

    case "raise-last-tab":
      raiseLastTab();

      return;
  }
});
