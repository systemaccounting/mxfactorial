import { decryptString } from './crypt'

export function testPassword(password) {
  const credential = localStorage.getItem('credential')
  const decrypted = decryptString(credential)
  if (password === decrypted) {
    return true
  }
  return false
}
