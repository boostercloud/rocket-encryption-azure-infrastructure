import {TerraformStack} from 'cdktf'
import {ResourceGroup, KeyVault, KeyVaultConfig} from '@cdktf/provider-azurerm'
import {RocketUtils} from '@boostercloud/framework-provider-azure-infrastructure'

export class TerraformKeyVault {
  static build(
    terraformStack: TerraformStack,
    resourceGroup: ResourceGroup,
    appPrefix: string,
    environment: string,
    utils: RocketUtils
  ): KeyVault {
    const id = utils.toTerraformName(appPrefix, 'rfst')
    return new KeyVault(terraformStack, id, {
      name: `${resourceGroup.name}-${environment}-kv`,
      resourceGroupName: resourceGroup.name,
      location: resourceGroup.location,
      skuName: "Standard",
      tenantId: "myTenant"
    } as KeyVaultConfig)
  }
}