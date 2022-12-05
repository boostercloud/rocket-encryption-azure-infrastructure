import {BoosterConfig, RocketDescriptor} from "@boostercloud/framework-types"
import {EncryptionRocketConfiguration} from "./types";
import {AzureCryptographyClient} from "./clients";
import {EventEnvelope} from "@boostercloud/framework-types/dist/envelope";
import {BoosterCryptography} from "./core";
import {ReadModelInterface} from "@boostercloud/framework-types/dist/concepts";

export class EncryptionRocket {
  public constructor(readonly config: BoosterConfig, readonly rocketConfiguration: EncryptionRocketConfiguration) {
    config.registerRocketFunction("encryption-rocket", async (config: BoosterConfig, request: unknown) => {
    })
  }

  public setupStoreFunctions() {
    const azureCryptographyClient = new AzureCryptographyClient(this.config, this.rocketConfiguration)
    this.overrideEventStoreProviderFunction(azureCryptographyClient)
    this.overrideReadModelStoreProviderFunction(azureCryptographyClient)
  }

  private overrideEventStoreProviderFunction(azureCryptographyClient: AzureCryptographyClient): void {
    const originalEventStoreFunction = this.config.provider.events.store

    this.config.provider.events.store = async (eventEnvelopes: Array<EventEnvelope>, boosterConfig: BoosterConfig): Promise<void> => {
      console.log("Calling overridden event store function")
      const encryptedEventEnvelopes: Array<EventEnvelope> = await BoosterCryptography.encryptEvents(eventEnvelopes, boosterConfig, azureCryptographyClient)
      return originalEventStoreFunction(encryptedEventEnvelopes, boosterConfig)
    }
  }

  private overrideReadModelStoreProviderFunction(azureCryptographyClient: AzureCryptographyClient): void {
    const originalReadModelStoreFunction = this.config.provider.readModels.store

    this.config.provider.readModels.store = async (boosterConfig: BoosterConfig, readModelName: string, readModel: ReadModelInterface, expectedCurrentVersion?: number): Promise<unknown> => {
      console.log("Calling overridden read model store function")
      const decryptedReadModel: ReadModelInterface = BoosterCryptography.decryptEvents(readModel, readModelName, boosterConfig, azureCryptographyClient)
      return originalReadModelStoreFunction(boosterConfig, readModelName, decryptedReadModel, expectedCurrentVersion)
    }
  }

  public rocketForAzure(): RocketDescriptor {
    return {
      packageName: 'rocket-encryption-azure-infrastructure',
      parameters: this.rocketConfiguration
    }
  }
}
