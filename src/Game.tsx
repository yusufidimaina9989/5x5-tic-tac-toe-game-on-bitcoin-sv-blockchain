import { useState } from "react";
import Board from './Board';
import { TicTacToe } from "./contracts/tictactoe";
import { GameData, SquareData } from "./types";
import { Utils } from "./utils";
import { bsv, SignatureResponse, findSig, MethodCallOptions, toHex } from 'scrypt-ts';

const calculateWinner = (squares: any) => {
  const lines = [
    // Rows
    [0, 1, 2, 3, 4],
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 6],
    [5, 6, 7, 8, 9],
    [6, 7, 8, 9, 10],
    [7, 8, 9, 10, 11],
    [10, 11, 12, 13, 14],
    [11, 12, 13, 14, 15],
    [12, 13, 14, 15, 16],
    [15, 16, 17, 18, 19],
    [16, 17, 18, 19, 20],
    [17, 18, 19, 20, 21],
    [20, 21, 22, 23, 24],
    [21, 22, 23, 24, 25],
    [22, 23, 24, 25, 26],
    [25, 26, 27, 28, 29],
    [26, 27, 28, 29, 30],
    [27, 28, 29, 30, 31],
    [30, 31, 32, 33, 34],
    [31, 32, 33, 34, 35],
    [32, 33, 34, 35, 36],
    [35, 36, 37, 38, 39],
    [36, 37, 38, 39, 40],
    [37, 38, 39, 40, 41],
    [40, 41, 42, 43, 44],
    [41, 42, 43, 44, 45],
    [42, 43, 44, 45, 46],
    [45, 46, 47, 48, 49],
    [46, 47, 48, 49, 50],
    [47, 48, 49, 50, 51],
    [50, 51, 52, 53, 54],
    [51, 52, 53, 54, 55],
    [52, 53, 54, 55, 56],

    // Columns
    [0, 5, 10, 15, 20],
    [5, 10, 15, 20, 25],
    [10, 15, 20, 25, 30],
    [15, 20, 25, 30, 35],
    [20, 25, 30, 35, 40],
    [25, 30, 35, 40, 45],
    [30, 35, 40, 45, 50],
    [35, 40, 45, 50, 55],
    [40, 45, 50, 55, 60],
    [1, 6, 11, 16, 21],
    [6, 11, 16, 21, 26],
    [11, 16, 21, 26, 31],
    [16, 21, 26, 31, 36],
    [21, 26, 31, 36, 41],
    [26, 31, 36, 41, 46],
    [31, 36, 41, 46, 51],
    [36, 41, 46, 51, 56],
    [41, 46, 51, 56, 61],
    [2, 7, 12, 17, 22],
    [7, 12, 17, 22, 27],
    [12, 17, 22, 27, 32],
    [17, 22, 27, 32, 37],
    [22, 27, 32, 37, 42],
    [27, 32, 37, 42, 47],
    [32, 37, 42, 47, 52],
    [37, 42, 47, 52, 57],
    [42, 47, 52, 57, 62],
    [3, 8, 13, 18, 23],
    [8, 13, 18, 23, 28],
    [13, 18, 23, 28, 33],
    [18, 23, 28, 33, 38],
    [23, 28, 33, 38, 43],
    [28, 33, 38, 43, 48],
    [33, 38, 43, 48, 53],
    [38, 43, 48, 53, 58],
    [43, 48, 53, 58, 63],
    [4, 9, 14, 19, 24],
    [9, 14, 19, 24, 29],
    [14, 19, 24, 29, 34],
    [19, 24, 29, 34, 39],
    [24, 29, 34, 39, 44],
    [29, 34, 39, 44, 49],
    [34, 39, 44, 49, 54],
    [39, 44, 49, 54, 59],
    [44, 49, 54, 59, 64],
    [5, 10, 15, 20, 25],
    [10, 15, 20, 25, 30],
    [15, 20, 25, 30, 35],
    [20, 25, 30, 35, 40],
    [25, 30, 35, 40, 45],
    [30, 35, 40, 45, 50],
    [35, 40, 45, 50, 55],
    [40, 45, 50, 55, 60],
    [45, 50, 55, 60, 65],
];

