import {
    prop, method, SmartContract, PubKey, FixedArray, assert, Sig, Utils, toByteString, hash160,
    hash256,
    fill,
    ContractTransaction,
    MethodCallOptions,
    bsv
} from "scrypt-ts";

export class TicTacToe extends SmartContract {
    @prop()
    alice: PubKey;
    @prop()
    bob: PubKey;

    @prop(true)
    isAliceTurn: boolean;

    @prop(true)
    board: FixedArray<bigint, 25>;

    static readonly EMPTY: bigint = 0n;
    static readonly ALICE: bigint = 1n;
    static readonly BOB: bigint = 2n;

    constructor(alice: PubKey, bob: PubKey) {
        super(...arguments)
        this.alice = alice;
        this.bob = bob;
        this.isAliceTurn = true;
        this.board = fill(TicTacToe.EMPTY, 25);
    }

    @method()
    public move(n: bigint, sig: Sig) {
        // check position `n`
        assert(n >= 0n && n < 25n);
        // check signature `sig`
        let player: PubKey = this.isAliceTurn ? this.alice : this.bob;
        assert(this.checkSig(sig, player), `checkSig failed, pubkey: ${player}`);
        // update stateful properties to make the move
        assert(this.board[Number(n)] === TicTacToe.EMPTY, `board at position ${n} is not empty: ${this.board[Number(n)]}`);
        let play = this.isAliceTurn ? TicTacToe.ALICE : TicTacToe.BOB;
        this.board[Number(n)] = play;
        this.isAliceTurn = !this.isAliceTurn;
        
        // build the transation outputs
        let outputs = toByteString('');
        if (this.won(play)) {
            outputs = Utils.buildPublicKeyHashOutput(hash160(player), this.ctx.utxo.value);
        }
        else if (this.full()) {
            const halfAmount = this.ctx.utxo.value / 2n;
            const aliceOutput = Utils.buildPublicKeyHashOutput(hash160(this.alice), halfAmount);
            const bobOutput = Utils.buildPublicKeyHashOutput(hash160(this.bob), halfAmount);
            outputs = aliceOutput + bobOutput;
        }
        else {
            // build a output that contains latest contract state.
            outputs = this.buildStateOutput(this.ctx.utxo.value);
        }

        if (this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }
        // make sure the transaction contains the expected outputs built above
        assert(this.ctx.hashOutputs === hash256(outputs), "check hashOutputs failed");
    }

    @method()
    won(play: bigint): boolean {
        let lines: FixedArray<FixedArray<bigint, 5>, 87> = [
            // Rows
            [0n, 1n, 2n, 3n, 4n],
            [1n, 2n, 3n, 4n, 5n],
            [2n, 3n, 4n, 5n, 6n],
            [5n, 6n, 7n, 8n, 9n],
            [6n, 7n, 8n, 9n, 10n],
            [7n, 8n, 9n, 10n, 11n],
            [10n, 11n, 12n, 13n, 14n],
            [11n, 12n, 13n, 14n, 15n],
            [12n, 13n, 14n, 15n, 16n],
            [15n, 16n, 17n, 18n, 19n],
            [16n, 17n, 18n, 19n, 20n],
            [17n, 18n, 19n, 20n, 21n],
            [20n, 21n, 22n, 23n, 24n],
            [21n, 22n, 23n, 24n, 25n],
            [22n, 23n, 24n, 25n, 26n],
            [25n, 26n, 27n, 28n, 29n],
            [26n, 27n, 28n, 29n, 30n],
            [27n, 28n, 29n, 30n, 31n],
            [30n, 31n, 32n, 33n, 34n],
            [31n, 32n, 33n, 34n, 35n],
            [32n, 33n, 34n, 35n, 36n],
            [35n, 36n, 37n, 38n, 39n],
            [36n, 37n, 38n, 39n, 40n],
            [37n, 38n, 39n, 40n, 41n],
            [40n, 41n, 42n, 43n, 44n],
            [41n, 42n, 43n, 44n, 45n],
            [42n, 43n, 44n, 45n, 46n],
            [45n, 46n, 47n, 48n, 49n],
            [46n, 47n, 48n, 49n, 50n],
            [47n, 48n, 49n, 50n, 51n],
            [50n, 51n, 52n, 53n, 54n],
            [51n, 52n, 53n, 54n, 55n],
            [52n, 53n, 54n, 55n, 56n],
        
            // Columns
            [0n, 5n, 10n, 15n, 20n],
            [5n, 10n, 15n, 20n, 25n],
            [10n, 15n, 20n, 25n, 30n],
            [15n, 20n, 25n, 30n, 35n],
            [20n, 25n, 30n, 35n, 40n],
            [25n, 30n, 35n, 40n, 45n],
            [30n, 35n, 40n, 45n, 50n],
            [35n, 40n, 45n, 50n, 55n],
            [40n, 45n, 50n, 55n, 60n],
            [1n, 6n, 11n, 16n, 21n],
            [6n, 11n, 16n, 21n, 26n],
            [11n, 16n, 21n, 26n, 31n],
            [16n, 21n, 26n, 31n, 36n],
            [21n, 26n, 31n, 36n, 41n],
            [26n, 31n, 36n, 41n, 46n],
            [31n, 36n, 41n, 46n, 51n],
            [36n, 41n, 46n, 51n, 56n],
            [41n, 46n, 51n, 56n, 61n],
            [2n, 7n, 12n, 17n, 22n],
            [7n, 12n, 17n, 22n, 27n],
            [12n, 17n, 22n, 27n, 32n],
            [17n, 22n, 27n, 32n, 37n],
            [22n, 27n, 32n, 37n, 42n],
            [27n, 32n, 37n, 42n, 47n],
            [32n, 37n, 42n, 47n, 52n],
            [37n, 42n, 47n, 52n, 57n],
            [42n, 47n, 52n, 57n, 62n],
            [3n, 8n, 13n, 18n, 23n],
            [8n, 13n, 18n, 23n, 28n],
            [13n, 18n, 23n, 28n, 33n],
            [18n, 23n, 28n, 33n, 38n],
            [23n, 28n, 33n, 38n, 43n],
            [28n, 33n, 38n, 43n, 48n],
            [33n, 38n, 43n, 48n, 53n],
            [38n, 43n, 48n, 53n, 58n],
            [43n, 48n, 53n, 58n, 63n],
            [4n, 9n, 14n, 19n, 24n],
            [9n, 14n, 19n, 24n, 29n],
            [14n, 19n, 24n, 29n, 34n],
            [19n, 24n, 29n, 34n, 39n],
            [24n, 29n, 34n, 39n, 44n],
            [29n, 34n, 39n, 44n, 49n],
            [34n, 39n, 44n, 49n, 54n],
            [39n, 44n, 49n, 54n, 59n],
            [44n, 49n, 54n, 59n, 64n],
            [5n, 10n, 15n, 20n, 25n],
            [10n, 15n, 20n, 25n, 30n],
            [15n, 20n, 25n, 30n, 35n],
            [20n, 25n, 30n, 35n, 40n],
            [25n, 30n, 35n, 40n, 45n],
            [30n, 35n, 40n, 45n, 50n],
            [35n, 40n, 45n, 50n, 55n],
            [40n, 45n, 50n, 55n, 60n],
            [45n, 50n, 55n, 60n, 65n],
        ];
        
        let anyLine = false;

        for (let i = 0; i < 87; i++) {
            let line = true;
            for (let j = 0; j < 5; j++) {
                line = line && this.board[Number(lines[i][j])] === play;
            }

            anyLine = anyLine || line;
        }

        return anyLine;
    }

