
import {Class, EventInterface} from '@boostercloud/framework-types'
import {getFunctionArguments} from "@boostercloud/framework-core/dist/decorators/metadata";
import {Booster} from "@boostercloud/framework-core";

// @encrypt annotation
export function encrypt(klass: Class<EventInterface>, _functionName: string, parameterIndex: number): void {
  const args = getFunctionArguments(klass)
  const propertyName = args[parameterIndex]
  Booster.configureCurrentEnv((config: any): void => {
    if (!config.toEncrypt) {
      config.toEncrypt = {
        [klass.name]: propertyName
      }
    } else {
      if (config.toEncrypt[klass.name].length > 0) {
        config.toEncrypt[klass.name].push(propertyName)
      } else {
        config.toEncrypt = {
          ...config.toEncrypt,
          [klass.name]: [propertyName] as Array<string>
        }
      }
    }
  })
}
