pragma solidity ^0.4.4;

import "./SafeMath.sol";

contract Splitter {

    address public owner;

    address public donator;
    address public beneficiary1;
    address public beneficiary2;

    event Donation(address donator, address beneficiary1, address beneficiary2, uint amountDonated);
    event Withdrawal(address withdrawer, uint amounWithdrawn);

    mapping (address => uint) owedBalances;

    function Splitter(address _donator, address _beneficiary1, address _beneficiary2) public {
        owner = msg.sender;
        donator = _donator;
        beneficiary1 = _beneficiary1;
        beneficiary2 = _beneficiary2;
    }

    function () payable public {
        require(msg.sender == donator);

        uint remainder = msg.value % 2;
        owedBalances[donator] = SafeMath.add(owedBalances[donator], remainder);
        
        uint toPayout = SafeMath.div(SafeMath.sub(msg.value, remainder), 2);
        owedBalances[beneficiary1] = SafeMath.add(owedBalances[beneficiary1], toPayout);
        owedBalances[beneficiary2] = SafeMath.add(owedBalances[beneficiary2], toPayout);

        Donation(donator, beneficiary1, beneficiary2, msg.value);
    }

    function withdraw() public returns(bool) {
        address recipient = msg.sender; 
        uint tmpBalance = owedBalances[recipient];
        assert(tmpBalance != 0);

        owedBalances[recipient] = 0;
        if (!recipient.send(tmpBalance)) {
            revert();
        }
        Withdrawal(recipient, tmpBalance);
        return true;
    }

    function getBalance(address recipient) public returns(uint) {
        return owedBalances[recipient];
    }

}
