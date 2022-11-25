import {BoosterConfig, RocketDescriptor} from "@boostercloud/framework-types"
import {EncryptionRocketConfiguration} from "./types";
import {AzureCryptographyClient} from "./clients";
import {EventEnvelope} from "@boostercloud/framework-types/dist/envelope";
import {BoosterCryptography} from "./core";
import {ReadModelInterface} from "@boostercloud/framework-types/dist/concepts";
import {inspect} from "util";

export class EncryptionRocket {
  public constructor(readonly config: BoosterConfig, readonly rocketConfiguration: EncryptionRocketConfiguration) {
    config.registerRocketFunction("encryption-rocket", async (config: BoosterConfig, request: unknown) => {
      console.log("Registering rocket")
    })
    const azureCryptographyClient = new AzureCryptographyClient(config, rocketConfiguration)
    console.log(`BEFORE == BoosterConfig events provider functions are ${inspect(config.provider.events.store, false, 3, true)}`)
    console.log(`BEFORE == BoosterConfig read model provider functions are ${inspect(config.provider.readModels.store, false, 3, true)}`)
    this.overrideEventStoreProviderFunction(config, azureCryptographyClient)
    this.overrideReadModelStoreProviderFunction(config, azureCryptographyClient)
    console.log(`AFTER == BoosterConfig events provider functions are ${inspect(config.provider.events, false, 3, true)}`)
    console.log(`AFTER == BoosterConfig read model provider functions are ${inspect(config.provider.readModels, false, 3, true)}`)
  }

  private overrideEventStoreProviderFunction(boosterConfig: BoosterConfig, azureCryptographyClient: AzureCryptographyClient): void {
    const originalEventStoreFunction = boosterConfig.provider.events.store

    boosterConfig.provider.events.store = async (eventEnvelopes: Array<EventEnvelope>, boosterConfig: BoosterConfig): Promise<void> => {
      console.log("Overriding logic for event store function")
      const encryptedEventEnvelopes: Array<EventEnvelope> = BoosterCryptography.encryptEvents(eventEnvelopes, boosterConfig, azureCryptographyClient)
      return originalEventStoreFunction(encryptedEventEnvelopes, boosterConfig)
    }
  }

  private overrideReadModelStoreProviderFunction(boosterConfig: BoosterConfig, azureCryptographyClient: AzureCryptographyClient): void {
    const originalReadModelStoreFunction = boosterConfig.provider.readModels.store

    boosterConfig.provider.readModels.store = async (boosterConfig: BoosterConfig, readModelName: string, readModel: ReadModelInterface, expectedCurrentVersion?: number): Promise<unknown> => {
      console.log("Overriding logic for read model store function")
      const decryptedReadModel: ReadModelInterface = BoosterCryptography.decryptEvents(readModel, readModelName, boosterConfig, azureCryptographyClient)
      return originalReadModelStoreFunction(boosterConfig, readModelName, decryptedReadModel, expectedCurrentVersion)
    }
  }

  public rocketForAzure(): RocketDescriptor {
    return {
      packageName: 'rocket-encryption-azure-infrastructuree',
      parameters: this.rocketConfiguration
    }
  }
}
