import {Class, ReadModelInterface} from '@boostercloud/framework-types'
import {getFunctionArguments} from "@boostercloud/framework-core/dist/decorators/metadata";
import {Booster} from "@boostercloud/framework-core";

// @decrypt annotation
export function decrypt(klass: Class<ReadModelInterface>, _functionName: string, parameterIndex: number): void {
  const args = getFunctionArguments(klass)
  const propertyName = args[parameterIndex]
  Booster.configureCurrentEnv((config: any): void => {
    if (!config.toDecrypt) {
      config.toDecrypt = {
        [klass.name]: propertyName
      }
    } else {
      if (config.toDecrypt[klass.name].length > 0) {
        config.toDecrypt[klass.name].push(propertyName)
      } else {
        config.toDecrypt = {
          ...config.toDecrypt,
          [klass.name]: [propertyName] as Array<string>
        }
      }
    }
  })
  console.log(`toDecrypt config prope`)
}
