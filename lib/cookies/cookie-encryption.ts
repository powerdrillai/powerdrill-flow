import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// 使用环境变量存储加密密钥，如果未设置则生成一个固定的密钥
const ENCRYPTION_KEY =
  process.env.COOKIE_ENCRYPTION_KEY || "d4c74594d841139328695756648b6bd6";
const ALGORITHM = "aes-256-gcm";

// 加密数据
export function encryptData(data: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );

  let encryptedData = cipher.update(data, "utf8", "hex");
  encryptedData += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // 将IV和认证标签与加密数据一起存储
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encryptedData}`;
}

// 解密数据
export function decryptData(encryptedValue: string): string {
  try {
    const [ivHex, authTagHex, encryptedData] = encryptedValue.split(":");

    if (!ivHex || !authTagHex || !encryptedData) {
      throw new Error("Invalid encrypted value format");
    }

    const decipher = createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, "hex"),
      Buffer.from(ivHex, "hex")
    );

    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    let decryptedData = decipher.update(encryptedData, "hex", "utf8");
    decryptedData += decipher.final("utf8");

    return decryptedData;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}
