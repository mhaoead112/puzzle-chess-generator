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
});


