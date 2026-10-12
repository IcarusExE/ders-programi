import { generateKeyPairSync } from "node:crypto";

const { privateKey } = generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
});
const jwk = privateKey.export({ format: "jwk" });
const publicKey = Buffer.concat([
  Buffer.from([0x04]),
  Buffer.from(jwk.x, "base64url"),
  Buffer.from(jwk.y, "base64url"),
]).toString("base64url");

console.log("VAPID_SERVER_PUBLIC_KEY=" + publicKey);
console.log("VAPID_SERVER_PRIVATE_KEY=" + jwk.d);
