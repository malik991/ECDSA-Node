import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function Wallet({
  address,
  setAddress,
  privateKey,
  setPrivateKey,
  balance,
  setBalance,
}) {
  async function onChange(evt) {
    //const address = evt.target.value;
    setBalance(0);
    const privateKey = evt.target.value;

    setPrivateKey(privateKey);
    let address;
    if (privateKey) {
      const message = "verify ownership";
      const hashMsg = toHex(utf8ToBytes(message));
      // generate the signature
      const signature = secp.secp256k1.sign(hashMsg, privateKey);
      //console.log(signature);

      // recovery bit
      const recoveryBit = signature.recovery;
      // Recover the public key from signature
      address = toHex(signature.recoverPublicKey(hashMsg).toRawBytes());
      //console.log(address);

      setAddress(address);
      if (address) {
        const {
          data: { balance },
        } = await server.get(`balance/${address}`);

        //const hexSignature = signature.toCompactHex();
        // const {
        //   data: { balance },
        // } = await server.post(`verify-signature`, {
        //   signature: hexSignature,
        //   recoveryBit,
        //   message,
        // }); //await server.get(`balance/${address}`);
        setBalance(balance);
      } else {
        setBalance(0);
      }

      //address = toHex(secp.secp256k1.getPublicKey(privateKey));
      //console.log(address);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input
          placeholder="enter your private key"
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>

      {address && privateKey && <div>address: {address.slice(0, 10)}...</div>}

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
