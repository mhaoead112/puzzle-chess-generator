window.addEventListener("DOMContentLoaded", (event) => {
    console.log(event);

    const board = document.getElementById('board');
    const squares = board.querySelectorAll('div');
    squares.forEach( square => {
        square.addEventListener('click', function() {
            console.log(`${square.id} was clicked!`);
            if(square.classList.contains('selected')) {
                unselectAll();
            } else {
                unselectAll();
                square.classList.add('selected');
            }
        });
    });

    const unselectAll = () => {
        squares.forEach( square => {
            square.classList.remove('selected');
        });
    };

});
