import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { handleBigInt } from "@/lib/api-utils";
import { parseCalldata, getFunctionDescription } from "@/lib/evm-calldata-parser";

// ERC20 代币 ABI
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
];

/**
 * 处理 EVM 相关的 API 请求
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, rpcUrl, address, tokenAddress, txHash, rawTx, calldata } = body;

    // calldata parsing doesn't require RPC URL
    if (action !== "parse-calldata" && !rpcUrl) {
      return NextResponse.json(
        { error: "缺少 RPC URL 参数" },
        { status: 400 }
      );
    }

    // 创建 provider (除非是 calldata 解析)
    const provider = action !== "parse-calldata" ? new ethers.JsonRpcProvider(rpcUrl) : null;

    let result;
    switch (action) {
      case "balance":
        result = await getBalance(provider, address);
        break;
      case "token-balance":
        result = await getTokenBalance(provider, address, tokenAddress);
        break;
      case "chain-id":
        result = await getChainId(provider);
        break;
      case "gas-price":
        result = await getGasPrice(provider);
        break;
      case "broadcast":
        result = await broadcastTransaction(provider, rawTx);
        break;
      case "tx-info":
        result = await getTransactionInfo(provider, txHash);
        break;
      case "parse-calldata":
        result = await parseCalldataAction(calldata);
        break;
      default:
        return NextResponse.json(
          { error: "不支持的操作类型" },
          { status: 400 }
        );
    }

    return NextResponse.json(handleBigInt(result));
  } catch (error) {
    console.error("API 错误:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * 获取账户余额
 */
async function getBalance(provider: ethers.JsonRpcProvider, address: string) {
  if (!address) {
    throw new Error("缺少钱包地址");
  }

  const balanceWei = await provider.getBalance(address);
  const balanceEth = Number(ethers.formatEther(balanceWei));
  
  return {
    address,
    balanceWei: balanceWei.toString(),
    balanceEth,
    formattedBalance: `${balanceEth.toFixed(6)} ETH`,
  };
}

/**
 * 获取代币余额
 */
async function getTokenBalance(
  provider: ethers.JsonRpcProvider,
  address: string,
  tokenAddress: string
) {
  if (!address) {
    throw new Error("缺少钱包地址");
  }
  if (!tokenAddress) {
    throw new Error("缺少代币合约地址");
  }

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  
  const [symbol, decimals, balanceWei] = await Promise.all([
    tokenContract.symbol(),
    tokenContract.decimals(),
    tokenContract.balanceOf(address),
  ]);
  
  const balanceToken = Number(ethers.formatUnits(balanceWei, decimals));
  
  return {
    address,
    tokenContract: tokenAddress,
    tokenSymbol: symbol,
    tokenDecimals: decimals,
    balanceWei: balanceWei.toString(),
    balanceToken,
    formattedBalance: `${balanceToken.toFixed(4)} ${symbol}`,
  };
}

/**
 * 获取链 ID
 */
async function getChainId(provider: ethers.JsonRpcProvider) {
  const network = await provider.getNetwork();
  const chainId = network.chainId;
  
  let chainName = "未知网络";
  
  // 常见网络的 chainId
  const networkNames: Record<number, string> = {
    1: "Ethereum Mainnet",
    3: "Ropsten Testnet",
    4: "Rinkeby Testnet",
    5: "Goerli Testnet",
    42: "Kovan Testnet",
    56: "Binance Smart Chain",
    97: "BSC Testnet",
    137: "Polygon Mainnet",
    80001: "Polygon Mumbai Testnet",
    43114: "Avalanche C-Chain",
    43113: "Avalanche Fuji Testnet",
  };
  
  if (networkNames[Number(chainId)]) {
    chainName = networkNames[Number(chainId)];
  }
  
  return {
    chainIdHex: `0x${chainId.toString(16)}`,
    chainIdDec: Number(chainId),
    chainName,
  };
}

/**
 * 获取 Gas 价格
 */
async function getGasPrice(provider: ethers.JsonRpcProvider) {
  const gasPriceWei = await provider.getFeeData();
  const gasPrice = gasPriceWei.gasPrice || ethers.parseUnits("0", "gwei");
  const gasPriceGwei = Number(ethers.formatUnits(gasPrice, "gwei"));
  
  return {
    gasPriceWei: gasPrice.toString(),
    gasPriceGwei,
    formattedGasPrice: `${gasPriceGwei.toFixed(2)} Gwei`,
  };
}

/**
 * 广播交易
 */
async function broadcastTransaction(
  provider: ethers.JsonRpcProvider,
  rawTx: string
) {
  if (!rawTx) {
    throw new Error("缺少原始交易数据");
  }

  const tx = await provider.broadcastTransaction(rawTx);
  
  return {
    success: true,
    txHash: tx.hash,
    message: "交易已成功广播",
  };
}

/**
 * 获取交易信息
 */
async function getTransactionInfo(
  provider: ethers.JsonRpcProvider,
  txHash: string
) {
  if (!txHash) {
    throw new Error("缺少交易哈希");
  }

  const [tx, receipt] = await Promise.all([
    provider.getTransaction(txHash),
    provider.getTransactionReceipt(txHash),
  ]);

  if (!tx) {
    throw new Error("找不到该交易");
  }

  const valueWei = tx.value;
  const valueEth = Number(ethers.formatEther(valueWei));
  
  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    valueWei: valueWei.toString(),
    valueEth: valueEth.toFixed(6),
    gasPrice: tx.gasPrice?.toString() || "0",
    gasLimit: tx.gasLimit.toString(),
    nonce: tx.nonce,
    blockHash: tx.blockHash,
    blockNumber: tx.blockNumber,
    transactionIndex: tx.index,
    input: tx.data,
    status: receipt?.status === 1 ? "成功" : "失败",
    gasUsed: receipt?.gasUsed.toString() || "0",
  };
}

/**
 * Parse calldata
 */
async function parseCalldataAction(calldata: string) {
  if (!calldata) {
    throw new Error("缺少 calldata 参数");
  }

  const parsedData = parseCalldata(calldata);
  const description = getFunctionDescription(parsedData);
  
  return {
    ...parsedData,
    description,
    timestamp: new Date().toISOString()
  };
}
