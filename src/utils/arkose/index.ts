import { ArkoseTokenGenerator } from "./generator";

export function getArkoseToken(): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const arkoseTokenGenerator = new ArkoseTokenGenerator();
    setTimeout(async () => {
      const token = await arkoseTokenGenerator.generate();
      if (token) {
        resolve(token);
      } else {
        reject(new Error("Invalid token returned"));
      }
    }, 5000);
  });
}
