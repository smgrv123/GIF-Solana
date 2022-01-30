import React, { useState, useEffect } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import idl from "./idl.json";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import kp from './keypair.json'

// Constants
const TWITTER_HANDLE = "grover_sumrit";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
// let baseAccount = Keypair.generate();
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl("devnet");

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed",
};

const App = () => {
  const [phantomWalletKey, setphantomWalletKey] = useState(null);
  const [inputLinkValue, setinputLinkValue] = useState("");
  const [gifArr, setgifArr] = useState([]);

  const TEST_GIFS = [
    "https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp",
    "https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g",
    "https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g",
    "https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp",
  ];

  const checkIfPhantomIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("phantom is connected");
          const res = await solana.connect({ onlyIfTrusted: true });
          console.log(res.publicKey.toString());

          setphantomWalletKey(res.publicKey.toString());
        }
      } else {
        alert("Solana object not found! Get a Phantom Wallet 👻");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  useEffect(() => {
    const Loading = async () => {
      await checkIfPhantomIsConnected();
    };

    window.addEventListener("load", Loading);
    return () => {
      window.removeEventListener("load", Loading);
    };
  }, []);

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      console.log("first");
      const program = new Program(idl, programID, provider);
      console.log("ping");
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        "created new account with id:",
        baseAccount.publicKey.toString()
      );
      await getGifArray();
    } catch (error) {
      console.log("error while creating account", error);
    }
  };

  const getGifArray = async () => {
    try {
      const Provider = getProvider();
      const program = new Program(idl, programID, Provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log("gif account connected", account);
      setgifArr(account.gifList);
    } catch (error) {
      console.log("error fetching gif list", error);
      setgifArr(null);
    }
  };

  useEffect(() => {
    if (phantomWalletKey) {
      console.log("phantomWalletKey", phantomWalletKey);
      //* call solana program

      getGifArray();
    }
  }, [phantomWalletKey]);

  const connectWallet = async () => {
    const { solana } = window;

    const res = await solana.connect();
    console.log(res.publicKey.toString());
    setphantomWalletKey(res.publicKey.toString());
  };

  const WalletNotConnected = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={() => {
        console.log("yes");
        connectWallet();
      }}
    >
      Connect to Wallet
    </button>
  );

  const sendgif = async () => {
    if (inputLinkValue.length === 0) {
      console.log("No gif link given!");
      return;
    }
    setinputLinkValue("");
    console.log("Gif link:", inputLinkValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addGif(inputLinkValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF successfully sent to program", inputLinkValue);

      await getGifArray();
    } catch (error) {
      console.log("Error sending GIF:", error);
    }
  };

  const WalletConnected = () => {
    if (gifArr !== null) {
      return (
        <div className="connected-container">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendgif();
            }}
          >
            <input
              type={"text"}
              placeholder="Enter GIF Link!!"
              value={inputLinkValue}
              onChange={(e) => {
                setinputLinkValue(e.target.value);
              }}
            />
            <button
              className="cta-button submit-gif-button "
              onClick={() => {}}
            >
              Submit
            </button>
          </form>
          <div className="gif-grid">
            {gifArr.map((gif) => (
              <div className="gif-item" key={gif.gifLink}>
                <img src={gif.gifLink} alt={gif.gifLink} />
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div className="connected-container">
          <button
            className="cta-button submit-gif-button"
            onClick={createGifAccount}
          >
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      );
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!phantomWalletKey ? WalletNotConnected() : WalletConnected()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
