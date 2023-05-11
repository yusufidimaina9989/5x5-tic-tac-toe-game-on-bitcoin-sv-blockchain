import React, { useState, useEffect } from "react"; 
 import Board from './Board'; 
 import { GameData } from "./types"; 
  
  
 const calculateWinner = (squares: any) => { 
   const lines = [ 
        [0, 1, 2],
    [1, 2, 3],
    [2, 3, 4],
    [5, 6, 7],
    [6, 7, 8],
    [7, 8, 9],
    [10, 11, 12],
    [11, 12, 13],
    [12, 13, 14],
    [15, 16, 17],
    [16, 17, 18],
    [17, 18, 19],
    [20, 21, 22],
    [21, 22, 23],
    [22, 23, 24],
    [0, 5, 10],
    [5, 10, 15],
    [10, 15, 20],
    [1, 6, 11],
    [6, 11, 16],
    [11, 16, 21],
    [2, 7, 12],
    [7, 12, 17],
    [12, 17, 22],
    [3, 8, 13],
    [8, 13, 18],
    [13, 18, 23],
    [4, 9, 14],
    [9, 14, 19],
    [14, 19, 24],
    [2, 6, 10],
    [3, 7, 11],
    [7, 11, 15],
    [4, 8, 12],
    [8, 12, 16],
    [12, 16, 20],
    [9, 13, 17],
    [13, 17, 21],
    [14, 18, 22],
    [2, 8, 14],
    [1, 7, 13],
    [7, 13, 19],
    [0, 6, 12],
    [6, 12, 18],
    [12, 18, 24],
    [5, 11, 17],
    [11, 17, 23],
    [10, 16, 22],
   ]; 
  
   for (let i = 0; i < lines.length; i += 1) { 
     const [a, b, c] = lines[i]; 
     if (squares[a] && squares[b] && squares[c] && squares[a].label === squares[b].label && squares[a].label === squares[c].label) { 
       return { winner: squares[a], winnerRow: lines[i] }; 
     } 
   } 
  
   return { winner: null, winnerRow: null }; 
 }; 
  
  
  
 function Game(props: any) { 
  
   const gameData = props.gameData as GameData; 
   const setGameData = props.setGameData; 
   function canMove(i: number, squares: any) { 
     if (!gameData.start) { 
       alert("Please start the game!"); 
       return; 
     } 
  
     if (calculateWinner(squares).winner || squares[i]) { 
       return false; 
     } 
  
     return true; 
   } 
  
   async function handleClick(i: number) { 
     const history = gameData.history.slice(0, gameData.currentStepNumber + 1); 
     const current = history[history.length - 1]; 
     const squares = current.squares.slice(); 
  
  
     if (!canMove(i, squares)) { 
       console.error('can not move now!') 
       return; 
     } 
  
     squares[i] = { 
       label: gameData.isAliceTurn ? 'X' : 'O', 
       n: history.length 
     }; 
  
     let winner = calculateWinner(squares).winner; 
  
     const gameData_ = { 
       history: history.concat([ 
         { 
           squares 
         }, 
       ]), 
       isAliceTurn: winner ? gameData.isAliceTurn : !gameData.isAliceTurn, 
       currentStepNumber: history.length, 
       start: true 
     } 
  
     // update states 
     setGameData(gameData_) 
   } 
  
  
  
  
  
  
   const { history } = gameData; 
   const current = history[gameData.currentStepNumber]; 
   const { winner, winnerRow } = calculateWinner(current.squares); 
  
  
   let status; 
   let end; 
  
   let icon; 
  
  
   if (!gameData.isAliceTurn) { 
     icon = <div className="bob" > Bob <img src="./bob.png" alt="" /></div> 
   } else { 
     icon = <div className="alice" > Alice <img src="./alice.jpg" alt="" /></div> 
   } 
  
   if (winner) { 
     let winnerName = winner.label === 'X' ? 'Alice' : 'Bob'; 
     status = `Winner is ${winnerName}`; 
   } else if (history.length === 26) { 
     status = 'Draw. No one won.'; 
   } else { 
  
     let nexter = gameData.isAliceTurn ? 'Alice' : 'Bob'; 
  
     status = `Next player: ${nexter}`; 
   } 
  
   return ( 
     <div className="game" > 
       <div className="game-board" > 
  
         <div className="game-title" > 
           {icon} 
           < div className="game-status" > {status} </div> 
         </div> 
  
         < Board 
           squares={current.squares} 
           winnerSquares={winnerRow} 
           onClick={handleClick} 
         /> 
  
         <div className="game-bottom" > 
           {end} 
         </div> 
       </div> 
     </div>); 
 } 
  
 export default Game;