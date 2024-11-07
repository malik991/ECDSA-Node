import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes } from "ethereum-cryptography/utils";

function hashMessage(msg) {
  const bytes = utf8ToBytes(msg);
  return keccak256(bytes);
}

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const amount = parseInt(sendAmount);

    const message = address + recipient + amount;
    const messageLength = message.length.toString();
    const formattedMsg = "ethereum signed message" + messageLength + message;

    const hashMsg = hashMessage(formattedMsg);

    const signature = secp.secp256k1.sign(hashMsg, privateKey);
    const recoveryBit = signature.recovery;

    // try {
    //   const hexSignature = signature.toCompactHex();
    //   const res = await server.post(`send`, {
    //     sender: address,
    //     amount,
    //     recipient,
    //     signature: hexSignature,
    //     recoveryBit,
    //   });
    //   //setBalance(balance);
    // } catch (ex) {
    //   console.log(ex);

    //   //alert(ex.response.data.message);
    // }

    try {
      const hexSignature = signature.toCompactHex();
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address, // public address of sender
        amount,
        recipient,
        signature: hexSignature,
        recoveryBit,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <div>Private Key: {privateKey}</div>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
