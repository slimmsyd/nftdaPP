// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;



import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Iwhitelist.sol";


contract CryptoDevs is ERC721Enumerable, Ownable {

    //_baseTokenURI is computing {tokenURI}

    string _baseTokenURI; 

    //_price is price of one Crypo Dev NFT

    uint256 public _price = 0.01 ether;

    //_paused is used to pause the contract in case of emergency
    bool public _paused; 

    //Max nmber of CryptoDevs
    uint256 public maxTokenIds = 20; 

    //Total number of tokenIds minted
    uint256 public tokenIds; 

    //whitelist contract instance
    IWhiteList whitelist; 

    //boolean to keep track of when presale started
    bool public presaleStarted;
    //Timestamp for even presale would end
    uint256 public presaleEnded;

    modifier onlyWhenNotPaused { 
        require(!_paused, "Contract currently paused");
        _;
    }

    /**
    *ERC721 constructor takes in "name" and a "symbol" to token collection
     */
     
    constructor(string memory baseURI, address whitelistContract) ERC721("Crypto Devs", "CD") { 

        _baseTokenURI = baseURI; 
        whitelist = IWhiteList(whitelistContract);

    }

    //startPresale starts the presale 

    function startPresale() public onlyOwner { 
         presaleStarted = true;
        //set presale time as current timestamp + 5 mins
        presaleEnded = block.timestamp + 5 minutes;
    }

    //presale mint allows user to mint one NFT per transaction during the presalee

    function presaleMint() public payable onlyWhenNotPaused { 
        require(presaleStarted && block.timestamp < presaleEnded, "Presale is not currenlty running");
        require(whitelist.whitelistAddresses(msg.sender), "You are not whitlisted");
        require(tokenIds < maxTokenIds, "Exceeded maxium Crypto Devs supply");
        require(msg.value >= _price, "Ether sent is not correct");
        //_safeMint is safer version of the _mint function as it
        //ensure that if the address is being minted to contract
        //then it knows how to deal with ERC721 tokens
        //If the address being minted to is not a contract, it works
        //the same way as _mint

        _safeMint(msg.sender, tokenIds);

    }
    //mint allows an user to mint 1 NFT per transaction after the presale has ended
    function mint() public payable onlyWhenNotPaused { 
        require(presaleStarted && block.timestamp >= presaleEnded, "Presale has not ended yet");
        require(tokenIds < maxTokenIds, "Exceeded max Crypto Devs supply");
        require(msg.value >= _price, "Ether sent is not correct");
        tokenIds +=1;

        _safeMint(msg.sender, tokenIds);


    }

    //_baseURI overrides the Openzepplins ERC721 implementaion which returned a empty string for baseURI

    function _baseURI() internal view virtual override returns (string memory) { 
        return _baseTokenURI;



    }

    function withdraw() public onlyOwner { 

        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent,) = _owner.call{value: amount}("");
        require(sent, "Failed to send ether");

    }


    //Function to recieve Ether msg.data must be empty
    receive() external payable {}
    
    //Fallback function is called when msg.data is not empty
    fallback() external payable {}






}