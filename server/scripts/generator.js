const secp = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const privateKey = secp.secp256k1.utils.randomPrivateKey();
//console.log("private key: ", toHex(privateKey));

const msg = "verify";
const hashMessage = toHex(utf8ToBytes(msg));

const signature = secp.secp256k1.sign(hashMessage, privateKey);
console.log(signature);

const pk = signature.recoverPublicKey(hashMessage).toRawBytes();
//console.log(toHex(pk));

const publicKey = secp.secp256k1.getPublicKey(privateKey);
//console.log(toHex(publicKey));

const isSigned = secp.secp256k1.verify(
  signature,
  hashMessage,
  toHex(publicKey)
);
console.log(isSigned);

// const pKey = signature.recoverPublicKey(hashMessage);
// console.log("pKey: ", pKey);

// const publicKey = secp.secp256k1.getPublicKey(privateKey);
// console.log("public key: ", toHex(publicKey));
