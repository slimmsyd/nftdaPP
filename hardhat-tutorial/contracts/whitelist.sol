//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;



contract Whitelist { 
    
    //Max Number of whitelisteed addresses allowed; 

    uint8 public maxWhiteListedAddresses; 

    //Create A Mapping of Whitelilsted address;
    //If Address is whitelisted, we would set it to true, false by default for all other addresses.

    mapping(address => bool) public whiteListedAddresses; 


    //state to keep track of how many users whitelisted
    uint8 public numAddressesWhiteListed;

    //Setting the Max number of whitelistd address; 
    //User will input the value at the time of deployment 

    constructor(uint8 _maxWhiteListedAddresses) { 
        maxWhiteListedAddresses = _maxWhiteListedAddresses;
    }


    // addAddressToWhitelist - This function adds the address of the sender to the whitelist

    function addAddressToWhitList() public { 

        //Check to see if the user has already been whitelisted 
        require(!whiteListedAddresses[msg.sender], "Sender has already been whitelisted");
        // check if the numAddressesWhitelisted < maxWhitelistedAddresses, if not then throw an error.
        require(numAddressesWhiteListed < maxWhiteListedAddresses, "More addresses cant be added, limit reached");
        //Add the address which called the function to the whitelistedAddress array
        whiteListedAddresses[msg.sender] = true; 
        //Increase the number of whitlisted address;
        numAddressesWhiteListed += 1; 



    }



}
