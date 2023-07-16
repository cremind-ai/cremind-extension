export class ChromeStorage {
  private storageArea: chrome.storage.StorageArea = chrome.storage.local;

  private static instance: ChromeStorage;

  private constructor() {}

  public static getInstance(): ChromeStorage {
    if (!ChromeStorage.instance) {
      ChromeStorage.instance = new ChromeStorage();
    }
    return ChromeStorage.instance;
  }

  public get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storageArea.get(key, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[key]);
        }
      });
    });
  }

  public getAllKeys(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.storageArea.get(null, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(Object.keys(result));
        }
      });
    });
  }

  public getWithWildcard(wildcard: string): Promise<{ [key: string]: any }> {
    return new Promise((resolve, reject) => {
      this.getAllKeys()
        .then((keys) => {
          const matchingKeys: string[] = keys.filter((key) =>
            key.includes(wildcard)
          );
          this.storageArea.get(matchingKeys, (result) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(result);
            }
          });
        })
        .catch((error) => reject(error));
    });
  }

  public set(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const items: { [key: string]: any } = {};
      items[key] = value;

      this.storageArea.set(items, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  public remove(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storageArea.remove(key, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  public removeWithWildcard(wildcard: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getAllKeys()
        .then((keys) => {
          const matchingKeys: string[] = keys.filter((key) =>
            key.includes(wildcard)
          );
          this.storageArea.remove(matchingKeys, () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        })
        .catch((error) => reject(error));
    });
  }

  public clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storageArea.clear(() => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
}
