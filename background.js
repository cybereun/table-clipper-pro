// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ tableClipperEnabled: true });
  updateBadge(true);
});

chrome.action.onClicked.addListener(async (tab) => {
  const data = await chrome.storage.local.get({ tableClipperEnabled: true });
  const nextState = !data.tableClipperEnabled;
  await chrome.storage.local.set({ tableClipperEnabled: nextState });
  updateBadge(nextState);

  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_TABLE_CLIPPER", isEnabled: nextState }).catch(() => {});
  }
});

function updateBadge(isEnabled) {
  chrome.action.setBadgeText({ text: isEnabled ? "ON" : "OFF" });
  chrome.action.setBadgeBackgroundColor({ color: isEnabled ? "#2563EB" : "#6B7280" });
}
