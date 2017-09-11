var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {

  var owner = accounts[0];
  
  var donator = accounts[1];
  var beneficiary1 = accounts[2];
  var beneficiary2 = accounts[3];

  var donationGiven = web3.toWei(1, "ether") + 1;

  var donatorBalance;
  var beneficiary1Balance;
  var beneficiary2Balance;

  beforeEach(function() {
    return Splitter.new({from: owner})
    .then(function(instance){
        contract = instance;
        return contract.declareBeneficiaries(beneficiary1, beneficiary2, {from: donator})
      })
      .then(function(txn){
        return web3.eth.getBalance(donator);
      })
      .then(function(_donatorBalance){
        donatorBalance = _donatorBalance;
        return web3.eth.getBalance(beneficiary1);
      })
      .then(function(_beneficiary1Balance){
        beneficiary1Balance = _beneficiary1Balance;
        return web3.eth.getBalance(beneficiary2);
      })
      .then(function(_beneficiary2Balance){
        beneficiary2Balance = _beneficiary2Balance;
      });
  });

  it("should be owned by owner", function(){
    return contract.owner({from: owner})
    .then(function(_owner){
      assert.strictEqual(_owner, owner, "Contract is not owned by owner");
    });
  });

  it ("should split ether from donator to beneficiaries and allow withdrawal", function(){

    return contract.sendTransaction({from: donator, value: donationGiven})
    .then(function(txn){
      return contract.getBalance.call(donator);
    })
    .then(function(_newDonatorBalance){
      assert.equal(_newDonatorBalance, 1, "Donator didn't receive appropriate remainder amount of ether");            
      return contract.getBalance.call(beneficiary1);
    })
    .then(function(_newBeneficiary1Balance){
      assert.equal(_newBeneficiary1Balance.toString(10), donationGiven / 2, "Beneficiary1 didn't receive appropriate amount of ether");      
      return contract.getBalance.call(beneficiary2);
    })
    .then(function(_newBeneficiary2Balance){
      assert.equal(_newBeneficiary2Balance.toString(10), donationGiven / 2, "Beneficiary2 didn't receive appropriate amount of ether");
      return contract.withdraw({from: beneficiary1})
    })
    .then(function(txn){
      return contract.getBalance.call(beneficiary1);
    })
    .then(function(_newBeneficiary1Balance){
      assert.equal(_newBeneficiary1Balance, 0, "Beneficiary1's contract balance wasn't cleared out during withdrawal");
      return web3.eth.getBalance(beneficiary1);
    })
    .then(function(_newBeneficiary1Balance){
      assert.isAbove(_newBeneficiary1Balance, beneficiary1Balance, "Beneficiary1 doesn't have a higher ether balance after withdrawal")
    })
  })
});
