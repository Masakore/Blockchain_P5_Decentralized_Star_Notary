var StringUtilsLib = artifacts.require("./StringUtilsLib.sol");
var Migrations = artifacts.require("./StarNotary.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
