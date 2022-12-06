export interface EncryptionRocketConfiguration {
  skuName: string,
  tenantId: string,
  algorithm: "RSA1_5" | "RSA-OAEP" | "RSA-OAEP-256"
}
