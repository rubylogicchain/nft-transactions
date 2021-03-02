import { useState, useEffect, useRef } from 'react'
import SimpleStorageContract from '../contracts/SimpleStorage.json'
import MyERC721Contract from '../contracts/MyERC721.json'
import getWeb3 from './getWeb3'

const getData = async () => {
  const web3 = await getWeb3()
  const accounts = await web3.eth.getAccounts()

  const networkId = await web3.eth.net.getId()

  const simpleStorageContract = new web3.eth.Contract(
    SimpleStorageContract.abi,
    SimpleStorageContract.networks[networkId].address
  )

  const myERC721Contract = new web3.eth.Contract(
    MyERC721Contract.abi,
    MyERC721Contract.networks[networkId].address
  )

  return { web3, accounts, simpleStorageContract, myERC721Contract }
}

export const useData = () => {
  const web3Ref = useRef()
  const [accounts, setAccounts] = useState(null)
  const [simpleStorageContract, setSimpleStorageContract] = useState(null)
  const [myERC721Contract, setMyERC721Contract] = useState(null)

  useEffect(() => {
    const runAsync = async () => {
      const { web3, accounts, ...contracts } = await getData()

      web3Ref.current = web3
      setAccounts(accounts)
      setSimpleStorageContract(contracts.simpleStorageContract)
      setMyERC721Contract(contracts.myERC721Contract)
    }

    runAsync()
  }, [])

  return { web3Ref, accounts, simpleStorageContract, myERC721Contract }
}

export default getData
