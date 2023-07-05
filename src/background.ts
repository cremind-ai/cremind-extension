console.log("hello background");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  return;
});
