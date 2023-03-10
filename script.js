window.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("no-js").remove();

    const board = document.getElementById('board');
    const squares = board.querySelectorAll('div');
    squares.forEach( square => {
        square.addEventListener('click', function() {
            squareClicked(square)
        });
    });

    const squareClicked = (square) => {
        console.log(`${square} was clicked!`);
        if(square.classList.contains('selected')) {
            unselectAll();
        } else {
            unselectAll();
            removeCircles();
            square.classList.add('selected');
            createCircles(square.id);
        }
    }
    
    const unselectAll = () => {
        squares.forEach( square => {
            square.classList.remove('selected');
        });
    };

    const removeCircles = () => {
        squares.forEach( square => {
            square.classList.remove('circle');
        });
    };

    const createCircles = (id) => {
        const circles = [];
        const chars = id.split('');

        circles.push(getNextChar(chars[0], 1) + chars[1]); // right
        circles.push(getNextChar(chars[0], -1) + chars[1]); // left
        circles.push(chars[0] + getNextChar(chars[1], 1)); // up
        circles.push(chars[0] + getNextChar(chars[1], -1)); // down

        squares.forEach( square => {
            if(circles.includes(square.id)) {
                square.classList.add('circle');
            }
        });
    }

    const getNextChar = (char, num) => {
        var nextCharCode = char.charCodeAt(0) + num;
        return String.fromCharCode(nextCharCode);
    }
});


