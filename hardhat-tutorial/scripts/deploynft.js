const {ethers} = require("hardhat"); 
require("dotenv").config({path: "env"});

const {WHITELIST_CONTRACT_ADDRESS, METADATA_URL} = require("../constants");

const main = async() => { 

    //Address of the whitelist contract that you deployed in previous module
    const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
    //URL from where we can extract the metadata for a Crypto Dev NFT
    const metadataURL = METADATA_URL;


    const cryptoDevContract = await ethers.getContractFactory("CryptoDevs");

    //deploy contract
    const deployCryptoDevsContract = await cryptoDevContract.deploy(
        metadataURL,
        whitelistContract,

    );

    //print the address of the deployed contract

    console.log(`Crypto Devs Contract Address ${deployCryptoDevsContract.address}`)


}


//Call the main function and catch an error

main()
.then(() => process.exit(0))
.catch(error => { 
    console.error(error)
    process.exit(1)
})