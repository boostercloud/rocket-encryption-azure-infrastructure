import { InfrastructureRocket } from '@boostercloud/framework-provider-azure-infrastructure'
import { Synth } from './synth'
import { EncryptionRocketConfiguration } from "./types"

const AzureRocketFiles = (configuration: EncryptionRocketConfiguration): InfrastructureRocket => ({
  mountStack: Synth.mountStack.bind(Synth, configuration)
})

export default AzureRocketFiles
