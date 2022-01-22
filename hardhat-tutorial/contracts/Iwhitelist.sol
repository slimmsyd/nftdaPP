// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


//Save Gas by deploying a part of the whitelist contract

interface IWhiteList { 
    function whitelistAddresses(address) external view returns (bool);
}
