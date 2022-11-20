// TODO: Is this necessary?
export interface Encrypted {
  cryptographicKey: string,
  value: string
}

export interface Decrypted {
  cryptographicKey: string,
  encryptedValue: string
}