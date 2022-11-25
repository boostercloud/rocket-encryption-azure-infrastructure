import {Class, ReadModelInterface} from '@boostercloud/framework-types'
import {getFunctionArguments} from "@boostercloud/framework-core/dist/decorators/metadata";
import {Booster} from "@boostercloud/framework-core";
import {inspect} from "util";

// @decrypt annotation
export function decrypt(klass: Class<ReadModelInterface>, _functionName: string, parameterIndex: number): void {
  const args = getFunctionArguments(klass)
  const propertyName = args[parameterIndex]
  console.log(`TO_DECRYPT == ARGS ${args} AND PROPERTY NAME ${propertyName}`)
  Booster.configureCurrentEnv((boosterConfig: any): void => {
    if (!boosterConfig.toDecrypt) {
      console.log("TO_DECRYPT == SETTING FIRST PROPERTY")
      boosterConfig.toDecrypt = {
        [klass.name]: [propertyName] as Array<string>
      }
    } else {
      console.log(`TO_DECRYPT == ADDING PROPERTY ${propertyName} TO ${inspect(boosterConfig.toEncrypt, false, 2, true)}`)
      const toDecryptForClass = boosterConfig.toDecrypt[klass.name] as Array<string>
      if (toDecryptForClass && toDecryptForClass.length > 0) {
        if (!toDecryptForClass.includes(propertyName)) {
          toDecryptForClass.push(propertyName)
          boosterConfig.toDecrypt[klass.name] = toDecryptForClass
        }
      } else {
        boosterConfig.toDecrypt = {
          ...boosterConfig.toDecrypt,
          [klass.name]: [propertyName] as Array<string>
        }
      }
    }
  })
  console.log(`toDecrypt config prope`)
}
