import React from "react";
import { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { EvmTools } from "@/components/evm-tools";

export const metadata: Metadata = {
  title: "TxTool - EVM工具",
  description: "与EVM兼容链交互的实用工具集，包括查询余额、获取链ID、Gas价格等功能",
  keywords: "EVM工具, 以太坊, 查询余额, 代币余额, 链ID, Gas价格, 广播交易",
};

export default function EvmToolsPage() {
  return (
    <PageLayout>
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-2">
          EVM工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          与EVM兼容链交互的实用工具集，输入RPC URL后即可使用各种功能。
        </p>
      </section>
      
      <EvmTools />
    </PageLayout>
  );
}