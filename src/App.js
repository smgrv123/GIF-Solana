import React, { useState, useEffect } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";

// Constants
const TWITTER_HANDLE = "grover_sumrit";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [phantomWalletKey, setphantomWalletKey] = useState(null);

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

  useEffect(() => {
    const Loading = async () => {
      await checkIfPhantomIsConnected();
    };

    window.addEventListener("load", Loading);
    return () => {
      window.removeEventListener("load", Loading);
    };
  }, []);

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

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!phantomWalletKey ? WalletNotConnected() : null}
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
