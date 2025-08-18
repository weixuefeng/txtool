import { ethers } from "ethers";

// Common ERC20 function signatures
const ERC20_FUNCTION_SIGNATURES = {
  "0xa9059cbb": {
    name: "transfer",
    signature: "transfer(address,uint256)",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" }
    ]
  },
  "0x095ea7b3": {
    name: "approve",
    signature: "approve(address,uint256)",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" }
    ]
  },
  "0x23b872dd": {
    name: "transferFrom",
    signature: "transferFrom(address,address,uint256)",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" }
    ]
  }
};

// Common DeFi function signatures
const DEFI_FUNCTION_SIGNATURES = {
  // Uniswap V2 Router
  "0x38ed1739": {
    name: "swapExactTokensForTokens",
    signature: "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" }
    ]
  },
  "0x7ff36ab5": {
    name: "swapExactETHForTokens",
    signature: "swapExactETHForTokens(uint256,address[],address,uint256)",
    inputs: [
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" }
    ]
  },
  "0x18cbafe5": {
    name: "swapExactTokensForETH",
    signature: "swapExactTokensForETH(uint256,uint256,address[],address,uint256)",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" }
    ]
  },
  // Uniswap V3 Router
  "0x414bf389": {
    name: "exactInputSingle",
    signature: "exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160))",
    inputs: [
      { name: "params", type: "tuple", components: [
        { name: "tokenIn", type: "address" },
        { name: "tokenOut", type: "address" },
        { name: "fee", type: "uint24" },
        { name: "recipient", type: "address" },
        { name: "deadline", type: "uint256" },
        { name: "amountIn", type: "uint256" },
        { name: "amountOutMinimum", type: "uint256" },
        { name: "sqrtPriceLimitX96", type: "uint160" }
      ]}
    ]
  },
  // 1inch Aggregation Router
  "0x7c025200": {
    name: "swap",
    signature: "swap(address,(address,address,address,address,uint256,uint256,uint256,bytes),bytes)",
    inputs: [
      { name: "caller", type: "address" },
      { name: "desc", type: "tuple", components: [
        { name: "srcToken", type: "address" },
        { name: "dstToken", type: "address" },
        { name: "srcReceiver", type: "address" },
        { name: "dstReceiver", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "minReturnAmount", type: "uint256" },
        { name: "flags", type: "uint256" },
        { name: "permit", type: "bytes" }
      ]},
      { name: "data", type: "bytes" }
    ]
  },
  // Generic execute function
  "0xb61d27f6": {
    name: "execute",
    signature: "execute(address,uint256,bytes)",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" }
    ]
  },
  // Multicall
  "0xac9650d8": {
    name: "multicall",
    signature: "multicall(bytes[])",
    inputs: [
      { name: "data", type: "bytes[]" }
    ]
  }
};

// Combine all known function signatures
const ALL_FUNCTION_SIGNATURES: Record<string, {
  name: string;
  signature: string;
  inputs: Array<{
    name: string;
    type: string;
    components?: Array<{
      name: string;
      type: string;
    }>;
  }>;
}> = {
  ...ERC20_FUNCTION_SIGNATURES,
  ...DEFI_FUNCTION_SIGNATURES
};

export interface ParsedCalldata {
  success: boolean;
  functionSelector: string;
  functionName?: string;
  functionSignature?: string;
  decodedParameters?: any[];
  parameterNames?: string[];
  parameterTypes?: string[];
  rawCalldata: string;
  error?: string;
  category?: "ERC20" | "DeFi" | "Unknown";
}

/**
 * Parse EVM calldata and try to decode it using known function signatures
 */
