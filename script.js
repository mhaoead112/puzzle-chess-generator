import validateFEN from './fen-validator/index.js';

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
        if (square.classList.contains('selected')) {
            unselectAll();
        } else {
            unselectAll();
            square.classList.add('selected');
        }
    }

    const unselectAll = () => {
        squares.forEach(square => {
            square.classList.remove('selected');
        });
    };

    const fen = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2';

    if (validateFEN(fen)) {
        console.log('valid FEN');
        loadBoard(fen);
    } else {
        console.log('invalid FEN');
    }
});

function clearBoard() {
    const board = document.getElementById('board');
    const squares = board.querySelectorAll('div');
    squares.forEach(square => {
        square.classList = '';
    });
}

function loadBoard(fen) {
    const fenPositions = ['a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8', 'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7', 'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6', 'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5', 'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4', 'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3', 'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2', 'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'];

    const fenArr = fen.split(' ');
    const [piecePlacement, sideToMove,
        castlingAbility, enPassantTarget,
        halfMoveClock, fullMoveCounter] = fenArr;

    clearBoard();

    let i = 0;
    let b = 0;

    // Place pieces on board
    // TODO: refactor this
    while (i < piecePlacement.length) {
        if (piecePlacement[i] === '/') {
            i++;
            continue;
        }

        if (parseInt(piecePlacement[i])) {
            b += parseInt(piecePlacement[i]);
            i++;
            continue;
        }
        
        const square = document.getElementById(fenPositions[b]);
        square.classList.add(piecePlacement[i]);
        i++;
        b++;
    }
}