var MyBetterERC721 = artifacts.require('./MyBetterERC721.sol')

module.exports = function (deployer) {
  deployer.deploy(MyBetterERC721)
}
