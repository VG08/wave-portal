import React, { useEffect, useState } from "react";
import "./App.css";
import abi from "./utils/WavePortal.json";
import { ethers } from "ethers";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x349F07e5b7f4eE7BF51Fc4D5b40B18a75904d5C7";
  const [allWaves, setAllWaves] = useState([]);
  const [waveAmount, setWaveAmount] = useState(0);
  const [isMining, setMining] = useState(false);
  
  /*
   * Create a method that gets all waves from your contract
   */
  

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum && checkIfWalletIsConnected()) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          ContractABI,
          signer
        );

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const ContractABI = abi.abi;
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
        return false
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };
  const getAmountOfWaves = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          ContractABI,
          signer
        );
        setMining(true);
        let count = await wavePortalContract.getTotalWaves();
        setMining(false);
        console.log("Retrieved total wave count...", count.toNumber());
        setWaveAmount(count.toNumber());
        // /*
        // * Execute the actual wave from your smart contract
        // */
        // const waveTxn = await wavePortalContract.wave();
        // console.log("Mining...", waveTxn.hash);

        // await waveTxn.wait();
        // console.log("Mined -- ", waveTxn.hash);

        // count = await wavePortalContract.getTotalWaves();
        // console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const sendWave = async (message) => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(
        contractAddress,
        ContractABI,
        signer
      );
      const waveTxn = await wavePortalContract.wave(message);
      setMining(true);
      console.log("Mining...", waveTxn.hash);
      await waveTxn.wait();
      console.log("Mined -- ", waveTxn.hash);
      setMining(false);
      await getAmountOfWaves();
    }
  };
  const wave = async () => {
    let message = document.getElementById("message").value;
    if (message == null || message == "") {
      alert("Please enter a message");
      return;
    }
    await sendWave(message);
  };
  const getWaveData = async () => {
    checkIfWalletIsConnected();

    if (currentAccount == null || currentAccount == "") {
      
      return;
    }
    else{
      await getAmountOfWaves();
      await getAllWaves();
    }
    
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {getWaveData()}, [waveAmount, currentAccount]);
  // useEffect(() => {
  //   setLoading()},
  //    [isMining]
  // );
 
  return (

      <div className="mainContainer">
     
      <div> 
    
  
      </div>
      {isMining ? (<> <div id="overlay">
        <div id="overlay-text">
          {" "}
          <div className="loader"></div>{" "}
        </div>
      </div></>) : (<></>)}

      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>

        <div className="bio">
          My name is VG and I am really excited about web3{" "}
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me {`[${waveAmount}]`}
        </button>
        <input
          id="message"
          className="message"
          type={"text"}
          placeholder="Your message to me?"
        />

        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
          {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
};

export default App;
