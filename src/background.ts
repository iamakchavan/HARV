import Browser from 'webextension-polyfill';

// Handle keyboard shortcuts
Browser.commands.onCommand.addListener(async (command) => {
  if (command === "_execute_action") {
    try {
      // Get current window
      const window = await Browser.windows.getCurrent();
      
      // Get active tab
      const [tab] = await Browser.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) return;

      // Calculate popup position
      const width = 400;
      const height = 600;
      const left = (window.width || 0) - width - 20;
      const top = 20;

      // Open popup
      await Browser.windows.create({
        url: 'index.html',
        type: 'popup',
        width,
        height,
        left,
        top,
        focused: true
      });
    } catch (error) {
      console.error('Error opening popup:', error);
    }
  }
});

// Clear storage when window/tab closes
Browser.tabs.onRemoved.addListener(async (tabId) => {
  try {
    const storageKey = `tab_${tabId}`;
    await Browser.storage.local.remove(storageKey);
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
});

// Initialize tab-specific storage
Browser.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const prevTabs = await Browser.tabs.query({});
    for (const tab of prevTabs) {
      if (tab.id !== activeInfo.tabId) {
        const storageKey = `tab_${tab.id}`;
        await Browser.storage.local.remove(storageKey);
      }
    }
  } catch (error) {
    console.error('Error clearing storage on tab switch:', error);
  }
});