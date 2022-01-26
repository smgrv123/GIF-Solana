import React, { useState, useEffect } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";

// Constants
const TWITTER_HANDLE = "grover_sumrit";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

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

  useEffect(() => {
    const Loading = async () => {
      await checkIfPhantomIsConnected();
    };

    window.addEventListener("load", Loading);
    return () => {
      window.removeEventListener("load", Loading);
    };
  }, []);

  useEffect(() => {
    if (phantomWalletKey) {
      console.log("phantomWalletKey", phantomWalletKey);
      //* call solana program

      setgifArr(TEST_GIFS);
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

  const WalletConnected = () => (
    <div className="connected-container">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (inputLinkValue.length > 0) {
            console.log(inputLinkValue, "Gif Link");
            setgifArr([...gifArr, inputLinkValue]);
            setinputLinkValue("");
          } else {
            alert("Please enter a link");
          }
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
        <button className="cta-button submit-gif-button " onClick={() => {}}>
          Submit
        </button>
      </form>
      <div className="gif-grid">
        {gifArr.map((gif) => (
          <div className="gif-item" key={gif}>
            <img src={gif} alt={gif} />
          </div>
        ))}
      </div>
    </div>
  );

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
