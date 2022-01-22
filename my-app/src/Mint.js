import { Contract, providers, utils } from "ethers";
import './App.css';

import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "./constants/main";



export default function Mint() { 

  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // presaleStarted keeps track of whether the presale has started or not
  const [presaleStarted, setPresaleStarted] = useState(false);
  // presaleEnded keeps track of whether the presale ended
  const [presaleEnded, setPresaleEnded] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // checks if the currently connected MetaMask wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState(false);
  // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();


  const getProivderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;

};


    //StartPresale

    const startPresale = async() => { 
      try { 
        //We Need a signer since its a write transaction
        const signer = await getProivderOrSigner(true);
        const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer)
      

      //call the presale from contract
      const tx = await whitelistContract.startPresale();
      setLoading(true)
      //wait for transaction to get mined
      await tx.wait();
      setLoading(false);
      //set the presale started to true
      await checkIfPresaleStarted()

      }catch(err) {
        console.error(err)
      }
    }


    //presaleMint: Mint a Nft during the presale

    const presaleMint = async () => { 

        try { 
            //We need a Signer here since this is a 'write' transactoin.
            const signer = await getProivderOrSigner(true); 
            //Create a new instance of the Contract with a Signer, which allows update methods
            const whitelistContract = new Contract(
                NFT_CONTRACT_ADDRESS,
                abi,
                signer
            );
                //call the preSale from the contract, only whitelisted addresses would be able to mint
                const tx = await whitelistContract.presaleMint({
                    //value signifies the cost of one crypto dev which is "0.01" eth.
                    //we are parsing '0.01' string to ether using utilis library from ether.js
                    value: utils.parseEther("0.01")
                });
                setLoading(true);
                //waite for transaction to get mined
                await tx.wait();
                setLoading(false);
                window.alert("You freaking minted a Crypto Dev")
        }catch(err) { 
            console.error(err)
        }
     


    };


    //Public mint from the contract to mint the Crypto Dev
    const publicMint = async() => { 
        try { 
            //We need a signer here since this is a write transaction
            const signer = await getProivderOrSigner(true);
            //Create a new instance of the Contract with signer, which allows update methods
            const whitelistContract = new Contract(
                NFT_CONTRACT_ADDRESS,
                abi,
                signer
            );

            //Call the mint from the contract to mint the Crypto Dev
            const tx = await whitelistContract.mint({ 
                //value signifies the cost of one crypto dev
                value: utils.parseEther("0.01"),
            });
            setLoading(true);
            //wait for transaction to get minded
            await tx.wait();
            setLoading(false);
            window.alert("You freaking minted a Crypto Dev");
        }catch(err) {
            console.error(err)
        }
    }

    //Connects the metamask wallet

    const connectWallet = async () => { 
        try { 
            //Get provider frm web3modal
            await getProivderOrSigner();
            setWalletConnected(true);
        }catch(err) { 
            console.error(err)
        }
    };

    //checkIfPreSaleStarted: checks if presale is started by quering the presaleStarted var

    const checkIfPresaleStarted = async() => { 

        try {
            //get the provider of web3modal
            const provider = await getProivderOrSigner();
            //We connect to the contract using a provider, so we will only have read access to the Contract

            const nftConctract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
            //call the presaleStarted from the contract
            const preSaleStarted = await nftConctract.presaleStarted();
            if(!presaleStarted) { 
                await getOwner();
            }
            setPresaleStarted(preSaleStarted);
            return presaleStarted;
        }catch(err) { 
            console.error(err);
            return false;
        }

    };


    //checkIfPresaleEnded:

    const checkIfPresaleEnded = async() => { 
        try { 
            const provider = await getProivderOrSigner();
            
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

            const preSaleEnded = await nftContract.presaleEnded()

            //presaleEnded is a Big Number, so we are using the It instead of <
            //Date.now()/100 returns the current time in seconds
            //We compare if the presaleEnded timesteamp is les than the current time
            //which means presale has ended

            const hasEnded  = preSaleEnded.It(Math.floor(Date.now() / 100));
            if(hasEnded) { 
                setPresaleEnded(true);
            }else { 
                setPresaleEnded(false);
            }
            return hasEnded;
        }catch(err)  { 
            console.error(err)
            return false;
    }
    }

    //getOwner: calls the cnotract to retrieve the owner

    const getOwner =async () => { 

        try { 

            const provider = await getProivderOrSigner();

            const nftConctract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
    
            const owner = await nftConctract.owner()
    
            //We will get the signer now to extract the address of the currenlty connected MetaMask account
            const signer = await getProivderOrSigner(true);
            //Get the address assocate to the signer which is connected to Metmask
            const address = await signer.getAddress();
            if(address.toLowerCase() === owner.toLowerCase()){ 
                setIsOwner(true)
            }
        }catch(err) { 
            console.error(err)
    }
    };

        //getTokendsIdminted: gets the # of tokenIds that have been minted

    const getTokenIdsMinted = async() =>{
        try { 
            const provider = await getProivderOrSigner();
    
            const nftConctract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
    
            //call the tokensIds from contract
            const tokenIds = await nftConctract.tokenIds();
            //tokenIds is a "big number" we need to conver that big number to a string
            setTokenIdsMinted(tokenIds.toString());
    
        }catch(err) {
             console.error(err)
        }
    };
    

    useEffect(() => {
        // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
        if (!walletConnected) {
          // Assign the Web3Modal class to the reference object by setting it's `current` value
          // The `current` value is persisted throughout as long as this page is open
          web3ModalRef.current = new Web3Modal({
            network: "rinkeby",
            providerOptions: {},
            disableInjectedProvider: false,
          });
          connectWallet();
    
          // Check if presale has started and ended
          const _presaleStarted = checkIfPresaleStarted();
          if (_presaleStarted) {
            checkIfPresaleEnded();
          }
    
          getTokenIdsMinted();
    
          // Set an interval which gets called every 5 seconds to check presale has ended
          const presaleEndedInterval = setInterval(async function () {
            const _presaleStarted = await checkIfPresaleStarted();
            if (_presaleStarted) {
              const _presaleEnded = await checkIfPresaleEnded();
              if (_presaleEnded) {
                clearInterval(presaleEndedInterval);
              }
            }
          }, 5 * 1000);
    
          // set an interval to get the number of token Ids minted every 5 seconds
          setInterval(async function () {
            await getTokenIdsMinted();
          }, 5 * 1000);
        }
      }, [walletConnected]);

      const renderButton = () => {
        // If wallet is not connected, return a button which allows them to connect their wllet
        if (!walletConnected) {
          return (
            <button onClick={connectWallet} className="button">
              Connect your wallet
            </button>
          );
        }
    
        // If we are currently waiting for something, return a loading button
        if (loading) {
          return <button className="button">Loading...</button>;
        }
    
        // If connected user is the owner, and presale hasnt started yet, allow them to start the presale
        if (isOwner && !presaleStarted) {
          return (
            <button className ="button" onClick={startPresale}>
              Start Presale!
            </button>
          );
        }
    
        // If connected user is not the owner but presale hasn't started yet, tell them that
        if (!presaleStarted) {
          return (
            <div>
              <div className="description">Presale hasnt started!</div>
            </div>
          );
        }
    
        // If presale started, but hasn't ended yet, allow for minting during the presale period
        if (presaleStarted && !presaleEnded) {
          return (
            <div>
              <div className="description">
                Presale has started!!! If your address is whitelisted, Mint a
                Crypto Dev 🥳
              </div>
              <button className= "button" onClick={presaleMint}>
                Presale Mint 🚀
              </button>
            </div>
          );
        }
    
        // If presale started and has ended, its time for public minting
        if (presaleStarted && presaleEnded) {
          return (
            <button className="button" onClick={publicMint}>
              Public Mint 🚀
            </button>
          );
        }
      };
    
      return (
        <div>
            <title>Crypto Devs</title>
            <meta name="description" content="Whitelist-Dapp" />
            <link rel="icon" href="/favicon.ico" />
          <div className="main">
            <div>
              <h1 className= "title">Welcome to Crypto Devs!</h1>
              <div className="description">
                Its an NFT collection for developers in Crypto.
              </div>
              <div className="description">
                {tokenIdsMinted}/20 have been minted
              </div>
              {renderButton()}
            </div>
            <div>
              <img className="image" src="./cryptodevs/0.svg" />
            </div>
          </div>
    
          <footer className= "footer">
            Made with &#10084; by Crypto Devs
          </footer>
        </div>
      );

}