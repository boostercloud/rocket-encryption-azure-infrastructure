import {
  CryptographyClient,
  KeyVaultKey,
  EncryptResult,
  DecryptResult,
  KeyClient,
  RsaEncryptionAlgorithm
} from "@azure/keyvault-keys";
import {BoosterConfig} from "@boostercloud/framework-types";
import {DefaultAzureCredential} from "@azure/identity";

export class AzureCryptographyClient {
  private readonly algorithm;
  public readonly azureKeyClient: KeyClient
  public readonly azureCredential: DefaultAzureCredential

  public constructor(readonly boosterConfig: BoosterConfig, algorithm: RsaEncryptionAlgorithm) {
    this.azureCredential = new DefaultAzureCredential();
    const url = `https://${boosterConfig.appName}${boosterConfig.environmentName}kv.vault.azure.net`;
    this.azureKeyClient = new KeyClient(url, this.azureCredential);
    this.algorithm = algorithm ?? "RSA1_5"
  }

  public async encrypt(keyName: string, value: string): Promise<EncryptResult> {
    return await this.findKey(keyName).then(key => {
      return this.encryptWithKey(key, value);
    }).catch(e => {
      console.log("=== ERROR ===", e)
      console.log(`Could not find a key with keyName ${keyName}. Creating one`)
      return this.createKey(keyName).then(key => {
        console.log(`Assigning key ${key.id} to cryptographyClient`)
        return this.encryptWithKey(key, value);
      })
    })
  }

  private async encryptWithKey(key: KeyVaultKey, value: string): Promise<EncryptResult> {
    const cryptographyClient = new CryptographyClient(key, this.azureCredential)
    return await cryptographyClient.encrypt({
      algorithm: this.algorithm,
      plaintext: Buffer.from(value),
    })
  }

  public async decrypt(keyName: string, encryptedValue: string): Promise<DecryptResult> {
    return this.findKey(keyName).then(key => {
      const cryptographyClient = new CryptographyClient(key, this.azureCredential)
      return cryptographyClient.decrypt({
        algorithm: this.algorithm,
        ciphertext: Buffer.from(encryptedValue),
      });
    })
  }

  private async createKey(keyName: string): Promise<KeyVaultKey> {
    console.log(`Creating key with keyname ${keyName}`)
    return await this.azureKeyClient.createKey(keyName, "RSA")
  }

  private async findKey(keyName: string): Promise<KeyVaultKey> {
    console.log(`Finding key with key name ${keyName}`)
    return await this.azureKeyClient.getKey(keyName)
  }
}
