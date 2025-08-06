"use client";

import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} TxTool.fun - 区块链交易工具
            </p>
          </div>
          <div className="flex space-x-6">
            <Link
              href="https://github.com/weixuefeng/txtool/issues"
              className="text-primary dark:text-primary-light hover:underline"
            >
              关于我们
            </Link>
            <Link
              href="https://github.com/weixuefeng/txtool/issues"
              className="text-primary dark:text-primary-light hover:underline"
            >
              隐私政策
            </Link>
            <Link
              href="https://github.com/weixuefeng/txtool/issues"
              className="text-primary dark:text-primary-light hover:underline"
            >
              联系我们
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};