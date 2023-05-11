import { prop, method, SmartContract, PubKey, FixedArray, assert, Sig, Utils, toByteString, hash160, fill, 
    hash256} from "scrypt-ts";

    export class TicTacToe extends SmartContract {
        @prop()
        alice: PubKey;
        @prop()
        bob: PubKey;
    
        @prop(true)
        is_alice_turn: boolean;
    
        @prop(true)
        board: FixedArray<bigint, 25>;
    
        @prop()
        static readonly EMPTY: bigint = 0n;
        @prop()
        static readonly ALICE: bigint = 1n;
        @prop()
        static readonly BOB: bigint = 2n;
    
        constructor(alice: PubKey, bob: PubKey) {
            super(...arguments)
            this.alice = alice;
            this.bob = bob;
            this.is_alice_turn = true;
            this.board = fill(TicTacToe.EMPTY, 25);
        }
    
        @method()
        public move(n: bigint, sig: Sig) {
            // check position `n`
            assert(n >= 0n && n < 25n);
            // check signature `sig`
            let player: PubKey = this.is_alice_turn ? this.alice : this.bob;
            assert(this.checkSig(sig, player), `checkSig failed, pubkey: ${player}`);
            // update stateful properties to make the move
            assert(this.board[Number(n)] === TicTacToe.EMPTY, `board at position ${n} is not empty: ${this.board[Number(n)]}`);
            let play = this.is_alice_turn ? TicTacToe.ALICE : TicTacToe.BOB;
            this.board[Number(n)] = play;
            this.is_alice_turn = !this.is_alice_turn;
    
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
            let lines: FixedArray<FixedArray<bigint, 3>, 48> = [
                [0n, 1n, 2n],
                [1n, 2n, 3n],
                [2n, 3n, 4n],
                [5n, 6n, 7n],
                [6n, 7n, 8n],
                [7n, 8n, 9n],
                [10n, 11n, 12n],
                [11n, 12n, 13n],
                [12n, 13n, 14n],
                [15n, 16n, 17n],
                [16n, 17n, 18n],
                [17n, 18n, 19n],
                [20n, 21n, 22n],
                [21n, 22n, 23n],
                [22n, 23n, 24n],
                [0n, 5n, 10n],
                [5n, 10n, 15n],
                [10n, 15n, 20n],
                [1n, 6n, 11n],
                [6n, 11n, 16n],
                [11n, 16n, 21n],
                [2n, 7n, 12n],
                [7n, 12n, 17n],
                [12n, 17n, 22n],
                [3n, 8n, 13n],
                [8n, 13n, 18n],
                [13n, 18n, 23n],
                [4n, 9n, 14n],
                [9n, 14n, 19n],
                [14n, 19n, 24n],
                [2n, 6n, 10n],
                [3n, 7n, 11n],
                [7n, 11n, 15n],
                [4n, 8n, 12n],
                [8n, 12n, 16n],
                [12n, 16n, 20n],
                [9n, 13n, 17n],
                [13n, 17n, 21n],
                [14n, 18n, 22n],
                [2n, 8n, 14n],
                [1n, 7n, 13n],
                [7n, 13n, 19n],
                [0n, 6n, 12n],
                [6n, 12n, 18n],
                [12n, 18n, 24n],
                [5n, 11n, 17n],
                [11n, 17n, 23n],
                [10n, 16n, 22n]
            ];
    
            let anyLine = false;
    
            for (let i = 0; i < 48; i++) {
                let line = true;
                for (let j = 0; j < 3; j++) {
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
    
    }