pragma solidity ^0.4.4;

contract Splitter {

    address public owner;

    address public donator;
    address public beneficiary1;
    address public beneficiary2;

    mapping (address => uint) owedBalances;

    function Splitter(address _donator, address _beneficiary1, address _beneficiary2) {
        owner = msg.sender;
        donator = _donator;
        beneficiary1 = _beneficiary1;
        beneficiary2 = _beneficiary2;
    }

    function () payable {
        if (msg.sender != donator) { // Only allow the donator to send ether
            revert();
        }

        uint remainder = msg.value % 2;
        owedBalances[donator] += remainder;
        
        uint toPayout = (msg.value - remainder) / 2;
        owedBalances[beneficiary1] += toPayout;
        owedBalances[beneficiary2] += toPayout;
    }

    function withdraw() public returns(bool) {
        address recipient = msg.sender; 
        uint tmpBalance = owedBalances[recipient];
        if (tmpBalance == 0) {
            revert();
        }

        owedBalances[recipient] = 0;
        if (!recipient.send(tmpBalance)) {
            revert();
        }
        return true;
    }

    function getBalance(address recipient) public returns(uint) {
        return owedBalances[recipient];
    }

}
