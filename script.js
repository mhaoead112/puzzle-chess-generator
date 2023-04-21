import validateFEN from './fen-validator/index.js';

window.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("no-js").remove();

    const board = document.getElementById('board');
    const squares = board.querySelectorAll('div');
    squares.forEach( square => {
        square.addEventListener('pointerdown', function() {
            squareClicked(square)
        });
    });

    const squareClicked = (square) => {
        console.log(`${square} was clicked!`);
        if(square.classList.contains('selected')) {
            unselectAll();
        } else {
            unselectAll();
            square.classList.add('selected');
        }
    }
    
    const unselectAll = () => {
        squares.forEach( square => {
            square.classList.remove('selected');
        });
    };

    const test = validateFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1'); // true
    console.log(test);
});
