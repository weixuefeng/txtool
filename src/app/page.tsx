import React from "react";
import { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { TransactionParser } from "@/components/transaction-parser";

export const metadata: Metadata = {
  title: "TxTool - 区块链交易解析工具",
  description: "解析各种区块链的原始交易数据，支持BTC、ETH、Solana、Cosmos等多种区块链",
  keywords: "区块链交易解析, 比特币交易, 以太坊交易, Solana交易, Cosmos交易",
};

export default function HomePage() {
  return (
    <PageLayout>
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-2">
          区块链交易解析工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          选择区块链网络，输入原始交易数据，快速解析交易详情。支持BTC、ETH、Solana、Cosmos等多种区块链。
        </p>
      </section>
      
      <TransactionParser />
    </PageLayout>
  );
}