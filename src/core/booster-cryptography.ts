import {EventEnvelope} from "@boostercloud/framework-types/dist/envelope";
import {ReadModelInterface} from "@boostercloud/framework-types/dist/concepts";
import {BoosterConfig} from "@boostercloud/framework-types";
import {AzureCryptographyClient} from "../clients";

export class BoosterCryptography {

  private static azureCryptographyClient = new AzureCryptographyClient(BoosterConfig.prototype);

  public static encryptEvents(eventEnvelopes: Array<EventEnvelope>, config: any): Array<EventEnvelope> {
    return eventEnvelopes
      .map((e: EventEnvelope): EventEnvelope => {
        if (e.kind == "event") {
          const propertiesToBeEncrypted: Array<string> = config.toEncrypt[e.typeName]
          console.log(`Encrypting properties ${propertiesToBeEncrypted} from ${e.typeName}`)
          if (propertiesToBeEncrypted) {
            console.log(`Found properties to encrypt for ${e.typeName}. Encrypting...`)
            const keyName = e.entityID.toString();
            propertiesToBeEncrypted.map((prop: string) => {
              const value = (e.value as any)[prop];
              console.log(`Calling encrypt client to encrypt property ${prop} with value ${value}`)
              this.azureCryptographyClient.encrypt(keyName, value)
                .then(er => {
                  (e.value as any)[prop] = er.result
                  console.log(`Encryption was successful, assigning encrypted value to property ${prop}`)
                }).catch(error => {
                  console.error(`An error was found when encrypting ${prop} property from event ${e.typeName}. Error: ${error}`)
              })
            })
          }
        }
        return e;
      })
  }

  public static decryptEvents(readModel: ReadModelInterface, readModelName: string, config: any): ReadModelInterface {
    const propertiesToBeDecrypted: Array<string> = config.toDecrypt[readModelName]

    if (propertiesToBeDecrypted) {
      console.log(`Decrypting properties ${propertiesToBeDecrypted} from ${readModelName}`)
      const keyName = readModel.entityID.toString();
      propertiesToBeDecrypted.map((prop: string) => {
        const value = readModel[prop];
        console.log(`Calling encrypt client to encrypt property ${prop} with value ${value}`)
        this.azureCryptographyClient.decrypt(keyName, value).then(dr => {
          readModel[prop] = new TextDecoder("utf-8").decode(dr.result);
          console.log(`Decryption was successful, assigning decrypted value to property ${prop}`)
        }).catch(error => {
          console.error(`An error was found when decrypting ${prop} property from read model ${readModel}. Error: ${error}`)
        })
      })
    }
    return readModel
  }
}
