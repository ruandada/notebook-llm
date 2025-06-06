import { customAlphabet } from 'nanoid'

export const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 20)

export const lockId = () => `lk-${nanoid()}`

export const messageId = () => `mg-${nanoid()}`

export const chatId = () => `ct-${nanoid()}`
