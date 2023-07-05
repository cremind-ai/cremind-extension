export default function useStorage() {
  const setLocalStorage = <T>(obj: T) => {
    return new Promise((resolve) => {
      chrome.storage.local.set(obj, () => {
        // @ts-ignore
        resolve();
      });
    });
  };

  const getLocalStorage = <T>(key: string) => {
    return new Promise<T>((resolve) => {
      chrome.storage.local.get(key, (item) => {
        key ? resolve(<T>item[key]) : resolve(<T>item);
      });
    });
  };

  const setSyncStorage = <T>(obj: T) => {
    return new Promise((resolve) => {
      chrome.storage.sync.set(obj, () => {
        // @ts-ignore
        resolve();
      });
    });
  };

  const getSyncStorage = <T>(key: string) => {
    return new Promise<T>((resolve) => {
      chrome.storage.sync.get(key, (item) => {
        key ? resolve(<T>item[key]) : resolve(<T>item);
      });
    });
  };

  const addStorangeChangeEventListener = (
    key: string,
    callback: (oldValue: any, newValue: any) => void
  ) => {
    chrome.storage.onChanged.addListener((change: any) => {
      callback(change?.[key]?.oldValue, change?.[key]?.newValue);
    });
  };

  return {
    setLocalStorage,
    getLocalStorage,
    setSyncStorage,
    getSyncStorage,
    addStorangeChangeEventListener,
  };
}
