import {BoosterConfig} from '@boostercloud/framework-types'
import {ApplicationSynthStack, RocketUtils} from '@boostercloud/framework-provider-azure-infrastructure'
import {EncryptionRocketConfiguration} from '../types'
import {TerraformKeyVault} from "./terraform-key-vault";
import {inspect} from "util";
import {AzureCryptographyClient} from "../clients";
import {EventEnvelope} from "@boostercloud/framework-types/dist/envelope";
import {BoosterCryptography} from "../core";
import {ReadModelInterface} from "@boostercloud/framework-types/dist/concepts";

export class Synth {
  public static mountStack(
    rocketConfiguration: EncryptionRocketConfiguration,
    boosterConfig: BoosterConfig,
    applicationSynthStack: ApplicationSynthStack,
    utils: RocketUtils
  ): ApplicationSynthStack {
    const appPrefix = applicationSynthStack.appPrefix
    const terraformStack = applicationSynthStack.terraformStack
    const resourceGroup = applicationSynthStack.resourceGroup!
    const rocketStack = applicationSynthStack.rocketStack ?? []
    console.log("=== ENCRYPTION ROCKET - DEBUG INFO ===")
    console.log(appPrefix, terraformStack, resourceGroup, rocketStack)

    const keyVault = TerraformKeyVault.build(
      terraformStack,
      resourceGroup,
      appPrefix,
      boosterConfig,
      utils,
      rocketConfiguration
    )

    const azureCryptographyClient = new AzureCryptographyClient(boosterConfig, rocketConfiguration)
    console.log(`BEFORE == BoosterConfig events provider functions are ${inspect(boosterConfig.provider.events.store, false, 3, true)}`)
    console.log(`BEFORE == BoosterConfig read model provider functions are ${inspect(boosterConfig.provider.readModels.store, false, 3, true)}`)
    this.overrideEventStoreProviderFunction(boosterConfig, azureCryptographyClient)
    this.overrideReadModelStoreProviderFunction(boosterConfig, azureCryptographyClient)
    console.log(`AFTER == BoosterConfig events provider functions are ${inspect(boosterConfig.provider.events, false, 3, true)}`)
    console.log(`AFTER == BoosterConfig read model provider functions are ${inspect(boosterConfig.provider.readModels, false, 3, true)}`)

    console.log(`Loading Key Vault =>> ${inspect(keyVault, false, 2, true)}`)

    rocketStack.push(keyVault)

    return applicationSynthStack
  }

  private static overrideEventStoreProviderFunction(boosterConfig: BoosterConfig, azureCryptographyClient: AzureCryptographyClient): void {
    const originalEventStoreFunction = boosterConfig.provider.events.store

    boosterConfig.provider.events.store = async (eventEnvelopes: Array<EventEnvelope>, boosterConfig: BoosterConfig): Promise<void> => {
      console.log("Overriding logic for event store function")
      const encryptedEventEnvelopes: Array<EventEnvelope> = BoosterCryptography.encryptEvents(eventEnvelopes, boosterConfig, azureCryptographyClient)
      return originalEventStoreFunction(encryptedEventEnvelopes, boosterConfig)
    }
  }

  private static overrideReadModelStoreProviderFunction(boosterConfig: BoosterConfig, azureCryptographyClient: AzureCryptographyClient): void {
    const originalReadModelStoreFunction = boosterConfig.provider.readModels.store

    boosterConfig.provider.readModels.store = async (boosterConfig: BoosterConfig, readModelName: string, readModel: ReadModelInterface, expectedCurrentVersion?: number): Promise<unknown> => {
      console.log("Overriding logic for read model store function")
      const decryptedReadModel: ReadModelInterface = BoosterCryptography.decryptEvents(readModel, readModelName, boosterConfig, azureCryptographyClient)
      return originalReadModelStoreFunction(boosterConfig, readModelName, decryptedReadModel, expectedCurrentVersion)
    }
  }

  /* TODO
    public static unmountStack(
      boosterConfig: BoosterConfig,
      applicationSynthStack: ApplicationSynthStack
    ): void {
    }*/
}