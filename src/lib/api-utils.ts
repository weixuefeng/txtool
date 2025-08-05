/**
 * 处理对象中的 BigInt 值，将其转换为字符串
 * 这样可以安全地进行 JSON 序列化
 */
export function handleBigInt<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString() as unknown as T;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(handleBigInt) as unknown as T;
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj as Record<string, any>)) {
    result[key] = handleBigInt(value);
  }

  return result as T;
}