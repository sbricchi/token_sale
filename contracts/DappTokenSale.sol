// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import "./DappToken.sol";

contract DappTokenSale {

    // Estas variables de estado pertenecen al SC y no son mantenidas en RAM
    // sino que se escriben en la blockchain

    // Persona que deployó el contract
    address admin;

    DappToken public tokenContract;

    uint256 public tokenPrice;

    constructor (DappToken _tokenContract, uint _tokenPrice) {
        
        // Assign an ADMIN. External account with special privileges.
        admin = msg.sender;
        
        // Token contract
        tokenContract = _tokenContract;

        // Define Token Price
        tokenPrice = _tokenPrice;
    }
}