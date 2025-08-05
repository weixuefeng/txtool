"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/ui/notification";
import { copyToClipboard } from "@/lib/utils";

const blockchainOptions = [
  { value: "btc", label: "Bitcoin (BTC)" },
  { value: "eth", label: "Ethereum (ETH)" },
  { value: "solana", label: "Solana (SOL)" },
  { value: "cosmos", label: "Cosmos (ATOM)" },
];

export const TransactionParser: React.FC = () => {
  const [blockchain, setBlockchain] = useState("btc");
  const [rawTransaction, setRawTransaction] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const handleParse = async () => {
    if (!rawTransaction.trim()) {
      showError("请输入原始交易数据");
      return;
    }

    setIsLoading(true);
    setResult("正在解析...");

    try {
      // 调用 API 进行解析
      const response = await fetch("/api/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blockchain,
          rawTransaction,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "解析请求失败");
      }

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      showSuccess("交易解析成功");
    } catch (error) {
      console.error("解析交易失败:", error);
      setResult(`解析错误: ${error instanceof Error ? error.message : String(error)}`);
      showError("交易解析失败");
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
          <Select
            label="选择区块链"
            options={blockchainOptions}
            value={blockchain}
            onChange={(e) => setBlockchain(e.target.value)}
          />
          
          <Textarea
            label="原始交易数据"
            placeholder="请输入原始交易数据..."
            value={rawTransaction}
            onChange={(e) => setRawTransaction(e.target.value)}
            className="min-h-[150px]"
          />
          
          <div className="mt-4">
            <Button
              onClick={handleParse}
              isLoading={isLoading}
              disabled={isLoading || !rawTransaction.trim()}
              className="w-full"
            >
              解析交易
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>解析结果</CardTitle>
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
          <pre className="json-result">{result || "// 解析结果将显示在这里"}</pre>
        </CardContent>
      </Card>
    </div>
  );
};

