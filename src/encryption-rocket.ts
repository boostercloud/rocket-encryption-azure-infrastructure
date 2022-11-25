import {BoosterConfig, RocketDescriptor} from "@boostercloud/framework-types"
import {EncryptionRocketConfiguration} from "./types";

export class EncryptionRocket {
  public constructor(readonly config: BoosterConfig, readonly rocketConfiguration: EncryptionRocketConfiguration) {
    config.registerRocketFunction("encryption-rocket", async (config: BoosterConfig, request: unknown) => {
    })
  }

  public rocketForAzure(): RocketDescriptor {
    return {
      packageName: 'rocket-encryption-azure-infrastructuree',
      parameters: this.rocketConfiguration
    }
  }
}
