import React from "react";
import { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { EncodingTools } from "@/components/encoding-tools";

export const metadata: Metadata = {
  title: "TxTool - 编码工具",
  description: "常用编码转换工具，包括Base58与Hex转换、Base64与Hex转换、时间戳转换等功能",
  keywords: "编码工具, Base58, Base64, Hex, 时间戳转换, 区块链工具",
};

export default function EncodingToolsPage() {
  return (
    <PageLayout>
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-2">
          编码工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          常用编码转换工具，帮助您快速进行各种编码格式之间的转换。
        </p>
      </section>
      
      <EncodingTools />
    </PageLayout>
  );
}