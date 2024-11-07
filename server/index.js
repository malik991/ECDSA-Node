const express = require("express");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const secp = require("ethereum-cryptography/secp256k1");

const app = express();
const cors = require("cors");
const port = 3042;

function hashMessage(msg) {
  const bytes = utf8ToBytes(msg);
  return keccak256(bytes);
}

app.use(cors());
app.use(express.json());

const balances = {
  "0265e96cddc48c6e4af5d9c5e7d22a63c21c482482c83e8db3c59bd65761961174": 100,
  "03e252efd83429e658c47452945aee2a01c2e82d18472c9319e92a42335185b18e": 50,
  "032408992c9fa2c2afdcbf1d1da5ff1df2b3baa48419491224fc50fee61537de64": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;

  const balance = balances[address] || 0;
  res.send({ balance });
});
app.post("/verify-signature", (req, res) => {
  const { signature, recoveryBit, message } = req.body;
  const hashMsg = toHex(utf8ToBytes(message));
  const signatureBytes = Uint8Array.from(Buffer.from(signature, "hex"));
  try {
    const sig =
      secp.secp256k1.Signature.fromCompact(signatureBytes).addRecoveryBit(
        recoveryBit
      );
    // The recovery bit is now accessible via sig.recovery
    // console.log(sig.r, sig.s, sig.recovery);

    const recoveryBitFromSignature = sig.recovery;
    //console.log("recovery: ", recoveryBitFromSignature);

    const publicKey = sig.recoverPublicKey(hashMsg, recoveryBitFromSignature);

    const address = toHex(publicKey.toRawBytes());
    console.log(address);
    return res.send("ok");
  } catch (error) {
    console.log("error : ", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

app.post("/send", (req, res) => {
  // TODO:
  // 1: get signature from client side
  // 2: from the signature than we cal derive the public address/key
  const { sender, recipient, amount, signature, recoveryBit } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const message = sender + recipient + amount;
  const messageLength = message.length.toString();
  const formattedMsg = "ethereum signed message" + messageLength + message;
  const hashMsg = hashMessage(formattedMsg);

  // console.log("signature: ", signature);
  // console.log(typeof signature);
  const signatureBytes = Uint8Array.from(Buffer.from(signature, "hex"));
  const sig =
    secp.secp256k1.Signature.fromCompact(signatureBytes).addRecoveryBit(
      recoveryBit
    );

  const recoveryBitFromSignature = sig.recovery;
  const recoverPublicKey = sig.recoverPublicKey(
    hashMsg,
    recoveryBitFromSignature
  );
  //console.log(toHex(recoverPublicKey.toRawBytes()));
  if (toHex(recoverPublicKey.toRawBytes()) != sender) {
    return res.status(400).send({ message: "Invalid signature" });
  }
  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
