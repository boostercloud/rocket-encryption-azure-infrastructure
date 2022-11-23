import {BoosterConfig, RocketDescriptor} from "@boostercloud/framework-types"
import {EncryptionRocketConfiguration} from "./types";

export class EncryptionRocket {
  public constructor(readonly config: BoosterConfig, readonly params: EncryptionRocketConfiguration) {
    config.registerRocketFunction("encryption-rocket", async (config: BoosterConfig, request: unknown) => {
    })
  }

  public rocketForAzure(): RocketDescriptor {
    return {
      packageName: 'rocket-encryption-azure-infrastructure',
      parameters: this.params
    }
  }
}
