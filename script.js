import validateFEN from './fen-validator/index.js';
import { move, status, getFen }  from './js-chess-engine/lib/js-chess-engine.mjs';

const fenPositions = ['a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8', 'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7', 'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6', 'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5', 'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4', 'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3', 'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2', 'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'];
const pieces = ['r', 'n', 'b', 'q', 'k', 'p', 'R', 'N', 'B', 'Q', 'K', 'P'];
const speed = 300;

let puzzle_solved = false;
let currentPuzzle = '';
let currentFEN = '';
let currentStatus = '';
let lastPuzzleMoveIndex = 0;

window.addEventListener("DOMContentLoaded", (event) => {
    setUpBoard();
    loadRandomPuzzle();
});

function setUpBoard() {
    document.getElementById("no-js").remove();

    const board = document.getElementById('board');
    const squares = board.querySelectorAll('div');
    squares.forEach(square => {
        square.addEventListener('pointerdown', function () {
            squareClicked(square)
        });
    });

    const squareClicked = (square) => {
        console.log(`${square} was clicked!`);
        if (puzzle_solved) {
            return;
        }
        // You may be temped to refactor, but why?
        // unselectAll is catching **edge case** for multiple selected squares
        // you still need to unselect the selected square, if user wants to undo selection
        if (square.classList.contains('selected')) {
            unselectAll();
        } else if (square.classList.contains('circle')) {
            const selected = document.querySelector('.selected');
            unselectAll();
            playerMove(selected.id, square.id);
        } else {
            unselectAll();

            let containsPiece = false;
            for (let i = 0; i < pieces.length; i++) {
                if (square.classList.contains(pieces[i])) {
                    containsPiece = true;
                    break
                }
            }

            // only add selected if piece exists
            if (containsPiece) {
                selectPiece(square);
            }
        }
    }

    document.getElementById('random-puzzle').addEventListener('click', () => {
        loadRandomPuzzle();
    });
}

function unselectAll() {
    const board = document.getElementById('board');
    const squares = board.querySelectorAll('div');
    squares.forEach(square => {
        square.classList.remove('selected');
        square.classList.remove('circle');
    });
}

function clearBoard() {
    const board = document.getElementById('board');
    const squares = board.querySelectorAll('div');
    squares.forEach(square => {
        square.classList = '';
    });
}

function loadBoard(fen) {
    const fenArr = fen.split(' ');
    const piecePlacement = fenArr[0];

    clearBoard();

    // replace numbers with spaces and remove forward slashes
    let newPiecePlacement = piecePlacement.replace(/[0-8/]/g, (match) => {
        if (match === '/') {
            return ''; // remove forward slash
        } else {
            return " ".repeat(parseInt(match)); // repeat " " for the number of times matched
        }
    });

    // add pieces to board
    for (let i = 0; i < newPiecePlacement.length; i++) {
        const square = document.getElementById(fenPositions[i]);
        if (newPiecePlacement[i] !== ' ') {
            square.classList.add(newPiecePlacement[i]);
        }
    }
}

function flipBoard(shouldFlip) {
    const board = document.getElementById('board');
    if (shouldFlip) {
        board.classList.add('flip');
    } else {
        board.classList.remove('flip');
    }
}

function selectPiece(element) {

    const selectedPiece = currentStatus.pieces[element.id.toUpperCase()];

    let canSelectPiece = false;
    if(currentStatus.turn === 'white' && selectedPiece === selectedPiece.toUpperCase()) {
        // white turn and white piece selected
        canSelectPiece = true;
    } else if(currentStatus.turn === 'black' && selectedPiece === selectedPiece.toLowerCase()) {
        // black turn and black piece selected
        canSelectPiece = true;
    }

    const selectedPieceValidMoves = currentStatus.moves[element.id.toUpperCase()];

    if(canSelectPiece) {
        element.classList.add('selected');

        for (let i = 0; i < selectedPieceValidMoves?.length; i++) {
            const square = document.getElementById(selectedPieceValidMoves[i].toLowerCase());
            square.classList.add('circle');
        }
    }
}

function computerMove(from, to) {
    // wait 1 second then move piece
    setTimeout(() => {
        movePiece(from, to);
    }, speed);
}

function playerMove(from, to) {
    console.log(lastPuzzleMoveIndex);
    console.log(currentPuzzle.moves[lastPuzzleMoveIndex]);
    console.log(`${from}${to}`);
    if(currentPuzzle.moves[lastPuzzleMoveIndex+1] === `${from}${to}`) {
        lastPuzzleMoveIndex++;
        puzzleMoveGood(from, to);
    } else {
        puzzleMoveBad(from, to);
    }
}

