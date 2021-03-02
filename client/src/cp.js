const truffleAssert = require('truffle-assertions')
const MyERC721 = artifacts.require('./MyERC721.sol')

contract('MyERC721', accounts => {
  const URI = 'TOKEN URI'
  let contract

  it('gets deployed contract', async () => {
    contract = await MyERC721.deployed()
    assert.exists(contract, 'token exists')
  })

  it('mints token with tokenURI', async () => {
    await contract.mint(accounts[1], URI, { from: accounts[0] })

    const balance = Number(await contract.balanceOf(accounts[1]))
    assert.equal(balance, 1, 'balance is equal to 1')

    const tokenId = await contract.tokenOfOwnerByIndex(accounts[1], 0)
    const tokenURI = await contract.tokenURI(tokenId)

    assert.equal(tokenURI, URI, 'tokenURI is the same as URI')
  })

  it('fails to mint token if called not by zero account', async () => {
    await truffleAssert.fails(
      contract.mint(accounts[1], URI, { from: accounts[1] }),
      truffleAssert.ErrorType.REVERT
    )
  })

  it('transfers token from one account to another', async () => {
    const balanceBefore = Number(await contract.balanceOf(accounts[2]))
    assert.equal(balanceBefore, 0, 'Second account balance before is 0')

    const tokenId = await contract.tokenOfOwnerByIndex(accounts[1], 0)
    await contract.transferFrom(accounts[1], accounts[2], tokenId, {
      from: accounts[1],
    })

    const balanceAfter = Number(await contract.balanceOf(accounts[2]))
    assert.equal(balanceAfter, 1, 'Second account balance after is 1')

    const owner = await contract.ownerOf(tokenId)
    assert.equal(owner, accounts[2], 'Owner of tokenId is the second account')
  })

  // it('getAll', async () => {
  //   assert.equal(true, true, 'true')

  //   await contract.mint(accounts[1], 'URI 1', { from: accounts[0] })
  //   await contract.mint(accounts[1], 'URI 2', { from: accounts[0] })

  //   const allTokenIds = await contract.getAll({ from: accounts[1] })
  //   console.log('allTokenIds')
  //   console.log(allTokenIds)

  //   const tokenURIs = []
  //   for (let i = 0; i < allTokenIds.length; ++i) {
  //     const tokenURI = await contract.tokenURI(allTokenIds[i])
  //     tokenURIs.push(tokenURI)
  //   }

  //   console.log('tokenURIs')
  //   console.log(tokenURIs)
  // })
})
