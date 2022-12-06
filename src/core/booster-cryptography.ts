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
      if (e.kind == "event") {
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
            } else {
              console.log(`Could not encrypt ${prop} from event ${e.typeName}`)
            }

            console.log(`Encryption was successful, assigning encrypted value to property ${prop}`)
          }
        }
      }
      console.log(`Event envelope modified: ${inspect(e, false, 2, true)}`)
      encryptedEventEnvelopes.push(e)
    }
    return encryptedEventEnvelopes
  }

  public static async decryptEvents(readModel: ReadModelInterface, readModelName: string, boosterConfig: any, azureCryptographyClient: AzureCryptographyClient): Promise<ReadModelInterface> {
    console.log("Decrypting read model...")
    const propertiesToBeDecrypted: Array<string> = boosterConfig.toDecrypt[readModelName]

    if (propertiesToBeDecrypted) {
      console.log(`Decrypting properties ${propertiesToBeDecrypted} from ${readModelName}: ${readModel.id}`)
      const keyName = readModel.id.toString();
      for (let i = 0; i < propertiesToBeDecrypted.length; i++) {
        const prop = propertiesToBeDecrypted[i]
        const value = readModel[prop];
        console.log(`Calling encryption client to decrypt property ${prop} with value ${value}`)
        const decryptedValue = await azureCryptographyClient.decrypt(keyName, value)
        console.log(`Decrypted value from read model ${readModelName} is ${decryptedValue}`)
        if (decryptedValue) {
          readModel[prop] = new TextDecoder("utf-8").decode(decryptedValue.result);
          console.log(`Read model modified: ${inspect(readModel, false, 3, true)}`)
        } else {
          throw new Error(`Could not decrypt property ${prop} from ${readModelName}`)
        }
      }
    }
    return readModel
  }
}

