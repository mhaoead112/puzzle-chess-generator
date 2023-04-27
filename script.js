import validateFEN from './fen-validator/index.js';
import { moves, status }  from './js-chess-engine/lib/js-chess-engine.mjs';

const fenPositions = ['a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8', 'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7', 'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6', 'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5', 'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4', 'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3', 'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2', 'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'];
const pieces = ['r', 'n', 'b', 'q', 'k', 'p', 'R', 'N', 'B', 'Q', 'K', 'P'];
let currentFEN = '';
let currentStatus = '';

window.addEventListener("DOMContentLoaded", (event) => {
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
        // You may be temped to refactor, but why?
        // unselectAll is catching **edge case** for multiple selected squares
        // you still need to unselect the selected square, if user wants to undo selection
        if (square.classList.contains('selected')) {
            unselectAll();
        } else {
            unselectAll();
            // TODO: only add selected if piece exists
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

    const unselectAll = () => {
        squares.forEach(square => {
            square.classList.remove('selected');
            square.classList.remove('circle');
        });
    };

    document.getElementById('random-fen').addEventListener('click', () => {
        loadRandomFen();
    });

    loadRandomFen();
});

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

    const board = document.getElementById('board');

    // flip board if black's turn
    if(currentStatus.turn === 'black') {
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

    // TODO: we should allow user to select a piece that can't move - as long as it's their piece
    if(canSelectPiece) {
        element.classList.add('selected');

        for (let i = 0; i < selectedPieceValidMoves?.length; i++) {
            const square = document.getElementById(selectedPieceValidMoves[i].toLowerCase());
            square.classList.add('circle');
        }  
    }
}

function loadRandomFen() {
    const fenPositions = [
        "r1bqk2r/ppp2ppp/2n1pn2/1B1p4/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 4",
        "rnbqk2r/pppp1ppp/4p3/8/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 3",
        "r1bq1rk1/pppnbppp/4p3/3pP3/2P5/2N2N2/PP2BPPP/R1BQK2R b KQ - 3 7",
        "r3k2r/1p1b1ppp/p1nppn2/8/2P5/1PN1PN2/P1B1BPPP/R3K2R w KQkq - 0 11",
        "r2qkb1r/pp1n1ppp/2p1pn2/2Pp4/3P1B2/2N2N2/PP3PPP/R2QKB1R b KQkq - 1 7",
        "r1bqk2r/1p2bppp/p1n1pn2/2pp4/2P5/2N1PN2/PP1P1PPP/R1BQKB1R w KQkq - 0 7",
        "rnbqkb1r/pppp1ppp/4p3/8/3Pn3/2N5/PPP1PPPP/R1BQKBNR w KQkq - 1 3",
        "r1bq1rk1/p3bppp/1p2pn2/8/2PP4/1PN1PN2/P3BPPP/R2QK2R w KQ - 2 11",
        "r1b1k2r/pp2bppp/2n1pn2/q7/2p1P3/2N1BN2/PP1QBPPP/R3K2R b KQkq - 0 10",
        "r1b1k2r/pp1p1ppp/1q3n2/3n4/2B1P3/2N5/PPP2PPP/R1BQK2R w KQkq - 2 7",
        "r2qkb1r/pp1n1ppp/2pbpn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 0 7",
        "rnbqk2r/pp2nppp/2p1p3/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
        "r1bqkb1r/1p2nppp/p1np4/4p3/2PP4/2N2N2/PP3PPP/R1BQKB1R w KQkq - 0 6",
        "r1b1k2r/pp2bppp/2n1p3/q7/2Pp4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 0 9",
        "rnbqk2r/pppp1ppp/4p3/8/2P5/5N2/PP1PPPPP/RNBQKB1R b KQkq - 0 2",
        "rnbqk2r/pppp1ppp/4p3/8/2P1n3/5N2/PP1PPPPP/RNBQKB1R w KQkq - 1 3",
        "r1b1kb1r/p1pp1ppp/1q2pn2/n7/2P5/2N2N2/PP1PPP1P/R1BQKB1R w KQkq - 1 6",
        "r1b1kb1r/p1pp1ppp/1q2pn2/8/2P5/2N1PN2/PP1P1PPP/R1BQKB1R w KQkq - 0 6",
        "r1bqk2r/pp2nppp/2pbpn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R b KQkq - 0 7",
        "r1b1k1nr/pp1p1ppp/2n1p3/1B6/2P5/5N2/PP1PPPPP/RNBQK2R b KQkq - 0 3",
        "rnbqk2r/ppp1nppp/3p4/4p3/2P5/5N2/PP1PPPPP/RNBQKB1R w KQkq - 0 3",
        "rnbqk2r/ppp1nppp/3p4/4p3/2P1P3/5N2/PP1P1PPP/RNBQKB1R b KQkq - 0 3",
        "r1bqkb1r/pp2nppp/2n1p3/1B1p4/4P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 3 5",
        "r1b1k2r/pp2bppp/2n2n2/q1p1p3/3pP3/2PP1N1P/P1QB1PP1/RN3RK1 w kq - 0 11",
        "r1bqk2r/ppp1bppp/2n5/3p4/2PPn3/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 0 6",
        "1r1r2k1/2q2pbp/ppp1p1p1/n7/2PP4/1PN2P2/P2Q2PP/2R2RK1 w - - 0 19",
        "r1bq1rk1/pp3pbp/2np1np1/2p5/2P5/2NPPN2/PP3PPP/R1BQ1RK1 w - - 0 9",
        "rnbqkbnr/pppp2pp/4p3/5p2/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 3",
        "r3r1k1/1p3ppp/2b1p3/p2n4/2P5/PP3P2/3R2PP/R1B3K1 w - - 0 21",
        "rnbqk2r/pp2bppp/2p2n2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 0 7",
        "r1b2rk1/pp2qppp/2n1p3/3pP3/3P1P2/2N1B3/PP3QPP/R4RK1 w - - 0 16",
        "r1bqk2r/ppp2ppp/2n5/2b5/4P3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4",
        "r1b1k2r/2pp1ppp/p1pb1n2/q7/2PP4/P1N1PN2/1P3PPP/R1BQ1RK1 w kq - 0 11",
        "r3r1k1/ppp3pp/3bpn2/3p1p2/2PP4/1P3P2/P2N2PP/2BRR1K1 w - - 0 20",
        "rnbqkb1r/ppp1pppp/5n2/3p4/2P5/5NP1/PP1PPP1P/RNBQKB1R w KQkq - 0 3",
        "r1b2rk1/pp1n1ppp/2pbpn2/q7/2PP4/P1N1PN2/1P3PPP/R1BQR1K1 w - - 0 14",
    ];

    const random_fen = fenPositions[Math.floor(Math.random() * fenPositions.length)]
    if (validateFEN(random_fen)) {
        currentFEN = random_fen;
        console.log('valid FEN:');
        console.log(currentFEN);

        currentStatus = status(currentFEN);
        console.log('status:');
        console.log(currentStatus);

        loadBoard(random_fen);
    } else {
        console.log('invalid FEN');
    }
}
