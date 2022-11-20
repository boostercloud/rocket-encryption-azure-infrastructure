import {CryptographyClient, KeyVaultKey, EncryptResult, DecryptResult, KeyClient} from "@azure/keyvault-keys";
import {BoosterConfig} from "@boostercloud/framework-types";
import {DefaultAzureCredential} from "@azure/identity";

export class AzureCryptographyClient {
  private readonly RSA1_5 = "RSA1_5";
  public readonly azureKeyClient: KeyClient
  public readonly azureCredential: DefaultAzureCredential

  public constructor(readonly config: BoosterConfig) {
    // TODO: How does this work? How can I configure the credentials?
    this.azureCredential = new DefaultAzureCredential();
    const url = `https://${config.appName}.vault.azure.net`;
    this.azureKeyClient = new KeyClient(url, this.azureCredential);
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
      algorithm: this.RSA1_5,
      plaintext: Buffer.from(value),
    })
  }

  public async decrypt(keyName: string, encryptedValue: string): Promise<DecryptResult> {
    return this.findKey(keyName).then(key => {
      const cryptographyClient = new CryptographyClient(key, this.azureCredential)
      return cryptographyClient.decrypt({
        algorithm: this.RSA1_5,
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
