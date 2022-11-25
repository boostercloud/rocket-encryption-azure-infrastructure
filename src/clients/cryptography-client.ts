import {CryptographyClient, KeyVaultKey, EncryptResult, DecryptResult, KeyClient} from "@azure/keyvault-keys";
import {BoosterConfig} from "@boostercloud/framework-types";
import {DefaultAzureCredential} from "@azure/identity";
import {EncryptionRocketConfiguration} from "../types";

export class AzureCryptographyClient {
  private readonly algorithm;
  public readonly azureKeyClient: KeyClient
  public readonly azureCredential: DefaultAzureCredential

  public constructor(readonly boosterConfig: BoosterConfig, rocketConfiguration: EncryptionRocketConfiguration) {
    // TODO: How does this work? How can I configure the credentials?
    this.azureCredential = new DefaultAzureCredential();
    const url = `https://${boosterConfig.appName}${boosterConfig.environmentName}kv.vault.azure.net`;
    this.azureKeyClient = new KeyClient(url, this.azureCredential);
    this.algorithm = rocketConfiguration.algorithm ?? "RSA1_5"
  }

  public async encrypt(keyName: string, value: string): Promise<EncryptResult> {
    let cryptographyClient = {} as CryptographyClient
    this.findKey(keyName).then(key => {
      cryptographyClient = new CryptographyClient(key, this.azureCredential)
    }).catch(e => {
      console.log("=== ERROR === ", e)
      console.log(`Could not find a key with keyName ${keyName}. Creating one`)
      this.createKey(keyName).then(key => {
        cryptographyClient = new CryptographyClient(key, this.azureCredential)
      })
    })

    if (!cryptographyClient) {
      throw new Error(`Could not set cryptography client for key name ${keyName}`)
    }

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
    }).catch(e => {
      throw new Error(e)
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
