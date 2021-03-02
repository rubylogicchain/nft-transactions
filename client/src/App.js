import React from 'react'
import { useData } from './lib/getData'

import SimpleStorage from './SimpleStorage'
import MyERC721 from './MyERC721'

const App = () => {
  const data = useData()
  const { web3Ref, accounts } = data

  if (!web3Ref.current) {
    return <div>Loading Web3, accounts, and contract...</div>
  }

  return (
    <div className='App'>
      {accounts && accounts[0] && <h5>Your account: {accounts[0]}</h5>}
      <MyERC721 {...data} />
      <hr />
      <SimpleStorage {...data} />
    </div>
  )
}

export default App