for (let i = 0; i < lines.length; i += 1) {
  // Destructuring the line array into variables a, b, c, d, and e
  const [a, b, c, d, e] = lines[i];

  // Checking if squares at positions a, b, c, d, and e are truthy and have equal labels
  if (squares[a] && squares[b] && squares[c] &&
      squares[d] && squares[e] &&
      squares[a].label === squares[b].label &&
      squares[a].label === squares[c].label &&
      squares[a].label === squares[d].label &&
      squares[a].label === squares[e].label) {
      
      // Returning information about the winner and the winning row
      return { winner: squares[a], winnerRow: lines[i] };
  }
}


  return { winner: null, winnerRow: null };
};



function Game(props: any) {

  const gameData = props.gameData as GameData;
  const setGameData = props.setGameData;

  const [lastTxId, setLastTxId] = useState<string>("")

  function canMove(i: number, squares: any) {
    if (calculateWinner(squares).winner || squares[i]) {
      return false;
    }

    return true;
  }

  async function move(i: number) {
    const current = props.contract as TicTacToe;

    current.bindTxBuilder('move', TicTacToe.buildTxForMove);

    const pubKey = current.isAliceTurn ? current.alice : current.bob;

    return current.methods.move(
      BigInt(i),
      (sigResponses: SignatureResponse[]) => {
        return findSig(sigResponses, bsv.PublicKey.fromString(pubKey))
      },
      {
        pubKeyOrAddrToSign: bsv.PublicKey.fromString(pubKey),
        changeAddress: await current.signer.getDefaultAddress()
      } as MethodCallOptions<TicTacToe>)
  }

  async function handleClick(i: number) {
    if (!gameData.start) {
      alert(`Game hasn't been started yet.`)
      return;
    }
    
    const history = gameData.history.slice(0, gameData.currentStepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
  

    if (!canMove(i, squares)) {
      console.error('can not move now!')
      return;
    }

    squares[i] = {
      label: gameData.isAliceTurn ? 'X' : 'O',
      n: history.length
    };

    // Call smart contract move method.

    try {
      const { tx, nexts } = await move(i);

      const square = squares[i] as SquareData;
      if (square) {
        square.tx = tx.id;
      }
  
      console.log('move txid:', tx.id)
  
      // update states
      if (nexts && nexts[0]) {
        const instance = nexts[0].instance
        props.setContract(instance)
      }
      const winner = calculateWinner(squares).winner;
      setGameData({
        ...gameData,
        history: history.concat([
          {
            squares
          },
        ]),
        isAliceTurn: winner ? gameData.isAliceTurn : !gameData.isAliceTurn,
        currentStepNumber: history.length,
        start: true
      })
      setLastTxId(tx.id)
    } catch (error) {
      console.error("error:", error);
      alert("ERROR:" + error)
    }
   
  }


  const { history } = gameData;
  const current = history[gameData.currentStepNumber];
  const { winner, winnerRow } = calculateWinner(current.squares);


  let status;

  let icon;


  if (!gameData.isAliceTurn) {
    icon = <div className="bob"> Bob <img src="bob.png" alt="" /></div>
  } else {
    icon = <div className="alice"> Alice <img src="images/bob.png" alt="" /></div>
  }

  if (winner) {
    let winnerName = winner.label === 'X' ? 'Alice' : 'Bob';
    status = `Winner is ${winnerName}`;
  } else if (history.length === 26) {
    status = 'Draw. No one won.';
  } else {

    let nexter = gameData.isAliceTurn ? 'Alice' : 'Bob';

    status = `Next player: ${nexter}`;
  }

  return (
    <div className="game" >
      <div className="game-board" >

        <div className="game-title" >
          {icon}
          < div className="game-status" > {status} </div>
        </div>

        < Board
          squares={current.squares}
          winnerSquares={winnerRow}
          onClick={handleClick}
        />

        <div className="game-bottom" >
          {props.deployedTxId ? <div className="bet"><a href={Utils.getTxUri(props.deployedTxId)} target="_blank" rel="noreferrer" >Deploy transaction</a> </div> : undefined}
          {winner || history.length === 26 ? <div className="end"><a href={Utils.getTxUri(lastTxId)} target="_blank" rel="noreferrer" >Withdraw transaction</a> </div> : undefined}
        </div>
      </div>
    </div>);
}

export default Game;
