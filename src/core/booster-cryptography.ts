import {EventEnvelope} from "@boostercloud/framework-types/dist/envelope";
import {ReadModelInterface} from "@boostercloud/framework-types/dist/concepts";
import {AzureCryptographyClient} from "../clients";
import {inspect} from "util";

export class BoosterCryptography {

  public static async encryptEvents(eventEnvelopes: Array<EventEnvelope>, boosterConfig: any, azureCryptographyClient: AzureCryptographyClient): Promise<Array<EventEnvelope>> {
    console.log("Encrypting events...")
    const encryptedEventEnvelopes = []
    for (let j = 0; j < eventEnvelopes.length; j++) {
      const e = eventEnvelopes[j]
      console.log("encryptEvents - Inside map")
      if (e.kind == "event") {
        console.log("encryptEvents - Inside event filter")
        const propertiesToBeEncrypted: Array<string> = boosterConfig.toEncrypt[e.typeName]
        console.log(`Encrypting properties ${propertiesToBeEncrypted} from ${e.typeName}`)
        if (propertiesToBeEncrypted) {
          console.log(`Found properties to encrypt for ${e.typeName}. Encrypting...`)
          const keyName = e.entityID.toString();
          for (let i = 0; i < propertiesToBeEncrypted.length; i++) {
            const prop = propertiesToBeEncrypted[i]
            console.log(`Prop ${prop}`)
            const value = (e.value as any)[prop];
            console.log(`Calling encrypt client to encrypt property ${prop} with value ${value} and key name ${keyName}`);
            const encryptedValue = await azureCryptographyClient.encrypt(keyName, value)
            if (encryptedValue) {
              (e.value as any)[prop] = encryptedValue.result
            }

            console.log(`Encryption was successful, assigning encrypted value to property ${prop}`)
            console.log(`Event envelope 1: ${inspect(e, false, 2, true)}`)
          }
          console.log(`Event envelope 2: ${inspect(e, false, 2, true)}`)
        }
      }
      console.log(`Event envelope 3: ${inspect(e, false, 2, true)}`)
      encryptedEventEnvelopes.push(e)
    }
    return encryptedEventEnvelopes
  }

  public static decryptEvents(readModel: ReadModelInterface, readModelName: string, boosterConfig: any, azureCryptographyClient: AzureCryptographyClient): ReadModelInterface {
    console.log("Decrypting read model...")
    const propertiesToBeDecrypted: Array<string> = boosterConfig.toDecrypt[readModelName]

    if (propertiesToBeDecrypted) {
      console.log(`Decrypting properties ${propertiesToBeDecrypted} from ${readModelName}`)
      const keyName = readModel.entityID.toString();
      propertiesToBeDecrypted.map((prop: string) => {
        const value = readModel[prop];
        console.log(`Calling encrypt client to encrypt property ${prop} with value ${value}`)
        azureCryptographyClient.decrypt(keyName, value).then(dr => {
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

