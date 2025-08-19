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
        if (!provider) throw new Error("Provider is required for balance check");
        result = await getBalance(provider, address);
        break;
      case "token-balance":
        if (!provider) throw new Error("Provider is required for token balance check");
        result = await getTokenBalance(provider, address, tokenAddress);
        break;
      case "chain-id":
        if (!provider) throw new Error("Provider is required for chain ID check");
        result = await getChainId(provider);
        break;
      case "gas-price":
        if (!provider) throw new Error("Provider is required for gas price check");
        result = await getGasPrice(provider);
        break;
      case "broadcast":
        if (!provider) throw new Error("Provider is required for transaction broadcast");
        result = await broadcastTransaction(provider, rawTx);
        break;
      case "tx-info":
        if (!provider) throw new Error("Provider is required for transaction info");
        result = await getTransactionInfo(provider, txHash);
        break;
      case "parse-calldata":
        result = await parseCalldataAction(calldata);
        break;
      case "estimate-gas":
        if (!provider) throw new Error("Provider is required for gas estimation");
        result = await estimateGas(provider, body);
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

/**
 * 估算交易手续费
 */
async function estimateGas(provider: ethers.JsonRpcProvider, params: any) {
  const { fromAddress, toAddress, value, data } = params;
  
  if (!fromAddress) {
    throw new Error("缺少发送方地址");
  }
  
  if (!toAddress) {
    throw new Error("缺少接收方地址");
  }

  try {
    // 构建交易对象
    const txRequest: any = {
      from: fromAddress,
      to: toAddress,
    };
    
    // 添加价值（如果提供）
    if (value && value.trim()) {
      try {
        txRequest.value = ethers.parseEther(value);
      } catch (error) {
        throw new Error("无效的价值格式，请输入ETH数量");
      }
    }
    
    // 添加calldata（如果提供）
    if (data && data.trim()) {
      // 验证 hex 格式
      const cleanData = data.startsWith('0x') ? data : `0x${data}`;
      if (!/^0x[0-9a-fA-F]*$/.test(cleanData)) {
        throw new Error("无效的calldata格式");
      }
      txRequest.data = cleanData;
    }

    // 获取当前 gas 价格和网络信息
    const [gasEstimate, feeData, network] = await Promise.all([
      provider.estimateGas(txRequest),
      provider.getFeeData(),
      provider.getNetwork()
    ]);

    const gasLimit = gasEstimate;
    const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei");
    const maxFeePerGas = feeData.maxFeePerGas;
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;

    // 计算交易费用
    const legacyFee = gasLimit * gasPrice;
    const legacyFeeEth = Number(ethers.formatEther(legacyFee));
    const legacyFeeGwei = Number(ethers.formatUnits(gasPrice, "gwei"));

    const result: any = {
      gasEstimate: gasLimit.toString(),
      gasPrice: gasPrice.toString(),
      gasPriceGwei: legacyFeeGwei,
      transactionFeeWei: legacyFee.toString(),
      transactionFeeEth: legacyFeeEth,
      formattedFee: `${legacyFeeEth.toFixed(6)} ETH`,
      chainId: Number(network.chainId),
      timestamp: new Date().toISOString(),
    };

    // EIP-1559 支持 (maxFeePerGas 存在表示支持)
    if (maxFeePerGas && maxPriorityFeePerGas) {
      const eip1559Fee = gasLimit * maxFeePerGas;
      const eip1559FeeEth = Number(ethers.formatEther(eip1559Fee));
      const maxFeeGwei = Number(ethers.formatUnits(maxFeePerGas, "gwei"));
      const maxPriorityGwei = Number(ethers.formatUnits(maxPriorityFeePerGas, "gwei"));
      
      result.eip1559Support = true;
      result.maxFeePerGas = maxFeePerGas.toString();
      result.maxPriorityFeePerGas = maxPriorityFeePerGas.toString();
      result.maxFeePerGasGwei = maxFeeGwei;
      result.maxPriorityFeePerGasGwei = maxPriorityGwei;
      result.eip1559TransactionFeeWei = eip1559Fee.toString();
      result.eip1559TransactionFeeEth = eip1559FeeEth;
      result.eip1559FormattedFee = `${eip1559FeeEth.toFixed(6)} ETH`;
    } else {
      result.eip1559Support = false;
    }

    // 不同 gas price 的估算
    const gasMultipliers = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const gasEstimates = gasMultipliers.map(multiplier => {
      const adjustedGasPrice = BigInt(Math.floor(Number(gasPrice) * multiplier));
      const adjustedFee = gasLimit * adjustedGasPrice;
      const adjustedFeeEth = Number(ethers.formatEther(adjustedFee));
      const adjustedGasGwei = Number(ethers.formatUnits(adjustedGasPrice, "gwei"));
      
      let speed = "慢";
      if (multiplier >= 2) speed = "极快";
      else if (multiplier >= 1.25) speed = "快";
      else if (multiplier >= 1) speed = "标准";
      else if (multiplier >= 0.75) speed = "较慢";
      
      return {
        speed,
        multiplier,
        gasPrice: adjustedGasPrice.toString(),
        gasPriceGwei: adjustedGasGwei,
        transactionFeeWei: adjustedFee.toString(),
        transactionFeeEth: adjustedFeeEth,
        formattedFee: `${adjustedFeeEth.toFixed(6)} ETH`
      };
    });
    
    result.gasEstimates = gasEstimates;
    
    return result;
    
  } catch (error) {
    if (error instanceof Error) {
      // 处理常见错误
      if (error.message.includes("insufficient funds")) {
        throw new Error("余额不足无法估算gas");
      } else if (error.message.includes("execution reverted")) {
        throw new Error("交易将会失败，无法估算gas");
      } else if (error.message.includes("invalid address")) {
        throw new Error("无效的地址格式");
      }
    }
    throw error;
  }
}
