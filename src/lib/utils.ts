import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名
 * @param inputs 类名数组
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化数字为带千位分隔符的字符串
 * @param number 要格式化的数字
 * @param decimals 小数位数
 * @returns 格式化后的字符串
 */
export function formatNumber(number: number, decimals = 2) {
  return number.toLocaleString("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 截断长字符串并在中间添加省略号
 * @param str 原始字符串
 * @param startChars 开头保留的字符数
 * @param endChars 结尾保留的字符数
 * @returns 截断后的字符串
 */
export function truncateMiddle(str: string, startChars = 6, endChars = 4) {
  if (!str) return "";
  if (str.length <= startChars + endChars) return str;

  return `${str.substring(0, startChars)}...${str.substring(
    str.length - endChars
  )}`;
}

/**
 * 格式化日期时间
 * @param date 日期对象
 * @param includeTime 是否包含时间
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(date: Date, includeTime = true) {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  let result = `${year}-${month}-${day}`;

  if (includeTime) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    result += ` ${hours}:${minutes}:${seconds}`;
  }

  return result;
}

/**
 * 格式化日期用于datetime-local输入
 * @param date 日期对象
 * @returns 格式化后的日期字符串
 */
export function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns 是否复制成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 确保只在客户端环境中执行
  if (typeof window === "undefined") {
    return false;
  }
  
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // 回退方法
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  } catch (error) {
    console.error("复制到剪贴板失败:", error);
    return false;
  }
}
