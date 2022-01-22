const {ethers} = require("hardhat"); 



const main = async () => { 

    const whiteListedContrat = await ethers.getContractFactory("Whitelist"); 


    //Deploy the contact 
    const deployWhiteListedContract = await whiteListedContrat.deploy(10); //10 = max number of whitlisted spots;
    //Wait for it to finish deploying 

    await deployWhiteListedContract.deployed(); 


    //print address of deployed contracts 
    console.log(`Whitlisted Contract Address ${deployWhiteListedContract.address}`);


};

// Call the main function and catch if there is any error

main()
    .then(() => process.exit(0))
    .catch((error) => { 
        console.error(error)
        process.exit(1)
    });