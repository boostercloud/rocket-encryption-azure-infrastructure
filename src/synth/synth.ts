import {BoosterConfig} from '@boostercloud/framework-types'
import {ApplicationSynthStack, RocketUtils} from '@boostercloud/framework-provider-azure-infrastructure'
import {EncryptionRocketConfiguration} from '../types'
import {BoosterCryptography} from "../core"
import {TerraformKeyVault} from "./terraform-key-vault";
import {EventEnvelope} from "@boostercloud/framework-types/dist/envelope";
import {ReadModelInterface} from "@boostercloud/framework-types/dist/concepts";

export class Synth {
  public static mountStack(
    configuration: EncryptionRocketConfiguration,
    config: BoosterConfig,
    applicationSynthStack: ApplicationSynthStack,
    utils: RocketUtils
  ): ApplicationSynthStack {
    const appPrefix = applicationSynthStack.appPrefix
    const terraformStack = applicationSynthStack.terraformStack
    const resourceGroup = applicationSynthStack.resourceGroup!
    const rocketStack = applicationSynthStack.rocketStack ?? []

    this.overrideEventStoreProviderFunction(config);
    this.overrideReadModelStoreProviderFunction(config);

    console.log("=== ENCRYPTION ROCKET - DEBUG INFO ===")
    console.log(appPrefix, terraformStack, resourceGroup, rocketStack)

    const keyVault = TerraformKeyVault.build(
      terraformStack,
      resourceGroup,
      appPrefix,
      config.environmentName,
      utils
    )

    rocketStack.push(keyVault)

    return applicationSynthStack
  }

  private static overrideEventStoreProviderFunction(config: BoosterConfig): void {
    const originalEventStoreFunction = config.provider.events.store

    config.provider.events.store = (eventEnvelopes: Array<EventEnvelope>, config: BoosterConfig): Promise<void> => {
      const encryptedEventEnvelopes: Array<EventEnvelope> = BoosterCryptography.encryptEvents(eventEnvelopes, config)
      return originalEventStoreFunction(encryptedEventEnvelopes, config)
    }
  }

  private static overrideReadModelStoreProviderFunction(config: BoosterConfig): void {
    const originalReadModelStoreFunction = config.provider.readModels.store

    config.provider.readModels.store = (config: BoosterConfig, readModelName: string, readModel: ReadModelInterface, expectedCurrentVersion?: number): Promise<unknown> => {
      const decryptedReadModel: ReadModelInterface = BoosterCryptography.decryptEvents(readModel, readModelName, config)
      return originalReadModelStoreFunction(config, readModelName, decryptedReadModel, expectedCurrentVersion)
    }
  }

  /* TODO
    public static unmountStack(
      config: BoosterConfig,
      applicationSynthStack: ApplicationSynthStack
    ): void {
    }*/
}