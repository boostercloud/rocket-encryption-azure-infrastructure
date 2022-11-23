import {BoosterConfig} from '@boostercloud/framework-types'
import {ApplicationSynthStack, RocketUtils} from '@boostercloud/framework-provider-azure-infrastructure'
import {EncryptionRocketConfiguration} from '../types'
import {BoosterCryptography} from "../core"
import {TerraformKeyVault} from "./terraform-key-vault";
import {EventEnvelope} from "@boostercloud/framework-types/dist/envelope";
import {ReadModelInterface} from "@boostercloud/framework-types/dist/concepts";
import {AzureCryptographyClient} from "../clients";
import {inspect} from "util";

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

    const azureCryptographyClient = new AzureCryptographyClient(boosterConfig, rocketConfiguration);
    this.overrideEventStoreProviderFunction(boosterConfig, azureCryptographyClient);
    this.overrideReadModelStoreProviderFunction(boosterConfig, azureCryptographyClient);

    const keyVault = TerraformKeyVault.build(
      terraformStack,
      resourceGroup,
      appPrefix,
      boosterConfig,
      utils,
      rocketConfiguration
    )

    console.log(`Loading Key Vault =>> ${inspect(keyVault, false, 2, true)}`)

    rocketStack.push(keyVault)

    return applicationSynthStack
  }

  private static overrideEventStoreProviderFunction(boosterConfig: BoosterConfig, azureCryptographyClient: AzureCryptographyClient): void {
    const originalEventStoreFunction = boosterConfig.provider.events.store

    boosterConfig.provider.events.store = (eventEnvelopes: Array<EventEnvelope>, boosterConfig: BoosterConfig): Promise<void> => {
      const encryptedEventEnvelopes: Array<EventEnvelope> = BoosterCryptography.encryptEvents(eventEnvelopes, boosterConfig, azureCryptographyClient)
      return originalEventStoreFunction(encryptedEventEnvelopes, boosterConfig)
    }
  }

  private static overrideReadModelStoreProviderFunction(boosterConfig: BoosterConfig, azureCryptographyClient: AzureCryptographyClient): void {
    const originalReadModelStoreFunction = boosterConfig.provider.readModels.store

    boosterConfig.provider.readModels.store = (boosterConfig: BoosterConfig, readModelName: string, readModel: ReadModelInterface, expectedCurrentVersion?: number): Promise<unknown> => {
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