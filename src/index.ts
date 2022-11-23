import { InfrastructureRocket } from '@boostercloud/framework-provider-azure-infrastructure'
import { Synth } from './synth'
import { EncryptionRocketConfiguration } from "./types"

export * from './decorators'
export * from './encryption-rocket'

const AzureRocketFiles = (configuration: EncryptionRocketConfiguration): InfrastructureRocket => ({
  mountStack: Synth.mountStack.bind(Synth, configuration)
})

export default AzureRocketFiles
