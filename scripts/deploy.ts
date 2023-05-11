import { TicTacToe } from '../src/contracts/ticTacToe'
import { privateKey } from './privateKey'
import { bsv, TestWallet, DefaultProvider } from 'scrypt-ts'


async function main() {
    await TicTacToe.compile()

    // Prepare signer. 
    // See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
    const signer = new TestWallet(privateKey, new DefaultProvider({
        network: bsv.Networks.testnet
    }))

    // TODO: Adjust the amount of satoshis locked in the smart contract:
    const amount = 100

    const instance = new TicTacToe(
        // TODO: Pass constructor parameter values.
        0n
    )

    // Connect to a signer.
    await instance.connect(signer)

    // Contract deployment.
    const deployTx = await instance.deploy(amount)
    console.log('TicTacToe contract deployed: ', deployTx.id)
}

main()
