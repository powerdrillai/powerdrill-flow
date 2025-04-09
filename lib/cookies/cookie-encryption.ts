import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// Use environment variable to store encryption key, or use a fixed key if not set
// For AES-256-GCM, we need a 32-byte key (64 hex characters)
const ENCRYPTION_KEY =
  process.env.COOKIE_ENCRYPTION_KEY ||
  "d4c74594d841139328695756648b6bd6d4c74594d841139328695756648b6bd6";
const ALGORITHM = "aes-256-gcm";

// Encrypt data
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

  // Store IV and authentication tag along with the encrypted data
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encryptedData}`;
}

// Decrypt data
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
