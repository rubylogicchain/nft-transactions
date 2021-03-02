const MyBetterERC721 = artifacts.require('./MyBetterERC721.sol')

contract('MyBetterERC721', accounts => {
  const COMMISSION = 10
  const PRICE = web3.utils.toWei('0.1')

  let contract, tokenId

  it('gets deployed contract', async () => {
    contract = await MyBetterERC721.deployed()
    assert.exists(contract, 'token exists')
  })

  it('mints token with value and commission', async () => {
    const VALUE = 'Some value'

    await contract.mint(accounts[1], VALUE, COMMISSION, { from: accounts[0] })

    tokenId = await contract.tokenOfOwnerByIndex(accounts[1], 0)
    const value = await contract.getValue(tokenId)
    const commission = await contract.getCommission(accounts[1], tokenId)

    assert.equal(value, VALUE, 'value is the same as VALUE')
    assert.equal(commission, COMMISSION, 'commission is the same as COMMISSION')
  })

  it('adds buy request', async () => {
    const balancesBefore = await Promise.all([
      web3.eth.getBalance(contract.address),
      web3.eth.getBalance(accounts[2]),
    ])

    await contract.requestBuy(tokenId, COMMISSION, {
      from: accounts[2],
      value: PRICE,
    })

    await contract.requestBuy(tokenId, COMMISSION, {
      from: accounts[3],
      value: PRICE,
    })

    const buyRequests = await contract.getBuyRequests(tokenId)
    assert.equal(buyRequests.length, 2, 'There are two buy requests')

    const buyRequest = buyRequests[0]
    assert.equal(buyRequest.buyer, accounts[2], 'Buyer is the second account')
    assert.equal(buyRequest.price, PRICE, 'price is equal to PRICE')

    const balancesAfter = await Promise.all([
      web3.eth.getBalance(contract.address),
      web3.eth.getBalance(accounts[2]),
    ])

    assert.equal(
      Number(balancesAfter[0]) > Number(balancesBefore[0]),
      true,
      'Contract received ether'
    )

    assert.equal(
      Number(balancesAfter[1]) < Number(balancesBefore[1]),
      true,
      'Buyer spent ether'
    )
  })

  it('sells the token', async () => {
    const balanceBefore = await web3.eth.getBalance(accounts[1])

    await contract.sell(accounts[1], accounts[2], tokenId, {
      from: accounts[1],
    })

    const balanceAfter = await web3.eth.getBalance(accounts[1])

    assert.equal(
      Number(balanceAfter) > Number(balanceBefore),
      true,
      'First account received ether'
    )

    const owner = await contract.ownerOf(tokenId)
    assert.equal(owner, accounts[2], 'owner is the second account')

    const buyRequests = await contract.getBuyRequests(tokenId)
    assert.equal(buyRequests.length, 0, 'There is no buy request')
  })

  it('gives commissions to previous holders', async () => {
    const balanceBefore = await web3.eth.getBalance(accounts[1])

    await contract.requestBuy(tokenId, 1, {
      from: accounts[3],
      value: PRICE,
    })

    await contract.sell(accounts[2], accounts[3], tokenId, {
      from: accounts[2],
    })

    const balanceAfter = await web3.eth.getBalance(accounts[1])

    assert.equal(
      Number(balanceAfter) > Number(balanceBefore),
      true,
      'First account received ether'
    )
  })
})
