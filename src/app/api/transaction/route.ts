import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { handleBigInt } from "@/lib/api-utils";
import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
import ecc from '@bitcoinerlab/secp256k1'
import { Transaction, VersionedTransaction } from '@solana/web3.js'
import bs58 from 'bs58';
// 初始化椭圆曲线加密库
bitcoin.initEccLib(ecc);

// 定义比特币网络
const BITCOIN_NETWORK = bitcoin.networks.bitcoin; // 主网
const BITCOIN_TESTNET = bitcoin.networks.testnet; // 测试网

/**
 * 处理交易解析的 API 请求
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blockchain, rawTransaction, txHash, rpcUrl, action } = body;

    // 处理根据交易哈希获取原始交易数据的请求
    if (action === "get-raw-tx") {
      if (!txHash) {
        return NextResponse.json(
          { error: "缺少交易哈希参数" },
          { status: 400 }
        );
      }
      
      if (!rpcUrl) {
        return NextResponse.json(
          { error: "缺少 RPC URL 参数" },
          { status: 400 }
        );
      }
      
      const result = await getTransactionByHash(rpcUrl, txHash);
      return NextResponse.json(handleBigInt(result));
    }

    // 处理解析原始交易数据的请求
    if (!blockchain) {
      return NextResponse.json(
        { error: "缺少区块链类型参数" },
        { status: 400 }
      );
    }

    if (!rawTransaction) {
      return NextResponse.json(
        { error: "缺少原始交易数据" },
        { status: 400 }
      );
    }

    let result;
    switch (blockchain) {
      case "btc":
        result = await parseBtcTransaction(rawTransaction);
        break;
      case "eth":
        result = await parseEthTransaction(rawTransaction);
        break;
      case "solana":
        result = await parseSolanaTransaction(rawTransaction);
        break;
      case "cosmos":
        result = await parseCosmosTransaction(rawTransaction);
        break;
      default:
        return NextResponse.json(
          { error: "不支持的区块链类型" },
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
 * 解析比特币交易
 */
