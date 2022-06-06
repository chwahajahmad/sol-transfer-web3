import React, { useState, useEffect } from "react";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction
} from "@solana/web3.js";

const connectToPhantom = async () => {
  try {
    const resp = await window.solana.connect();
  } catch {}
};

const getProvider = () => {
  if ("solana" in window) {
    const provider = window.solana;
    if (provider.isPhantom) return provider;
  }
  //   window.open("https://phantom.app", "_blank");
};

const App1 = () => {
  const [wallet, setWallet] = useState("");
  const [lamports, setLamports] = useState(0);
  const [reciever, setReciever] = useState("");
  useEffect(() => {
    window.solana.on("connect", () => {
      setWallet(window.solana.publicKey.toString());
    });
  }, [wallet]);

  let signAndSendTransaction = async (transaction, connection) => {
    const { signature } = await window.solana.signAndSendTransaction(
      transaction
    );

    await connection.confirmTransaction;
    return signature;
  };
  let setWalletTransaction = async (instruction, connection) => {
    const transaction = new Transaction();
    transaction.add(instruction);
    transaction.feePayer = new PublicKey(wallet);
    let hash = await connection.getRecentBlockhash();
    transaction.recentBlockhash = hash.blockhash;

    return transaction;
  };
  const sendLamport = () => {
    signInTransactionAndSendSignature(lamports);
  };
  const successful = () => {
    alert("Succesfuly Sent Sol!");
    setLamports(0);
    setReciever("");
  };
  const signInTransactionAndSendSignature = async lamports => {
    const network = "https://api.devnet.solana.com";
    const connection = new Connection(network);

    lamports = LAMPORTS_PER_SOL;
    try {
      let destPubKeyStr = reciever;
      let destPubKey = new PublicKey(destPubKeyStr);
      let sourcePublicKey = new PublicKey(wallet);

      const walletAccountInfo = await connection.getAccountInfo(
        sourcePublicKey
      );
      let recieverAccountInfo = await connection.getAccountInfo(destPubKey);
      const instruction = SystemProgram.transfer({
        fromPubkey: sourcePublicKey,
        toPubkey: destPubKey,
        lamports
      });
      let trans = await setWalletTransaction(instruction, connection);
      let signature = await signAndSendTransaction(trans, connection);
      let results = await connection.confirmTransaction(
        signature,
        "singleGossip"
      );
      successful();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="wrapper">
      <div className="inside">
        {wallet === "" && (
          <button onClick={connectToPhantom}>Click to Phantom!</button>
        )}
        {wallet !== "" && (
          <>
            <span className="walletAddress">Wallet Address: {wallet}</span>
            <input
              className="inputLam"
              onChange={e => setLamports(e.target.value)}
              type={"number"}
              placeholder="Enter Lamports"
            ></input>
            <input
              className="inputLam"
              onChange={e => setReciever(e.target.value)}
              placeholder="Receiver Wallet Address"
            ></input>

            <button style={{ alignSelf: "flex-end" }} onClick={sendLamport}>
              Send Lamports
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default App1;
