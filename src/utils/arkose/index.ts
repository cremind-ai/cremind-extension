const script = document.createElement("script");
script.src = chrome.runtime.getURL(
  "/js/v2/35536E1E-65B4-4D96-9D97-6ADB7EFF8147/run_api.js"
);
script.setAttribute(
  "cremind-arkose-token",
  chrome.runtime.getURL("/js/v2/35536E1E-65B4-4D96-9D97-6ADB7EFF8147/api.js")
);
script.async = true;
script.defer = true;
script.type = "module";
document.body.appendChild(script);

let getTokenResolve: (value: string | null) => void;
const getTokenPromise: Promise<string | null> = new Promise((resolve) => {
  getTokenResolve = resolve;
});

window.addEventListener("cremind-arkose-client", async (event: Event) => {
  const customEvent = event as CustomEvent;
  if (customEvent.detail && customEvent.detail.token) {
    getTokenResolve(customEvent.detail.token);
  }
});

export async function getArkoseToken(): Promise<string | null> {
  const sendEvent = new CustomEvent("cremind-arkose-generator", {
    detail: { data: "GET_TOKEN" },
  });
  window.dispatchEvent(sendEvent);
  const timeout = setTimeout(() => {
    getTokenResolve(null);
  }, 5000);
  const token = await getTokenPromise;
  clearTimeout(timeout);
  return token;
}
