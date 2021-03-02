import React from 'react'

const MyERC721 = ({ accounts, myERC721Contract }) => {
  const [tokens, setTokens] = React.useState([])
  const [transferToken, setTransferToken] = React.useState()
  const [transferTo, setTransferTo] = React.useState('')

  React.useEffect(() => {
    const runAsync = async () => {
      const balance = Number(
        await myERC721Contract.methods
          .balanceOf(accounts[0])
          .call({ from: accounts[0] })
      )

      if (!balance) {
        return
      }

      const tokens = await Promise.all(
        [...Array(balance).keys()].map(async i => {
          const tokenId = await myERC721Contract.methods
            .tokenOfOwnerByIndex(accounts[0], i)
            .call()
          const tokenURI = await myERC721Contract.methods
            .tokenURI(tokenId)
            .call()
          return { id: tokenId, uri: tokenURI }
        })
      )

      setTokens(tokens)
    }

    myERC721Contract && accounts[0] && runAsync()
  }, [myERC721Contract, accounts])

  const handleTransfer = async () => {
    try {
      await myERC721Contract.methods
        .transferFrom(accounts[0], transferTo, transferToken.id)
        .send({ from: accounts[0] })

      setTransferTo('')
      setTransferToken(null)
      setTokens(tokens => tokens.filter(({ id }) => id !== transferToken.id))
    } catch (err) {
      console.error(err)
      alert('Could not transfer the token!')
    }
  }

  return (
    <div>
      <h5>MyERC721</h5>
      <div>Tokens:</div>
      <ul>
        {tokens.map(token => (
          <li key={token.id}>
            {`${token.uri} `}
            <button onClick={() => setTransferToken(token)}>transfer</button>
          </li>
        ))}
      </ul>
      {transferToken && (
        <div>
          <div>Transfer token: {transferToken.uri}</div>
          <div>
            <label>To:</label>
            <input
              value={transferTo}
              onChange={e => setTransferTo(e.target.value)}
            />
          </div>
          <div>
            <button onClick={handleTransfer}>TRANSFER</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyERC721