export function parseCalldata(calldata: string): ParsedCalldata {
  try {
    // Remove 0x prefix if present and validate
    const cleanCalldata = calldata.replace(/^0x/, "");
    
    if (!/^[0-9a-fA-F]+$/.test(cleanCalldata)) {
      return {
        success: false,
        functionSelector: "",
        rawCalldata: calldata,
        error: "Invalid hex format"
      };
    }

    if (cleanCalldata.length < 8) {
      return {
        success: false,
        functionSelector: "",
        rawCalldata: calldata,
        error: "Calldata too short (minimum 4 bytes for function selector)"
      };
    }

    // Extract function selector (first 4 bytes)
    const functionSelector = "0x" + cleanCalldata.slice(0, 8);
    const functionData = ALL_FUNCTION_SIGNATURES[functionSelector];

    if (!functionData) {
      return {
        success: false,
        functionSelector,
        rawCalldata: calldata,
        error: "Unknown function selector",
        category: "Unknown"
      };
    }

    // Determine category
    let category: "ERC20" | "DeFi" | "Unknown" = "Unknown";
    if ((ERC20_FUNCTION_SIGNATURES as any)[functionSelector]) {
      category = "ERC20";
    } else if ((DEFI_FUNCTION_SIGNATURES as any)[functionSelector]) {
      category = "DeFi";
    }

    // Try to decode parameters
    try {
      const iface = new ethers.Interface([`function ${functionData.signature}`]);
      const decodedData = iface.decodeFunctionData(functionData.name, calldata);
      
      const parameterNames = functionData.inputs.map(input => input.name);
      const parameterTypes = functionData.inputs.map(input => input.type);
      
      // Format decoded parameters for better display
      const formattedParameters = decodedData.map((param, index) => {
        const paramType = parameterTypes[index];
        const paramName = parameterNames[index];
        
        if (paramType === "uint256") {
          return {
            name: paramName,
            type: paramType,
            value: param.toString(),
            formatted: formatTokenAmount(param.toString())
          };
        } else if (paramType === "address") {
          return {
            name: paramName,
            type: paramType,
            value: param,
            formatted: param
          };
        } else if (paramType === "address[]") {
          return {
            name: paramName,
            type: paramType,
            value: param,
            formatted: param.join(", ")
          };
        } else if (paramType === "bytes[]") {
          return {
            name: paramName,
            type: paramType,
            value: param,
            formatted: param.map((p: string) => p.slice(0, 10) + "...").join(", ")
          };
        } else if (paramType === "bytes") {
          return {
            name: paramName,
            type: paramType,
            value: param,
            formatted: param.slice(0, 20) + (param.length > 20 ? "..." : "")
          };
        } else if (paramType.startsWith("tuple")) {
          return {
            name: paramName,
            type: paramType,
            value: param,
            formatted: "Complex object (see raw value)"
          };
        } else {
          return {
            name: paramName,
            type: paramType,
            value: param.toString(),
            formatted: param.toString()
          };
        }
      });

      return {
        success: true,
        functionSelector,
        functionName: functionData.name,
        functionSignature: functionData.signature,
        decodedParameters: formattedParameters,
        parameterNames,
        parameterTypes,
        rawCalldata: calldata,
        category
      };

    } catch (decodeError) {
      return {
        success: false,
        functionSelector,
        functionName: functionData.name,
        functionSignature: functionData.signature,
        rawCalldata: calldata,
        error: `Failed to decode parameters: ${decodeError instanceof Error ? decodeError.message : String(decodeError)}`,
        category
      };
    }

  } catch (error) {
    return {
      success: false,
      functionSelector: "",
      rawCalldata: calldata,
      error: `Parsing error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Format token amount for better readability
 */
function formatTokenAmount(amount: string): string {
  const bigAmount = BigInt(amount);
  
  // Common token decimals
  const decimals18 = BigInt(10 ** 18);
  const decimals6 = BigInt(10 ** 6);
  
  if (bigAmount >= decimals18) {
    const formatted = Number(bigAmount) / Number(decimals18);
    return `${formatted.toFixed(4)} (assuming 18 decimals)`;
  } else if (bigAmount >= decimals6) {
    const formatted = Number(bigAmount) / Number(decimals6);
    return `${formatted.toFixed(4)} (assuming 6 decimals)`;
  } else {
    return amount;
  }
}

/**
 * Get human-readable description of the function
 */
export function getFunctionDescription(parsedData: ParsedCalldata): string {
  if (!parsedData.success || !parsedData.functionName) {
    return "无法解析的函数调用";
  }

  switch (parsedData.functionName) {
    case "transfer":
      return "转账代币";
    case "approve":
      return "授权代币";
    case "transferFrom":
      return "从指定地址转账";
    case "swapExactTokensForTokens":
      return "精确输入代币交换";
    case "swapExactETHForTokens":
      return "ETH兑换代币";
    case "swapExactTokensForETH":
      return "代币兑换ETH";
    case "exactInputSingle":
      return "Uniswap V3单次精确输入交换";
    case "swap":
      return "1inch聚合交换";
    case "execute":
      return "执行任意合约调用";
    case "multicall":
      return "批量调用";
    default:
      return parsedData.functionName;
  }
}
