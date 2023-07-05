console.log("hello background");
import { ChromeRuntimeMessage } from './types/base';

//(async () => {
// Contents側からの受信イベント
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    // Issue Token
    if (request.type == ChromeRuntimeMessage.ISSUE_AUTH_TOKEN){
      console.log(request)
      sendAuthTokenToContent(request, sender, sendResponse)
      return true;
    }

    // Revole Token
    if (request.type == ChromeRuntimeMessage.REVOKE_AUTH_TOKEN){
      chrome.identity.removeCachedAuthToken({token: request.token}, () => {});
      chrome.identity.clearAllCachedAuthTokens(() => {});
      const url = `https://accounts.google.com/o/oauth2/revoke?token=${request.token}`
      fetch(url).then((response) => {});
      return true;
    }

    sendResponse();
    return
  }
);
async function sendAuthTokenToContent(request, sender, sendResponse) {
  chrome.identity.getAuthToken(
    {interactive: request.interactive},
    (token: string|undefined) => {
      sendResponse({token: token});  
    }
  )
}
//})();