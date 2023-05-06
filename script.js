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
let puzzles = {};

window.addEventListener("DOMContentLoaded", (event) => {
    setUpBoard();
    fetch('./puzzles/offline/puzzles.csv')
        .then(response => response.text())
        .then(csvString => {
            puzzles = initPuzzles(csvString);
            loadRandomPuzzle();   
        })
        .catch(error => {
            console.error('Error fetching puzzles:', error);
        });
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
        updateMessage('<p>Puzzle complete!</p>', 'good');
        puzzle_solved = true;
        enableNextPuzzle();
    } else {
        updateMessage('<p>Good move, keep going.</p>');
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

const loadRandomPuzzle = () => {
    const ratings = Object.keys(puzzles);
    const randomRating = ratings[Math.floor(Math.random() * ratings.length)];
    const randomPuzzle = puzzles[randomRating][Math.floor(Math.random() * puzzles[randomRating].length)];

    loadPuzzle(randomPuzzle);
    disableNextPuzzle();
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
    currentPuzzle = puzzle;
    loadFen(currentPuzzle.fen); 
    if(currentStatus.turn === 'white') {
        updateMessage('<p>Find the best move for <u>black</u>.</p>');
        flipBoard(true);
    } else {
        updateMessage('<p>Find the best move for <u>white</u>.</p>');
        flipBoard(false);
    }
    computerMove(currentPuzzle.moves[0].substring(0, 2), currentPuzzle.moves[0].substring(2, 4));
    lastPuzzleMoveIndex = 0;

    updateDebug();
}

function enableNextPuzzle() {
    document.getElementById('message').addEventListener('click', loadRandomPuzzle);
    document.getElementById('message').classList.add('clickable');
}

function disableNextPuzzle() {
    document.getElementById('message').removeEventListener('click', loadRandomPuzzle);
}

function updateDebug() {
    document.getElementById('debug').innerHTML = `
    Puzzle: ${currentPuzzle.fen}<br>
    Rating: ${currentPuzzle.rating}<br>
    `;
}

function initPuzzles(csvString) {
    const lines = csvString.split('\n');
    const puzzles = {};

    lines.forEach(line => {
        if (line.trim() !== '') {
        const [puzzle_id, fen, moves, rating] = line.split(',');
        const puzzle = { puzzle_id, fen, moves: moves.split(' '), rating };

        if (!puzzles[rating]) {
            puzzles[rating] = [];
        }

        puzzles[rating].push(puzzle);
        }
    });

    return puzzles;
}
