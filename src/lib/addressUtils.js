import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Buffer } from "buffer";
import { privateToPublic, pubToAddress } from "ethereumjs-util";
import * as bip39 from "bip39";
import HDKey from "hdkey";
import crypto from "crypto";

export const createAccount = () => {
  let mnemonic = bip39.generateMnemonic(256);
  // console.log("here", mnemonic);
  let seed = bip39.mnemonicToSeedSync(mnemonic);
  // console.log(seed.toString("hex"));
  const masterHdKey = HDKey.fromMasterSeed(seed);
  const ETH_ACCOUNT_PATH = `m/44'/60'/0'`;
  const ethAccountKey = masterHdKey.derive(ETH_ACCOUNT_PATH + "/0/0");
  const ethPrivateKey = ethAccountKey.privateKey.toString("hex");
  const ethPublicKey = privateToPublic(Buffer.from(ethPrivateKey, "hex"));
  return {
    seed: seed,
    privateKey: ethPrivateKey,
    publicKey: ethPublicKey.toString("hex")
  };
};

export const encryptKey = (password, seed) => {
  let salt = crypto.randomBytes(16).toString("hex");
  let key = crypto.pbkdf2Sync(password, salt, 10000, 512, "sha512");
  let cipher = crypto.createCipheriv(
    "aes-256-ctr",
    key.slice(0, 32),
    key.slice(32, 48)
  );
  let encryptedSeed = Buffer.concat([
    cipher.update(seed, "utf8"),
    cipher.final()
  ]);
  return {
    encryptedSeed: encryptedSeed.toString("hex"),
    salt: salt
  };
};
export const pubToAdd = (publicKey) => {
  const address =
    "0x" + pubToAddress(Buffer.from(publicKey, "hex")).toString("hex");
  return address;
};

export const afterLogin = (encryptedSeed, salt, password) => {
  let key = crypto.pbkdf2Sync(password, salt, 10000, 512, "sha512");
  let decipher = crypto.createDecipheriv(
    "aes-256-ctr",
    key.slice(0, 32),
    key.slice(32, 48)
  );
  let decryptedSeed = Buffer.concat([
    decipher.update(Buffer.from(encryptedSeed, "hex")),
    decipher.final()
  ]);
  let salt1 = crypto.randomBytes(32);
  let iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv("aes-256-cbc", salt1, iv);
  let encrypted = cipher.update(decryptedSeed.toString("hex"), "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    encryptedSeed: encrypted.toString("hex"),
    salt: salt1.toString("hex"),
    iv: iv.toString("hex")
  };
};

export const getSeed = (encryptedSeed, salt, iv) => {
  let encryptedText = Buffer.from(encryptedSeed, "hex");
  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(salt, "hex"),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  const seed = hexToAscii(decrypted.toString("hex"));
  const masterHdKey = HDKey.fromMasterSeed(Buffer.from(seed, "hex"));
  const ETH_ACCOUNT_PATH = `m/44'/60'/0'`;
  const ethAccountKey = masterHdKey.derive(ETH_ACCOUNT_PATH + "/0/0");
  const ethPrivateKey = ethAccountKey.privateKey.toString("hex");
  const ethPublicKey = privateToPublic(
    Buffer.from(ethPrivateKey, "hex")
  ).toString("hex");
  const ethAddress =
    "0x" + pubToAddress(Buffer.from(ethPublicKey, "hex")).toString("hex");
  return {
    seed: seed,
    privateKey: ethPrivateKey,
    publicKey: ethPublicKey,
    address: ethAddress
  };
};

function hexToAscii(hexStr) {
  let asciiStr = "";
  for (let i = 0; i < hexStr.length; i += 2) {
    const hexChar = hexStr.substr(i, 2);
    asciiStr += String.fromCharCode(parseInt(hexChar, 16));
  }
  return asciiStr;
}

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// export const getERC20Balance = async (address) => {
//   let result = [];
//   let promises = tokenList.tokens.map(async (item) => {
//     if (item.testnet_address == "native") {
//       let avaxBalance = await HTTPSProvider.getBalance(address);
//       avaxBalance = Number(avaxBalance) / 10 ** 18;
//       if (avaxBalance > 0) {
//         return {
//           tokenAddress: "native",
//           symbol: "AVAX",
//           balance: String(avaxBalance),
//           logoLink: item.logoURI,
//         };
//       }
//     } else {
//       const contract = new ethers.Contract(
//         item.testnet_address,
//         abi,
//         HTTPSProvider
//       );
//       let balance = await contract.balanceOf(address);
//       balance = Number(balance) / 10 ** item.decimals;
//       if (balance > 0) {
//         return {
//           tokenAddress: item.testnet_address,
//           symbol: item.symbol,
//           balance: String(balance),
//           logoLink: item.logoURI,
//         };
//       }
//     }
//   });

//   result = await Promise.all(promises);
//   result = result.filter((item) => item !== undefined);
//   return result;
// };

// this is result
// [
//     {
//       tokenAddress: 'native',
//       symbol: 'AVAX',
//       balance: '0.003764256925',
//       logoLink: 'https://cdn.routescan.io/_next/image?url=https%3A%2F%2Fcms-cdn.avascan.com%2Fcms2%2Favax.4e9df24ea466.svg&w=32&q=75'
//     },
//     {
//       tokenAddress: '0x5425890298aed601595a70AB815c96711a31Bc65',
//       symbol: 'USDC',
//       balance: '0.02',
//       logoLink: 'https://cdn.routescan.io/_next/image?url=https%3A%2F%2Fcms-cdn.avascan.com%2Fcms2%2Ftype%3Dpng_350_0.32116e70bafc&w=32&q=100'
//     }
//   ]
