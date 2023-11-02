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
    script.src = document
      .querySelector("script[cremind-arkose-token]")
      .getAttribute("cremind-arkose-token");
    script.async = true;
    script.defer = true;
    script.setAttribute("data-callback", "useArkoseSetupEnforcement");
    script.onload = () => {};
    document.body.appendChild(script);
  }

  async generate() {
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

window.addEventListener("cremind-arkose-generator", async (event) => {
  if (event.detail.data === "GET_TOKEN") {
    if (!arkoseGenerator.isReady) {
      await arkoseGenerator.scriptLoaded;
    }
    const token = await arkoseGenerator.generate();
    const sendEvent = new CustomEvent("cremind-arkose-client", {
      detail: { token: token },
    });
    window.dispatchEvent(sendEvent);
  }
});
