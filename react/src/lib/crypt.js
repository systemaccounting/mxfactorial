import CryptoJS from 'crypto-js'

// todo: add secrets manager value
const SECRET = process.env.REACT_APP_SECRET || 'secret'

export function cryptString(data) {
  return CryptoJS.AES.encrypt(data, SECRET)
}

export function decryptString(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext.toString(), SECRET)
  return bytes.toString(CryptoJS.enc.Utf8)
}