function puzzleMoveGood(from, to) {
    movePiece(from, to);
    lastPuzzleMoveIndex++;
    if(currentStatus.isFinished || lastPuzzleMoveIndex >= currentPuzzle.moves.length) {
        updateMessage('Puzzle complete!', 'good');
        puzzle_solved = true;
    } else {
        updateMessage('Good move, keep going.');
        setTimeout(() => {
            
            computerMove(currentPuzzle.moves[lastPuzzleMoveIndex].substring(0, 2), currentPuzzle.moves[lastPuzzleMoveIndex].substring(2, 4));
        }, speed);
    }
}

function puzzleMoveBad(from, to) {
    const backupStatus = currentFEN;
    const backupPrevious = document.querySelectorAll('.previous');
    console.log(backupPrevious);
    movePiece(from, to);
    updateMessage('There is a better move, try again.', 'bad');
    setTimeout(() => {
        loadFen(backupStatus);
        backupPrevious.forEach(element => {
            element.classList.add('previous');
        });
    }, speed);
}

function movePiece(from, to) {
    console.log(`move ${from} to ${to}`);
    currentStatus = move(currentStatus, from.toUpperCase(), to.toUpperCase());
    console.log(currentStatus);
    currentFEN = getFen(currentStatus);
    loadBoard(currentFEN);
    document.getElementById(from).classList.add('previous');
    document.getElementById(to).classList.add('previous');
}

function loadRandomPuzzle() {
    const puzzles = [
        ["8/R7/3P4/4p1p1/3rPp1k/5P2/5K2/8 b - - 0 46","d4d6 a7h7 d6h6 h7h6",495],
        ["8/4p2k/3p2p1/3q3p/7P/2Q1P1P1/5P2/6K1 b - - 1 45","h7h6 c3h8",460],
        ["3r4/pB3R2/1p2p3/8/kP4b1/2P1B3/P4P2/4K3 w - - 1 29","b7e4 d8d1",415],
        ["4rk2/ppp1rp1p/6p1/5Q2/3p4/P2P2R1/KPP5/6R1 b - - 0 25","g6f5 g3g8",406],
        ["6k1/1N3ppp/p1p2n2/4p3/1r6/4P1P1/5P1P/3R2K1 b - - 0 29","b4b7 d1d8 f6e8 d8e8",400],
        ["1r4k1/5p1p/1R3Pp1/1p6/8/7P/6P1/3R2K1 b - - 0 31","b8b6 d1d8",400],
        ["8/R7/5p2/P5p1/4r3/4r1k1/6P1/3R2K1 w - - 16 42","a7f7 e3e1 d1e1 e4e1",464],
        ["6k1/p5p1/1p4rp/3p4/5p2/P1P4r/1P3qP1/3QN1RK w - - 0 37","g2h3 f2g1",496],
        ["6k1/pp3rp1/6P1/8/8/P2R4/1KP5/8 b - - 0 30","f7c7 d3d8",400],
        ["3rr1k1/p3pp1p/1p3QpB/2p5/2P1R3/3q3P/P4PP1/4R1K1 b - - 0 22","e7f6 e4e8 d8e8 e1e8",424]
      ];

    const random_puzzle = puzzles[Math.floor(Math.random() * puzzles.length)]
    loadPuzzle(random_puzzle);
}

function updateMessage(text, type = '') {
    const message = document.getElementById('message');
    message.innerHTML = text;
    message.classList = type;
}

function loadFen(fen) {
    if (validateFEN(fen)) {
        currentFEN = fen;
        currentStatus = status(currentFEN);
        loadBoard(fen);
    } else {
        console.log('invalid FEN');
    }
}

function loadPuzzle(puzzle) {
    puzzle_solved = false;
    currentPuzzle = {
        "fen": puzzle[0],
        "moves": puzzle[1].split(' '),
        "rating": puzzle[2],
    };
    loadFen(currentPuzzle.fen); 
    if(currentStatus.turn === 'white') {
        updateMessage('Find the best move for black.');
        flipBoard(true);
    } else {
        updateMessage('Find the best move for white.');
        flipBoard(false);
    }
    computerMove(currentPuzzle.moves[0].substring(0, 2), currentPuzzle.moves[0].substring(2, 4));
    lastPuzzleMoveIndex = 0;
}
