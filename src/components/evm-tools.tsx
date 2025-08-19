"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNotification } from "@/components/ui/notification";
import { copyToClipboard } from "@/lib/utils";

export const EvmTools: React.FC = () => {
  const [rpcUrl, setRpcUrl] = useState("");
  const [activeTab, setActiveTab] = useState("balance");
  const [address, setAddress] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [txHash, setTxHash] = useState("");
  const [rawTx, setRawTx] = useState("");
  const [calldata, setCalldata] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [ethValue, setEthValue] = useState("");
  const [gasData, setGasData] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const handleAction = async () => {
    // calldata 解析不需要 RPC URL
    if (activeTab !== "parse-calldata" && !rpcUrl.trim()) {
      showError("请输入RPC URL");
      return;
    }

    setIsLoading(true);
    setResult("正在处理...");

    try {
      // 根据当前选中的标签页，准备请求参数
      const requestData: any = {
        action: activeTab,
        rpcUrl,
      };

      // 根据不同的操作类型，添加不同的参数
      switch (activeTab) {
        case "balance":
          if (!address.trim()) {
            throw new Error("请输入钱包地址");
          }
          requestData.address = address;
          break;

        case "token-balance":
          if (!address.trim()) {
            throw new Error("请输入钱包地址");
          }
          if (!tokenAddress.trim()) {
            throw new Error("请输入代币合约地址");
          }
          requestData.address = address;
          requestData.tokenAddress = tokenAddress;
          break;

        case "broadcast":
          if (!rawTx.trim()) {
            throw new Error("请输入原始交易数据");
          }
          requestData.rawTx = rawTx;
          break;

        case "tx-info":
          if (!txHash.trim()) {
            throw new Error("请输入交易哈希");
          }
          requestData.txHash = txHash;
          break;

        case "parse-calldata":
          if (!calldata.trim()) {
            throw new Error("请输入 calldata");
          }
          // calldata 解析不需要 RPC URL
          const parseResponse = await fetch("/api/evm", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "parse-calldata",
              calldata: calldata,
              rpcUrl: "dummy" // 不会被使用，但 API 需要这个字段
            }),
          });
          
          if (!parseResponse.ok) {
            const errorData = await parseResponse.json();
            throw new Error(errorData.error || "请求失败");
          }
          
          const parseData = await parseResponse.json();
          setResult(JSON.stringify(parseData, null, 2));
          showSuccess("Calldata 解析成功");
          setIsLoading(false);
          return;

        case "estimate-gas":
          if (!fromAddress.trim()) {
            throw new Error("请输入发送方地址");
          }
          if (!toAddress.trim()) {
            throw new Error("请输入接收方地址");
          }
          requestData.action = "estimate-gas";
          requestData.fromAddress = fromAddress;
          requestData.toAddress = toAddress;
          requestData.value = ethValue;
          requestData.data = gasData;
          break;
          
        case "raw-tx":
          if (!txHash.trim()) {
            throw new Error("请输入交易哈希");
          }
          // 使用交易API获取原始交易数据
          const response = await fetch("/api/transaction", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "get-raw-tx",
              rpcUrl,
              txHash,
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "请求失败");
          }
          
          const data = await response.json();
          setResult(JSON.stringify(data, null, 2));
          showSuccess("获取原始交易数据成功");
          setIsLoading(false);
          return;
      }

      // 调用 API
      const response = await fetch("/api/evm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "请求失败");
      }

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      showSuccess("操作成功");
    } catch (error) {
      console.error("操作失败:", error);
      setResult(`错误: ${error instanceof Error ? error.message : String(error)}`);
      showError("操作失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;

    const success = await copyToClipboard(result);
    if (success) {
      showSuccess("已复制到剪贴板");
    } else {
      showError("复制失败");
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="pt-6">
          <Input
            label="RPC URL"
            placeholder="输入RPC URL，例如：https://mainnet.infura.io/v3/your-api-key"
            value={rpcUrl}
            onChange={(e) => setRpcUrl(e.target.value)}
          />

          <Tabs
            defaultValue="balance"
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              setResult("");
            }}
            className="mt-4"
          >
          <TabsList>
            <TabsTrigger value="balance">查询余额</TabsTrigger>
            <TabsTrigger value="token-balance">Token余额</TabsTrigger>
            <TabsTrigger value="chain-id">链ID</TabsTrigger>
            <TabsTrigger value="gas-price">Gas价格</TabsTrigger>
            <TabsTrigger value="broadcast">广播交易</TabsTrigger>
            <TabsTrigger value="tx-info">交易信息</TabsTrigger>
            <TabsTrigger value="raw-tx">获取原始交易</TabsTrigger>
            <TabsTrigger value="parse-calldata">Calldata解析</TabsTrigger>
            <TabsTrigger value="estimate-gas">手续费估算</TabsTrigger>
          </TabsList>

            <div className="mt-4">
              <TabsContent value="balance">
                <Input
                  label="钱包地址"
                  placeholder="输入钱包地址"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </TabsContent>

              <TabsContent value="token-balance">
                <Input
                  label="钱包地址"
                  placeholder="输入钱包地址"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mb-4"
                />
                <Input
                  label="代币合约地址"
                  placeholder="输入代币合约地址"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                />
              </TabsContent>

              <TabsContent value="chain-id">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  点击下方按钮获取当前RPC URL对应的链ID
                </p>
              </TabsContent>

              <TabsContent value="gas-price">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  点击下方按钮获取当前RPC URL对应的Gas价格
                </p>
              </TabsContent>

              <TabsContent value="broadcast">
                <Textarea
                  label="原始交易数据"
                  placeholder="输入已签名的原始交易数据..."
                  value={rawTx}
                  onChange={(e) => setRawTx(e.target.value)}
                  className="min-h-[120px]"
                />
              </TabsContent>

              <TabsContent value="tx-info">
                <Input
                  label="交易哈希"
                  placeholder="输入交易哈希"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                />
              </TabsContent>

              <TabsContent value="raw-tx">
                <Input
                  label="交易哈希"
                  placeholder="输入交易哈希，获取对应的原始交易数据"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                />
              </TabsContent>

              <TabsContent value="parse-calldata">
                <Textarea
                  label="Calldata"
                  placeholder="输入 EVM calldata (例如: 0xa9059cbb000000000000000000000000...)"
                  value={calldata}
                  onChange={(e) => setCalldata(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>支持解析常见的 DeFi 操作:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>ERC20: transfer, approve, transferFrom</li>
                    <li>Uniswap V2/V3: swap 相关函数</li>
                    <li>1inch: 聚合交换函数</li>
                    <li>通用: execute, multicall 等</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="estimate-gas">
                <Input
                  label="发送方地址"
                  placeholder="输入发送方钱包地址"
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  className="mb-4"
                />
                <Input
                  label="接收方地址"
                  placeholder="输入接收方地址或合约地址"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  className="mb-4"
                />
                <Input
                  label="交易金额 (ETH)"
                  placeholder="输入要发送的 ETH 数量（可选）"
                  value={ethValue}
                  onChange={(e) => setEthValue(e.target.value)}
                  className="mb-4"
                />
                <Textarea
                  label="Calldata (可选)"
                  placeholder="输入交易的 calldata（可选，用于合约调用）"
                  value={gasData}
                  onChange={(e) => setGasData(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>估算交易所需的 Gas 和手续费:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>普通转账: 只需要发送方和接收方地址</li>
                    <li>合约调用: 需要提供 calldata 数据</li>
                    <li>支持 EIP-1559 和传统 Gas 价格模式</li>
                    <li>提供不同速度的手续费选项</li>
                  </ul>
                </div>
              </TabsContent>
            </div>

            <div className="mt-4">
              <Button
                onClick={handleAction}
                isLoading={isLoading}
                disabled={isLoading || (activeTab !== "parse-calldata" && !rpcUrl.trim())}
                className="w-full"
              >
                {getButtonText(activeTab)}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>查询结果</CardTitle>
            <Button variant="icon" onClick={handleCopy} disabled={!result}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="json-result">{result || "// 查询结果将显示在这里"}</pre>
        </CardContent>
      </Card>
    </div>
  );
};

function getButtonText(tab: string): string {
  switch (tab) {
    case "balance":
      return "查询余额";
    case "token-balance":
      return "查询代币余额";
    case "chain-id":
      return "获取链ID";
    case "gas-price":
      return "获取Gas价格";
    case "broadcast":
      return "广播交易";
    case "tx-info":
      return "获取交易信息";
    case "raw-tx":
      return "获取原始交易数据";
    case "parse-calldata":
      return "解析 Calldata";
    case "estimate-gas":
      return "估算手续费";
    default:
      return "执行";
  }
}
