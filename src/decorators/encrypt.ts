
import {Class, EventInterface} from '@boostercloud/framework-types'
import {getFunctionArguments} from "@boostercloud/framework-core/dist/decorators/metadata";
import {Booster} from "@boostercloud/framework-core";
import {inspect} from "util";

// @encrypt annotation
export function encrypt(klass: Class<EventInterface>, _functionName: string, parameterIndex: number): void {
  const args = getFunctionArguments(klass)
  const propertyName = args[parameterIndex]
  console.log(`TO_ENCRYPT == ARGS ${args} AND PROPERTY NAME ${propertyName}`)
  Booster.configureCurrentEnv((boosterConfig: any): void => {
    if (!boosterConfig.toEncrypt) {
      console.log("TO_ENCRYPT == SETTING FIRST PROPERTY")
      boosterConfig.toEncrypt = {
        [klass.name]: [propertyName] as Array<string>
      }
    } else {
      console.log(`TO_ENCRYPT == ADDING PROPERTY ${propertyName} TO ${inspect(boosterConfig.toEncrypt, false, 2, true)}`)
      const toEncryptForClass = boosterConfig.toEncrypt[klass.name] as Array<string>
      if (toEncryptForClass.length > 0) {
        if (!toEncryptForClass.includes(propertyName)) {
          toEncryptForClass.push(propertyName)
          boosterConfig.toEncrypt[klass.name] = toEncryptForClass
        }
      } else {
        boosterConfig.toEncrypt = {
          ...boosterConfig.toEncrypt,
          [klass.name]: [propertyName] as Array<string>
        }
      }
    }
  })
}
