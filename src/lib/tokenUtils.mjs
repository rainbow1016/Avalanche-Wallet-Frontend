import { ethers } from "ethers";
import { Avalanche } from "avalanche";
import abi from "../lib/erc20.abi.json" assert { type: "json" };
import tokenList from "../lib/erc20TokenList.json" assert { type: "json" };

const nodeURL = "https://api.avax-test.network/ext/bc/C/rpc";
const HTTPSProvider = new ethers.JsonRpcProvider(nodeURL);

const chainId = 43113;
const avalanche = new Avalanche(
  "api.avax-test.network",
  undefined,
  "https",
  chainId
);
const cchain = avalanche.CChain();

const calcFeeData = async (
  maxFeePerGas = undefined,
  maxPriorityFeePerGas = undefined
) => {
  const baseFee = parseInt(await cchain.getBaseFee(), 16) / 1e9;
  maxPriorityFeePerGas =
    maxPriorityFeePerGas == undefined
      ? parseInt(await cchain.getMaxPriorityFeePerGas(), 16) / 1e9
      : maxPriorityFeePerGas;
  maxFeePerGas =
    maxFeePerGas == undefined ? baseFee + maxPriorityFeePerGas : maxFeePerGas;

  if (maxFeePerGas < maxPriorityFeePerGas) {
    throw "Error: Max fee per gas cannot be less than max priority fee per gas";
  }

  return {
    maxFeePerGas: maxFeePerGas.toString(),
    maxPriorityFeePerGas: maxPriorityFeePerGas.toString()
  };
};

const sendAvax = async (
  wallet,
  address,
  signer,
  amount,
  to,
  maxFeePerGas = undefined,
  maxPriorityFeePerGas = undefined,
  nonce = undefined
) => {
  if (nonce == undefined) {
    nonce = await HTTPSProvider.getTransactionCount(address);
  }

  ({ maxFeePerGas, maxPriorityFeePerGas } = await calcFeeData(
    maxFeePerGas,
    maxPriorityFeePerGas
  ));

  maxFeePerGas = ethers.parseUnits(maxFeePerGas, "gwei");
  maxPriorityFeePerGas = ethers.parseUnits(maxPriorityFeePerGas, "gwei");

  const tx = {
    type: 2,
    nonce,
    to,
    maxPriorityFeePerGas,
    maxFeePerGas,
    value: ethers.parseEther(amount),
    chainId
  };

  tx.gasLimit = await HTTPSProvider.estimateGas(tx);

  const signedTx = await wallet.signTransaction(tx);
  const txHash = ethers.keccak256(signedTx);

  await (await signer.sendTransaction(tx)).wait();
  return txHash;
};

const sendErc20 = async (
  wallet,
  address,
  signer,
  amount,
  to,
  tokenContractAddress,
  maxFeePerGas = undefined,
  maxPriorityFeePerGas = undefined,
  nonce = undefined
) => {
  if (nonce == undefined) {
    nonce = await HTTPSProvider.getTransactionCount(address);
  }

  ({ maxFeePerGas, maxPriorityFeePerGas } = await calcFeeData(
    maxFeePerGas,
    maxPriorityFeePerGas
  ));

  const contract = new ethers.Contract(
    tokenContractAddress,
    abi,
    HTTPSProvider
  );
  const decimals = await contract.decimals();
  let txData = await contract.interface.encodeFunctionData("transfer", [
    to,
    Number(amount) * 10 ** Number(decimals)
  ]);

  maxFeePerGas = ethers.parseUnits(maxFeePerGas, "gwei");
  maxPriorityFeePerGas = ethers.parseUnits(maxPriorityFeePerGas, "gwei");

  const tx = {
    type: 2,
    nonce,
    from: address,
    to: tokenContractAddress,
    maxPriorityFeePerGas,
    maxFeePerGas,
    value: 0x00,
    chainId,
    data: txData
  };
  tx.gasLimit = await HTTPSProvider.estimateGas(tx);

  const signedTx = await wallet.signTransaction(tx);
  const txHash = ethers.keccak256(signedTx);

  await (await signer.sendTransaction(tx)).wait();
  return txHash;
};

export const sendToken = async (
  privateKey,
  to,
  tokenAddress,
  amount,
  maxFeePerGas = undefined,
  maxPriorityFeePerGas = undefined,
  nonce = undefined
) => {
  const wallet = new ethers.Wallet(privateKey);
  const address = wallet.address;
  const signer = new ethers.Wallet(privateKey, HTTPSProvider);
  let txHaxh = "";
  if (tokenAddress == "native") {
    txHaxh = await sendAvax(
      wallet,
      address,
      signer,
      amount,
      to,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce
    );
  } else {
    txHaxh = await sendErc20(
      wallet,
      address,
      signer,
      amount,
      to,
      tokenAddress,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce
    );
  }
  return txHaxh;
};

export const getERC20Balance = async (address) => {
  let result = [];
  let promises = tokenList.tokens.map(async (item) => {
    if (item.testnet_address == "native") {
      let avaxBalance = await HTTPSProvider.getBalance(address);
      avaxBalance = Number(avaxBalance) / 10 ** 18;
      if (avaxBalance > 0) {
        return {
          tokenAddress: "native",
          symbol: "AVAX",
          balance: String(avaxBalance),
          logoLink: item.logoURI
        };
      }
    } else {
      const contract = new ethers.Contract(
        item.testnet_address,
        abi,
        HTTPSProvider
      );
      let balance = await contract.balanceOf(address);
      balance = Number(balance) / 10 ** item.decimals;
      if (balance > 0) {
        return {
          tokenAddress: item.testnet_address,
          symbol: item.symbol,
          balance: String(balance),
          logoLink: item.logoURI
        };
      }
    }
  });

  result = await Promise.all(promises);
  result = result.filter((item) => item !== undefined);
  return result;
};
