export default class View {

    constructor(model) {

        this.model = model;

        this.resetListeners = [];
        this.moveListeners = [];

        this.div = document.createElement('div');
        this.div.classList.add('app')


        /* DIV Initialization */

        const title_div = document.createElement('div');
        title_div.classList.add('title');
        const title = document.createElement('h1');
        title.innerHTML = "black-and-white-and-grey";
        title_div.append(title);
        this.div.append(title_div);

        const stage_div = document.createElement('div');
        stage_div.classList.add('stage');
        this.div.append(stage_div);

        const gameTable_div = document.createElement('div');
        gameTable_div.classList.add('gameTable');
        const gameTable = renderGameTable(this.model.board);
        gameTable_div.append(gameTable);
        stage_div.append(gameTable_div);

        const directions_div = document.createElement('div');
        directions_div.classList.add('directions');
        const directions = document.createElement('p');
        directions.innerHTML = "Use your keyboard arrow keys to shift the tiles on the board so as to create the number 2048. Be careful not to allow the board to fill up with tiles to the point where you can't make any more moves, or the game will be over!"
        directions_div.append(directions);
        stage_div.append(directions_div);

        const gameStatus_div = document.createElement('div');
        gameStatus_div.classList.add('gameStatus');
        const gameStatus = document.createElement('p');
        gameStatus.innerHTML = "You haven't quite reached 2048 - keep going!";
        gameStatus.id = 'currentGameStatus';
        gameStatus_div.append(gameStatus);
        stage_div.append(gameStatus_div);

        const score_div = document.createElement('div');
        score_div.classList.add('score');
        const score = document.createElement('p');
        score.innerHTML = "Score: <span id='currentScore'>0</span>";
        score_div.append(score);
        stage_div.append(score_div);

        const resetButton_div = document.createElement('div');
        resetButton_div.classList.add('resetButton');
        const resetButton = document.createElement('button');
        resetButton.innerHTML = "Reset";
        resetButton.addEventListener('click', (e) => {
            this.updateResetListeners({});
        });
        resetButton_div.append(resetButton);
        this.div.append(resetButton_div);


        /* Observation of Model */

        this.model.onMove((e) => { 
            document.querySelector('#gameTable').replaceWith(renderGameTable(e.board)); 
            document.querySelector('#currentScore').innerHTML = `${e.score}`;
        });

        this.model.onReset((e) => {
            document.querySelector('#gameTable').replaceWith(renderGameTable(e.board)); 
            document.querySelector('#currentScore').innerHTML = `${e.score}`;
            document.querySelector('#currentGameStatus').innerHTML = "You haven't quite reached 2048 - keep going!";
        });

        this.model.onWin((e) => {
            document.querySelector('#currentGameStatus').innerHTML = "You created a tile with 2048 - you've won! Keep going to try to achieve as high of a score as possible!"
        });

        this.model.onLose((e) => {
            if (e.won) {
                document.querySelector('#currentGameStatus').innerHTML = "Game over! You created a tile with 2048 and won!";
            } else {
                document.querySelector('#currentGameStatus').innerHTML = "Game over! You failed to create a tile with 2048 - try again by resetting below!";
            }
        });


        /* Raising semantically/contextually appropriate move event for listeners (the controller, in this case) as a result of browser events / events on the UI */
       
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case "ArrowUp":
                    this.updateMoveListeners({direction: 'up'});
                    break;
                case "ArrowDown":
                    this.updateMoveListeners({direction: 'down'});
                    break;
                case "ArrowLeft":
                    this.updateMoveListeners({direction: 'left'});
                    break;
                case "ArrowRight":
                    this.updateMoveListeners({direction: 'right'});
                    break;
            }
        });

    }

    /* "Reset" Event Listeners */

    addResetListener(listener) {
        const idx = this.resetListeners.findIndex((l) => l == listener);
        if (idx == -1) {
            this.resetListeners.push(listener);
        }
    }

    removeResetListener(listener) {
        const idx = this.resetListeners.findIndex((l) => l == listener);
        if (idx !== -1) {
            this.resetListeners.splice(idx, 1);
        }
    }

    updateResetListeners(e) {
        this.resetListeners.forEach((listener) => {
            listener(e);
        });
    }

    /* "Move" Event Listeners */

    addMoveListener(listener) {
        const idx = this.moveListeners.findIndex((l) => l == listener);
        if (idx == -1) {
            this.moveListeners.push(listener);
        }    
    }

    removeMoveListener(listener) {
        const idx = this.moveListeners.findIndex((l) => l == listener);
        if (idx !== -1) {
            this.moveListeners.splice(idx, 1);
        }
    }

    updateMoveListeners(e) {
        this.moveListeners.forEach((listener) => {
            listener(e);
        });
    }

}


const renderGameTable = function (board) {
    const gameTable = document.createElement('table');
    gameTable.id = 'gameTable';
    const boardDimension = Math.sqrt(board.length);
    for (let i=0; i<boardDimension; i++) {
        let tRow = document.createElement('tr');
        for (let j=0; j<boardDimension; j++) {
            const tTile = document.createElement('td');
            tTile.classList.add('tile')
            tTile.dataset.val = `${board[j+(i * boardDimension)]}`;
            // const tTileContent = document.createElement('p');
            // tTileContent.innerHTML = `${board[j+(i * boardDimension)]}`;
            // tTile.append(tTileContent);
            tRow.append(tTile);
        }
        gameTable.append(tRow);
    }
    return gameTable;
}
