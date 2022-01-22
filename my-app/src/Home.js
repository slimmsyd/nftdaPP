import logo from './logo.svg';
import './App.css';
import Web3Modal from 'web3modal';
import {providers, Contract} from "ethers"; 
import {useState, useEffect, useRef} from "react"; 
import { WHITELIST_CONTRACT_ADDRESS, abi } from './constants';
import { BrowserRouter, Route, Routes } from 'react-router-dom';


export default function App() { 
  //walletConnnected to keep track of wheter the user wallet is connected or not 
  const [walletConnnected, setWalletConnected] = useState(false); 
  //joinedWhitelist keeps track whethere the current address is on whitelist
  const [joinedWhitelist, setJoinedWhitelist]  = useState(false); 
  //loading is set to true when we are waiting for transaction to get mined
  const [loading, setLoading] = useState(false); 
  //numberOfWhitelisted tracks the number of addresses's whitelisted; 
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  //Create a reference to the Web3 modal(used for connected to Metamask) which persist as long as page is open
  const Web3ModalRef = useRef(); 

  //Switch to mint page 
  const [mint, setMint] = useState(false)


 /**
  * Return a Provider or Signer object representing Eth RPC
  * A provider is needed to interact wth the blockchain -reading transactions, balances, state etc.
  * Signer special type of Provider that enables to write to blockchain 
  * 
  */

const getProviderOrSigner = async (needSigner = false) => { 
  //Connect to Metmask
  //Since we store 'web3Modal' as a reference we need to access current value to get the underlying object
  const provider = await Web3ModalRef.current.connect(); 
  const web3provider = new providers.Web3Provider(provider)

  //If user is not connected to Rinkeby network, let them know
  const {chainId} = await web3provider.getNetwork();
  if(chainId !== 4) { 
    window.alert("Change Network to Rinkeby");
    throw new Error("Change Network to Rinkeby")
  }
  
  if (needSigner) { 
    const signer = web3provider.getSigner();
    return signer;
  }

  return web3provider;

};

//Add address to whitelilst: Adds to current conneced address to the whitelist 


const getNumberOfWhitelisted = async () => { 
  try { 
    //Get the provider from web3modal
    //No need for signer here, we are only reading state from the blockchain
    const provider = await  getProviderOrSigner(); 
    //We connect to the contract using a Provider, so we will only
    //Have read-only access to the Contract

    const whitelistedContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, provider);
    //Call the numAddressesWhitelised from contract

    const _numberofWhiteListed   = await whitelistedContract.numAddressesWhiteListed();
    setNumberOfWhitelisted(_numberofWhiteListed)
  }catch(err) { 
    console.error(err)
  }
};


const addAddressToWhitelist = async() => { 
  try { 
    //We need a signer here since this is a write transaction 
    const signer = await getProviderOrSigner(true);

    //Create a new instance of the Contract with a signer, which allows to update methods 
    const whitelistedContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer)

    //call the addAddress to whtielist from the contract
    const tx = await whitelistedContract.addAddressToWhitList();
    setLoading(true);
    //wait for transaction to get mined 
    await tx.wait();
    setLoading(false); 
    await getNumberOfWhitelisted(); 
    setJoinedWhitelist(true);

  }catch(error) { 
    console.error(error)
  }
}; 

//get number of whitlised addresses







//Check if addres is in whitelist 

const checkIfAddressInWhitelist = async () => { 
  try { 
    //We will need the signer later to get teh user's address
    //Even though its a read transaction, since singers are just special providers
    //We can use it in its place

    const signer = await getProviderOrSigner(true); 
    const whitelistedContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer);

    //Get Address associate with signer which is connect to Metmask 
    const address = await signer.getAddress();
    //call the whitelisedAddress from the contract 
    const _joinedWhitelist = await whitelistedContract.whiteListedAddresses(address);

    setJoinedWhitelist(_joinedWhitelist)
  }catch(err) {
    console.error(err)
  }
};

const connectWallet  = async () =>  { 
  try  { 
    //Get provider from web3modal
    //When used for the first time, it prompts the user to connect their wallet

    await getProviderOrSigner();
    setWalletConnected(true);

    checkIfAddressInWhitelist();
    getNumberOfWhitelisted();

  }catch(err) {
    console.error(err)
  }
}


const renderButton = () => { 

  if(walletConnnected) { 
    if(joinedWhitelist) { 
      return(

        <div className = "description">
          Thanks for joining the Whitelist!
        </div>


      );
      
    }else if (loading) { 
      return <button className = "button">Loading...</button>
    }else {
      return ( 
        <button onClick = {addAddressToWhitelist} className = "button">
          Join the Whitelist
        </button>
      );

    }
  }else { 
    return (
      <button onClick={connectWallet} className='button'>
        Connect your wallet
      </button>
    );
  }

};

const mintPage = () => {
  if(!mint)  {
    return (
      <div>Hello</div>
    )

  }

}

//useEffects are used to react to changes in state of website
//The arry at the end of the function call represents what changes will trigger this effect
//This case, whenever the value 'walletConnected' changes-the effect will be called


useEffect(()=> { 
  if(!walletConnnected) { 
    Web3ModalRef.current = new Web3Modal({
      network: 'rinkeby',
      providerOptions: {},
      disableInjectedProvider: false,
    });
    connectWallet();
  }
}, [walletConnnected])




  
return(

  <div>
    <header>
    <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
    </header>
    <div className= "main">
        <div>
          <h1 className="title">Welcome to Crypto Devs!</h1>
          <div className="description">
            Its an NFT collection for developers in Crypto.
          </div>
          <div className= "description" >
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className= "image" src="./crypto-devs.svg" />
        </div>
      </div>

      
      <div className = "mintLink">
      
      <a href = "/mint"className= "mint">Mint Your Nft </a>
    
      </div>      

      <footer className= "footer">
        Made with &#10084; by Crypto Devs
      </footer>

  </div>
)


}






