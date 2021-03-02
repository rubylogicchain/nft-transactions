import React from 'react'

const SimpleStorage = ({ accounts, simpleStorageContract }) => {
  const [value, setValue] = React.useState(null)
  const [inputValue, setInputValue] = React.useState(null)

  React.useEffect(() => {
    const runAsync = async () => {
      const value = await simpleStorageContract.methods.get().call()
      setValue(value)
      setInputValue(value)
    }

    simpleStorageContract && runAsync()
  }, [simpleStorageContract])

  const handleSaveValue = async () => {
    await simpleStorageContract.methods
      .set(inputValue)
      .send({ from: accounts[0] })
    setValue(await simpleStorageContract.methods.get().call())
  }

  return (
    <div>
      <h5>SimpleStorage</h5>
      <div>
        <label>Enter value: </label>
        <input
          value={inputValue || ''}
          onChange={e => setInputValue(e.target.value)}
          disabled={inputValue === null}
        />
      </div>
      <div>
        <button onClick={handleSaveValue}>Save value</button>
      </div>
      <div>
        <p>Current value is {value}</p>
      </div>
    </div>
  )
}

export default SimpleStorage