    @method()
    full(): boolean {
        let full = true;
        for (let i = 0; i < 25; i++) {
            full = full && this.board[i] !== TicTacToe.EMPTY;
        }
        return full;
    }

    static buildTxForMove(
        current: TicTacToe,
        options: MethodCallOptions<TicTacToe>,
        n: bigint
    ): Promise<ContractTransaction> {
        const play = current.isAliceTurn ? TicTacToe.ALICE : TicTacToe.BOB
        const nextInstance = current.next()
        nextInstance.board[Number(n)] = play
        nextInstance.isAliceTurn = !current.isAliceTurn

        const unsignedTx: bsv.Transaction = new bsv.Transaction().addInput(
            current.buildContractInput(options.fromUTXO)
        )

        if (nextInstance.won(play)) {
            const script = Utils.buildPublicKeyHashScript(
                hash160(current.isAliceTurn ? current.alice : current.bob)
            )
            unsignedTx
                .addOutput(
                    new bsv.Transaction.Output({
                        script: bsv.Script.fromHex(script),
                        satoshis: current.balance,
                    })
                )
            
            if (options.changeAddress) {
                unsignedTx.change(options.changeAddress)
            }

            return Promise.resolve({
                tx: unsignedTx,
                atInputIndex: 0,
                nexts: [],
            })
        }

        if (nextInstance.full()) {
            const halfAmount = current.balance / 2

            unsignedTx
                .addOutput(
                    new bsv.Transaction.Output({
                        script: bsv.Script.fromHex(
                            Utils.buildPublicKeyHashScript(
                                hash160(current.alice)
                            )
                        ),
                        satoshis: halfAmount,
                    })
                )
                .addOutput(
                    new bsv.Transaction.Output({
                        script: bsv.Script.fromHex(
                            Utils.buildPublicKeyHashScript(hash160(current.bob))
                        ),
                        satoshis: halfAmount,
                    })
                )

            if (options.changeAddress) {
                unsignedTx.change(options.changeAddress)
            }

            return Promise.resolve({
                tx: unsignedTx,
                atInputIndex: 0,
                nexts: [],
            })
        }

        unsignedTx
            .setOutput(0, () => {
                return new bsv.Transaction.Output({
                    script: nextInstance.lockingScript,
                    satoshis: current.balance,
                })
            })
            
            
        if (options.changeAddress) {
            unsignedTx.change(options.changeAddress)
        }
        

        const nexts = [
            {
                instance: nextInstance,
                atOutputIndex: 0,
                balance: current.balance,
            },
        ]

        return Promise.resolve({
            tx: unsignedTx,
            atInputIndex: 0,
            nexts,
            next: nexts[0],
        })

    }
}
