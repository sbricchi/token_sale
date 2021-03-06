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

    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor (DappToken _tokenContract, uint _tokenPrice) {
        
        // Assign an ADMIN. External account with special privileges.
        admin = msg.sender;
        
        // Token contract
        tokenContract = _tokenContract;

        // Define Token Price
        tokenPrice = _tokenPrice;
    }

    // Multiply utilizando lib DSMath que permite hacer operaciones seguras
    function multiply(uint x, uint y) internal pure returns (uint z) {
        // PURE: DOES NOT OPERATE ON BLOCKCHAIN
        require(y == 0 || (z = x * y) / y == x);
    }

    // Compra de Tokens
    function buyTokens(uint256 _numberOfTokens) public payable { // payable: permite mandar eth
        
        // Evitar que se realice un sobrepago o subpago...
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        
        // Verificar que el SC tenga suficientes tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);

        // Realizar transferencia al comprador (msg.sender) y verifica que se finalice
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        // Incrementa la cantidad de tokens vendidos
        tokensSold += _numberOfTokens;

        // Lanzar evento de venta
        emit Sell(msg.sender, _numberOfTokens);
    }

    // Ending the token sale
    function endSale() public {
        
        // Only admins can do this
        require(msg.sender == admin);

        // Tranfer remaining token back to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));

        // Destroy this contract (selfdestruct or suicide)
        selfdestruct(payable(admin));
        /*
            https://betterprogramming.pub/solidity-what-happens-with-selfdestruct-f337fcaa58a7
            The wrap up is, selfdestruct is designed to be the extrema ratio for a malfunctioning contract. 
            It is the emergency button, the SCRAM of your smart contract. 
            Still, before calling it, consider adding additional logic to, for example, pass control to another smart contract.        
        */
    }
}