async function parseBtcTransaction(rawTransaction: string) {
  try {
    // 将十六进制字符串转换为 Buffer
    let txBuffer: Buffer;
    
    // 检查是否为十六进制格式
    if (/^[0-9a-fA-F]+$/.test(rawTransaction)) {
      txBuffer = Buffer.from(rawTransaction, 'hex');
    } else {
      // 尝试解析为 Base64
      try {
        txBuffer = Buffer.from(rawTransaction, 'base64');
      } catch (e) {
        throw new Error('无效的交易格式，请提供十六进制或 Base64 格式的交易数据');
      }
    }
    
    // 解析交易
    const tx = bitcoin.Transaction.fromBuffer(txBuffer);
    
    // 获取交易 ID
    const txid = tx.getId();
    
    // 解析输入
    const inputs = tx.ins.map((input, index) => {
      // 获取输入脚本
      const scriptSig = bitcoin.script.toASM(input.script);
      
      // 获取见证数据（如果有）
      const witness = input.witness.length > 0 
        ? input.witness.map(w => w.toString('hex'))
        : undefined;
      
      // 尝试从输入脚本中解析地址
      let address = '';
      let type = '未知';
      
      try {
        // 直接尝试提取公钥并生成地址
        // 方法1: 尝试从脚本中提取公钥
        if (input.script.length > 0) {
          try {
            const chunks = bitcoin.script.decompile(input.script);
            
            // 检查是否为标准P2PKH输入
            if (chunks && chunks.length === 2 && 
                Buffer.isBuffer(chunks[1]) && 
                chunks[1].length >= 33) {
              
              // 从公钥创建地址
              const pubkey = chunks[1];
              try {
                const p2pkh = bitcoin.payments.p2pkh({
                  pubkey,
                  network: BITCOIN_NETWORK
                });
                
                if (p2pkh.address) {
                  type = 'P2PKH (从公钥推断)';
                  address = p2pkh.address;
                }
              } catch (e) {
                console.error('从公钥创建P2PKH地址失败:', e);
              }
            }
          } catch (e) {
            console.error('解析输入脚本失败:', e);
          }
        }
        
        // 方法2: 如果有见证数据，尝试从中提取公钥
        if (!address && witness && witness.length > 0) {
          // 对于P2WPKH，见证数据通常包含签名和公钥
          if (witness.length === 2) {
            try {
              const pubkeyHex = witness[1];
              const pubkey = Buffer.from(pubkeyHex, 'hex');
              
              if (pubkey.length >= 33) {
                try {
                  // 创建P2WPKH地址
                  const p2wpkh = bitcoin.payments.p2wpkh({
                    pubkey,
                    network: BITCOIN_NETWORK
                  });
                  
                  if (p2wpkh.address) {
                    type = 'P2WPKH (从见证数据推断)';
                    address = p2wpkh.address;
                  }
                } catch (e) {
                  console.error('从公钥创建P2WPKH地址失败:', e);
                }
              }
            } catch (e) {
              console.error('解析见证数据失败:', e);
            }
          }
        }
        
        // 方法3: 尝试从输入脚本中提取赎回脚本（P2SH）
        if (!address && input.script.length > 0) {
          try {
            const chunks = bitcoin.script.decompile(input.script);
            
            // P2SH输入的最后一个部分通常是赎回脚本
            if (chunks && chunks.length > 0 && Buffer.isBuffer(chunks[chunks.length - 1])) {
              const redeemScript = chunks[chunks.length - 1];
              
              // 尝试从赎回脚本中提取公钥哈希
              try {
                // 确保 redeemScript 是 Buffer 类型
                if (Buffer.isBuffer(redeemScript)) {
                  const redeemScriptChunks = bitcoin.script.decompile(redeemScript);
                  
                  // 检查是否为P2PKH赎回脚本
                  if (redeemScriptChunks && 
                      redeemScriptChunks.length === 5 && 
                      redeemScriptChunks[0] === bitcoin.opcodes.OP_DUP && 
                      redeemScriptChunks[1] === bitcoin.opcodes.OP_HASH160 && 
                      Buffer.isBuffer(redeemScriptChunks[2]) && 
                      redeemScriptChunks[2].length === 20) {
                    
                    // 从公钥哈希创建P2PKH地址
                    try {
                      const p2pkh = bitcoin.payments.p2pkh({
                        hash: redeemScriptChunks[2],
                        network: BITCOIN_NETWORK
                      });
                      
                      if (p2pkh.address) {
                        type = 'P2SH-P2PKH (从赎回脚本推断)';
                        address = p2pkh.address;
                      }
                    } catch (e) {
                      console.error('从公钥哈希创建P2PKH地址失败:', e);
                    }
                  }
                }
              } catch (e) {
                console.error('解析赎回脚本失败:', e);
              }
            }
          } catch (e) {
            console.error('提取赎回脚本失败:', e);
          }
        }
        
        // 方法4: 对于P2TR输入，尝试从见证数据中提取信息
        if (!address && witness && witness.length > 0) {
          if (witness.length === 1 && witness[0].length >= 128) { // Schnorr签名通常是64字节
            type = 'P2TR (推断)';
            address = 'Taproot输入 (注: 仅从交易数据无法直接解析原始地址，区块链浏览器通过查询前一个交易输出来显示地址)';
          } else if (witness.length > 1 && witness[0].length >= 128) {
            // 可能是使用脚本路径的Taproot输入
            type = 'P2TR脚本路径 (推断)';
            address = 'Taproot脚本路径支出 (注: 仅从交易数据无法直接解析原始地址，需要查询前一个交易输出)';
          }
        }
        
        // 如果仍然无法解析地址，提供一些有用的信息
        if (!address) {
          // 尝试提供更多调试信息
          if (witness && witness.length > 0) {
            type = '带见证数据的输入';
            address = `无法解析地址 (见证数据长度: ${witness.length})`;
          } else {
            type = '标准输入';
            address = '无法解析地址';
          }
          
          // 添加脚本信息
          if (scriptSig && scriptSig.length <= 100) {
            address += ` (脚本: ${scriptSig})`;
          }
        }
      } catch (e) {
        console.error('解析输入地址时出错:', e);
        address = '解析地址时出错';
      }
      
      // 添加前一个交易的输出索引，这有助于追踪资金流向
      const prevOutIndex = input.index;
      const prevTxId = Buffer.from(input.hash).reverse().toString('hex');
      
      return {
        index,
        txid: prevTxId,
        vout: prevOutIndex,
        scriptSig,
        sequence: input.sequence,
        witness,
        type,
        address,
      };
    });
    
    // 解析输出
    const outputs = tx.outs.map((output, index) => {
      // 尝试解析脚本
      let address = '';
      let type = '未知';
      
      try {
        // 解析脚本类型
        const scriptPubKey = bitcoin.script.toASM(output.script);
        
        // 尝试使用通用方法解析地址
        try {
          // 尝试识别脚本类型并使用payments API解析
          try {
            // 尝试作为P2PKH解析
            const p2pkh = bitcoin.payments.p2pkh({ output: output.script, network: BITCOIN_NETWORK });
            if (p2pkh.address) {
              type = 'P2PKH';
              address = p2pkh.address;
            }
          } catch (e) {}
          
          // 如果上面失败，尝试作为P2SH解析
          if (!address) {
            try {
              const p2sh = bitcoin.payments.p2sh({ output: output.script, network: BITCOIN_NETWORK });
              if (p2sh.address) {
                type = 'P2SH';
                address = p2sh.address;
              }
            } catch (e) {}
          }
          
          // 如果上面失败，尝试作为P2WPKH解析
          if (!address) {
            try {
              const p2wpkh = bitcoin.payments.p2wpkh({ output: output.script, network: BITCOIN_NETWORK });
              if (p2wpkh.address) {
                type = 'P2WPKH';
                address = p2wpkh.address;
              }
            } catch (e) {}
          }
          
          // 如果上面失败，尝试作为P2WSH解析
          if (!address) {
            try {
              const p2wsh = bitcoin.payments.p2wsh({ output: output.script, network: BITCOIN_NETWORK });
              if (p2wsh.address) {
                type = 'P2WSH';
                address = p2wsh.address;
              }
            } catch (e) {}
          }
          
          // 如果上面失败，尝试作为P2TR解析
          if (!address) {
            try {
              const p2tr = bitcoin.payments.p2tr({ output: output.script, network: BITCOIN_NETWORK });
              if (p2tr.address) {
                type = 'P2TR (Taproot)';
                address = p2tr.address;
              }
            } catch (e) {
              console.error('解析P2TR地址失败:', e);
            }
          }
          
          // 如果上面的方法没有解析出地址，尝试使用更通用的方法
          if (!address) {
            // 尝试作为P2PK（Pay to Public Key）解析
            const chunks = bitcoin.script.decompile(output.script);
            if (chunks && chunks.length === 2 && 
                Buffer.isBuffer(chunks[0]) && 
                chunks[0].length >= 33 && // 公钥至少33字节
                chunks[1] === bitcoin.opcodes.OP_CHECKSIG) {
              type = 'P2PK';
              // 从公钥创建P2PKH地址
              const pubkey = chunks[0];
              const p2pkh = bitcoin.payments.p2pkh({
                pubkey,
                network: BITCOIN_NETWORK
              });
              if (p2pkh.address) address = p2pkh.address + ' (从P2PK脚本派生)';
            }
            
            // 尝试作为OP_RETURN解析
            if (!address && chunks && chunks.length >= 2 && chunks[0] === bitcoin.opcodes.OP_RETURN) {
              type = 'OP_RETURN';
              address = '数据输出 (OP_RETURN)';
              
              // 尝试解析OP_RETURN数据
              if (chunks.length > 1 && Buffer.isBuffer(chunks[1])) {
                try {
                  const dataHex = chunks[1].toString('hex');
                  const dataUtf8 = chunks[1].toString('utf8').replace(/[^\x20-\x7E]/g, ''); // 只保留可打印ASCII字符
                  if (dataUtf8.length > 3) { // 如果有足够的可打印字符
                    address += ` - 数据: ${dataUtf8} (UTF8), ${dataHex} (HEX)`;
                  } else {
                    address += ` - 数据: ${dataHex} (HEX)`;
                  }
                } catch (e) {
                  address += ` - 数据: ${chunks[1].toString('hex')} (HEX)`;
                }
              }
            }
            
            // 尝试作为多签名脚本解析
            if (!address && chunks) {
              const multisigPattern = /^OP_(\d+) .*OP_CHECKMULTISIG$/;
              const scriptAsm = bitcoin.script.toASM(output.script);
              const multisigMatch = scriptAsm.match(multisigPattern);
              
              if (multisigMatch) {
                const m = parseInt(multisigMatch[1]);
                // 计算公钥数量 (n)
                let n = 0;
                for (const chunk of chunks) {
                  if (Buffer.isBuffer(chunk) && chunk.length >= 33) n++;
                }
                
                if (n > 0) {
                  type = `多签名 (${m}-of-${n})`;
                  address = `需要${m}个签名，共${n}个公钥`;
                }
              }
            }
          }
        } catch (e) {
          console.error('解析地址时出错:', e);
        }
        
        // 如果仍然无法解析地址，提供更多信息
        if (!address) {
          address = '无法解析地址';
          // 尝试提供脚本的十六进制表示，帮助调试
          const scriptHex = output.script.toString('hex');
          if (scriptHex.length <= 100) { // 限制长度，避免过长
            address += ` (脚本: ${scriptHex})`;
          } else {
            address += ` (脚本过长: ${scriptHex.substring(0, 50)}...)`;
          }
        }
        
        return {
          index,
          value: output.value / 100000000, // 转换为 BTC
          scriptPubKey,
          type,
          address, // 添加解析出的地址
        };
      } catch (e) {
        return {
          index,
          value: output.value / 100000000, // 转换为 BTC
          scriptPubKey: output.script.toString('hex'),
          type: '无法解析',
          address: '无法解析地址',
        };
      }
    });
    
    // 计算交易大小
    const size = tx.byteLength();
    const virtualSize = tx.virtualSize();
    const weight = tx.weight();
    
    return {
      txid,
      version: tx.version,
      locktime: tx.locktime,
      size,
      virtualSize,
      weight,
      inputs,
      outputs,
      hasWitnesses: tx.hasWitnesses(),
    };
  } catch (error) {
    console.error('解析比特币交易失败:', error);
    throw new Error(`解析比特币交易失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 解析以太坊交易
 */
async function parseEthTransaction(rawTransaction: string) {
  try {
    // 清理输入数据，移除可能的换行符和空格
    const cleanedTx = rawTransaction.trim().replace(/\s+/g, '');
    
    // 使用 ethers.js 解析交易
    const tx = ethers.Transaction.from(cleanedTx);
    
    return {
      hash: tx.hash,
      nonce: tx.nonce,
      from: tx.from || "未知",
      to: tx.to || "未知",
      value: tx.value.toString(),
      gasPrice: tx.gasPrice?.toString() || "0",
      gasLimit: tx.gasLimit.toString(),
      data: tx.data,
      chainId: tx.chainId,
      r: tx.signature?.r,
      s: tx.signature?.s,
      v: tx.signature?.v,
    };
  } catch (error) {
    console.error("解析以太坊交易失败:", error);
    throw new Error(`解析以太坊交易失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 解析 Solana 交易
 */
async function parseSolanaTransaction(rawTransaction: string) {
// 这里应该使用 Solana 相关的库进行解析
  const cleanedTx = rawTransaction.trim().replace(/\s+/g, '');
  try {
    const tx = Transaction.from(bs58.decode(cleanedTx));
    return tx;
  } catch(e) {
  const tx = VersionedTransaction.deserialize(bs58.decode(cleanedTx));
    return tx;
  }
}

/**
 * 解析 Cosmos 交易
 */
async function parseCosmosTransaction(rawTransaction: string) {
  // 这里应该使用 Cosmos 相关的库进行解析
  // 由于依赖较多，这里仍然使用模拟数据
  return {
    type: "cosmos-sdk/StdTx",
    value: {
      msg: [
        {
          type: "cosmos-sdk/MsgSend",
          value: {
            from_address: "cosmos1abcdefghijklmnopqrstuvwxyz0123456789",
            to_address: "cosmos19876543210zyxwvutsrqponmlkjihgfedcba",
            amount: [
              {
                denom: "uatom",
                amount: "1000000", // 1 ATOM
              },
            ],
          },
        },
      ],
      fee: {
        amount: [
          {
            denom: "uatom",
            amount: "5000", // 0.005 ATOM
          },
        ],
        gas: "200000",
      },
      signatures: [
        {
          pub_key: {
            type: "tendermint/PubKeySecp256k1",
            value: "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0",
          },
          signature:
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz",
        },
      ],
      memo: "交易备注",
    },
  };
}

/**
 * 根据交易哈希获取原始交易数据
 */
async function getTransactionByHash(rpcUrl: string, txHash: string) {
  try {
    if (!txHash) {
      throw new Error("缺少交易哈希");
    }

    // 创建 provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // 获取交易信息
    const tx = await provider.getTransaction(txHash);
    
    if (!tx) {
      throw new Error("找不到该交易");
    }
    
    // 获取交易收据
    const receipt = await provider.getTransactionReceipt(txHash);
    
    // 直接使用 RPC 调用获取原始交易
    const rawTx = await provider.send("eth_getTransactionByHash", [txHash]);
    
    // 返回交易信息和原始数据
    return {
      transaction: {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        gasPrice: tx.gasPrice?.toString() || "0",
        gasLimit: tx.gasLimit.toString(),
        nonce: tx.nonce,
        data: tx.data,
        chainId: tx.chainId,
        status: receipt?.status === 1 ? "成功" : "失败",
        gasUsed: receipt?.gasUsed.toString() || "0",
        blockNumber: tx.blockNumber,
        blockHash: tx.blockHash,
      },
      rawTransaction: rawTx,
    };
  } catch (error) {
    console.error("获取交易原始数据失败:", error);
    throw new Error(`获取交易原始数据失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}
