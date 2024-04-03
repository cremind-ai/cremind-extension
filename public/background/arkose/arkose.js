class ArkoseTokenGenerator {
  constructor() {
    this.enforcement = undefined;
    this.pendingPromises = [];
    this.isReady = false;
    window.useArkoseSetupEnforcement =
      this.useArkoseSetupEnforcement.bind(this);

    this.scriptLoaded = new Promise((resolve) => {
      this.resolveScriptLoaded = resolve;
    });

    this.injectScript();
  }

  useArkoseSetupEnforcement(enforcement) {
    this.enforcement = enforcement;
    enforcement.setConfig({
      onCompleted: (r) => {
        this.pendingPromises.forEach((promise) => {
          console.log("OK2-token", r.token);
          promise.resolve(r.token);
        });
        this.pendingPromises = [];
      },
      onReady: () => {
        this.resolveScriptLoaded(null);
      },
      onError: (r) => {},
      onFailed: (r) => {
        this.pendingPromises.forEach((promise) => {
          promise.reject(new Error("Failed to generate arkose token"));
        });
      },
    });
  }

  injectScript() {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL(
      "/js/v2/35536E1E-65B4-4D96-9D97-6ADB7EFF8147/api.js"
    );
    script.async = true;
    script.defer = true;
    script.setAttribute("data-callback", "useArkoseSetupEnforcement");
    script.onload = () => {};
    document.body.appendChild(script);
  }

  async generate() {
    console.log("OK1-generate");
    if (!this.enforcement) {
      return;
    }
    return new Promise((resolve, reject) => {
      this.pendingPromises = [{ resolve, reject }]; // store only one promise for now.
      this.enforcement.run();
    });
  }
}

const arkoseGenerator = new ArkoseTokenGenerator();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (
      message.topic === "communication" &&
      message.type === "get_arkose_token"
    )
      if (!arkoseGenerator.isReady) {
        await arkoseGenerator.scriptLoaded;
      }
    const token = await arkoseGenerator.generate();
    sendResponse({
      topic: "communication",
      type: "get_arkose_token",
      payload: {
        token: token,
      },
    });
  })();

  // Important! Return true to indicate you want to send a response asynchronously
  return true;
});
