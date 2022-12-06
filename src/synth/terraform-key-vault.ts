import {TerraformStack} from 'cdktf'
import {ResourceGroup, KeyVault, KeyVaultConfig} from '@cdktf/provider-azurerm'
import {RocketUtils} from '@boostercloud/framework-provider-azure-infrastructure'
import {EncryptionRocketConfiguration} from "../types";
import {BoosterConfig} from "@boostercloud/framework-types";

export class TerraformKeyVault {
  static build(
    terraformStack: TerraformStack,
    resourceGroup: ResourceGroup,
    appPrefix: string,
    boosterConfig: BoosterConfig,
    utils: RocketUtils,
    rocketConfiguration: EncryptionRocketConfiguration
  ): KeyVault {
    const id = utils.toTerraformName(appPrefix, 'rfkv')
    const name = `${boosterConfig.appName}${boosterConfig.environmentName}kv`
    console.log(`Creating KeyVault with name ${name}`)
    return new KeyVault(terraformStack, id, {
      name,
      resourceGroupName: resourceGroup.name,
      location: resourceGroup.location,
      skuName: rocketConfiguration.skuName ?? "standard",
      tenantId: rocketConfiguration.tenantId,
      accessPolicy: [{
        tenantId: rocketConfiguration.tenantId,
        objectId: process.env.AZURE_APP_OBJECT_ID,
        keyPermissions: ['List', 'Get', 'Create', 'Encrypt', 'Decrypt', 'Sign', 'Verify']
      }]
    } as KeyVaultConfig)
  }
}