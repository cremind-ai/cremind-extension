import CryptoES from "crypto-es";
import fs from "fs";

fs.readFile("./config.json", "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  try {
    const config = JSON.parse(data);
    const secretKey = process.env.VUE_APP_CRYPTO_SECRET_KEY;

    const ciphertext = CryptoES.AES.encrypt(
      JSON.stringify(config),
      secretKey
    ).toString();

    console.log(ciphertext);

    const bytes = CryptoES.AES.decrypt(ciphertext, secretKey);
    var originalText = bytes.toString(CryptoES.enc.Utf8);
    console.log(originalText);
  } catch (err) {
    console.error(err);
  }
});

// Run: VUE_APP_CRYPTO_SECRET_KEY=<value> node encryptConfig.js
