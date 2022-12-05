import {BoosterConfig} from '@boostercloud/framework-types'
import {ApplicationSynthStack, RocketUtils} from '@boostercloud/framework-provider-azure-infrastructure'
import {EncryptionRocketConfiguration} from '../types'
import {TerraformKeyVault} from "./terraform-key-vault";
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

  /* TODO
    public static unmountStack(
      boosterConfig: BoosterConfig,
      applicationSynthStack: ApplicationSynthStack
    ): void {
    }*/
}