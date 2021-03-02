var MyERC721 = artifacts.require('./MyERC721.sol')

module.exports = function (deployer) {
  deployer.deploy(MyERC721)
}
