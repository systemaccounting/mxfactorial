const re = /(\S+)\s+(\S+)/;

export default function extractJwt(token) {
  const matches = token.match(re);
  return matches && { scheme: matches[1], value: matches[2] };
}
