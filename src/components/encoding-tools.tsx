"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNotification } from "@/components/ui/notification";

export const EncodingTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState("base58");
  const { showSuccess, showError } = useNotification();

  // Base58 <-> Hex
  const [base58Input, setBase58Input] = useState("");
  const [hexOutput, setHexOutput] = useState("");

  // Base64 <-> Hex
  const [base64Input, setBase64Input] = useState("");
  const [base64HexOutput, setBase64HexOutput] = useState("");

  // 时间戳 <-> 日期
  const [timestamp, setTimestamp] = useState("");
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    // 初始化日期时间输入框
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    
    setDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, []);

  // Base58 -> Hex
  const handleBase58ToHex = async () => {
    try {
      if (!base58Input.trim()) {
        showError("请输入Base58编码");
        return;
      }

      const response = await fetch("/api/encoding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "base58-to-hex",
          input: base58Input,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "转换请求失败");
      }

      const data = await response.json();
      setHexOutput(data.result);
      showSuccess("转换成功");
    } catch (error) {
      showError(`转换失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Hex -> Base58
  const handleHexToBase58 = async () => {
    try {
      if (!hexOutput.trim()) {
        showError("请输入Hex编码");
        return;
      }

      const response = await fetch("/api/encoding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "hex-to-base58",
          input: hexOutput,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "转换请求失败");
      }

      const data = await response.json();
      setBase58Input(data.result);
      showSuccess("转换成功");
    } catch (error) {
      showError(`转换失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Base64 -> Hex
  const handleBase64ToHex = async () => {
    try {
      if (!base64Input.trim()) {
        showError("请输入Base64编码");
        return;
      }

      const response = await fetch("/api/encoding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "base64-to-hex",
          input: base64Input,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "转换请求失败");
      }

      const data = await response.json();
      setBase64HexOutput(data.result);
      showSuccess("转换成功");
    } catch (error) {
      showError(`转换失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Hex -> Base64
  const handleHexToBase64 = async () => {
    try {
      if (!base64HexOutput.trim()) {
        showError("请输入Hex编码");
        return;
      }

      const response = await fetch("/api/encoding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "hex-to-base64",
          input: base64HexOutput,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "转换请求失败");
      }

      const data = await response.json();
      setBase64Input(data.result);
      showSuccess("转换成功");
    } catch (error) {
      showError(`转换失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // 使用当前时间
  const handleUseCurrentTime = async () => {
    try {
      const response = await fetch("/api/encoding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "current-timestamp",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "获取时间戳失败");
      }

      const data = await response.json();
      setTimestamp(data.result);
    } catch (error) {
      showError(`获取当前时间戳失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // 时间戳 -> 日期
  const handleTimestampToDate = async () => {
    try {
      if (!timestamp.trim()) {
        showError("请输入时间戳");
        return;
      }

      const response = await fetch("/api/encoding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "timestamp-to-date",
          input: timestamp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "转换请求失败");
      }

      const data = await response.json();
      setDateTime(data.result);
      showSuccess("转换成功");
    } catch (error) {
      showError(`转换失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // 日期 -> 时间戳
  const handleDateToTimestamp = async () => {
    try {
      if (!dateTime) {
        showError("请选择日期时间");
        return;
      }

      const response = await fetch("/api/encoding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "date-to-timestamp",
          input: dateTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "转换请求失败");
      }

      const data = await response.json();
      setTimestamp(data.result);
      showSuccess("转换成功");
    } catch (error) {
      showError(`转换失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs
          defaultValue="base58"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList>
            <TabsTrigger value="base58">Base58 ⟷ Hex</TabsTrigger>
            <TabsTrigger value="base64">Base64 ⟷ Hex</TabsTrigger>
            <TabsTrigger value="timestamp">时间戳转换</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="base58">
              <div className="space-y-6">
                <Textarea
                  label="Base58"
                  placeholder="输入Base58编码..."
                  value={base58Input}
                  onChange={(e) => setBase58Input(e.target.value)}
                />

                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={handleBase58ToHex}
                    variant="secondary"
                    className="flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M12 5v14"></path>
                      <path d="m19 12-7 7-7-7"></path>
                    </svg>
                    转换为Hex
                  </Button>
                  <Button
                    onClick={handleHexToBase58}
                    variant="secondary"
                    className="flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M12 19V5"></path>
                      <path d="m5 12 7-7 7 7"></path>
                    </svg>
                    转换为Base58
                  </Button>
                </div>

                <Textarea
                  label="Hex"
                  placeholder="Hex结果..."
                  value={hexOutput}
                  onChange={(e) => setHexOutput(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="base64">
              <div className="space-y-6">
                <Textarea
                  label="Base64"
                  placeholder="输入Base64编码..."
                  value={base64Input}
                  onChange={(e) => setBase64Input(e.target.value)}
                />

                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={handleBase64ToHex}
                    variant="secondary"
                    className="flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M12 5v14"></path>
                      <path d="m19 12-7 7-7-7"></path>
                    </svg>
                    转换为Hex
                  </Button>
                  <Button
                    onClick={handleHexToBase64}
                    variant="secondary"
                    className="flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M12 19V5"></path>
                      <path d="m5 12 7-7 7 7"></path>
                    </svg>
                    转换为Base64
                  </Button>
                </div>

                <Textarea
                  label="Hex"
                  placeholder="Hex结果..."
                  value={base64HexOutput}
                  onChange={(e) => setBase64HexOutput(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="timestamp">
              <div className="space-y-6">
                <div className="flex items-end space-x-4">
                  <div className="flex-1">
                    <Input
                      label="时间戳"
                      type="number"
                      placeholder="输入Unix时间戳..."
                      value={timestamp}
                      onChange={(e) => setTimestamp(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleUseCurrentTime}
                    variant="text"
                    className="mb-1"
                  >
                    使用当前时间
                  </Button>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={handleTimestampToDate}
                    variant="secondary"
                    className="flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M12 5v14"></path>
                      <path d="m19 12-7 7-7-7"></path>
                    </svg>
                    转换为日期
                  </Button>
                  <Button
                    onClick={handleDateToTimestamp}
                    variant="secondary"
                    className="flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M12 19V5"></path>
                      <path d="m5 12 7-7 7 7"></path>
                    </svg>
                    转换为时间戳
                  </Button>
                </div>

                <Input
                  label="日期时间"
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

