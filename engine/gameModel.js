export default class Model {

    constructor(n) {
        
        this.boardDimension = n;

        this.board = new Array(n*n).fill(0);
        this.board = addTile(this.board);
        this.board = addTile(this.board); 

        this.score = 0;
        this.won = false;
        this.over = false;

        this.moveListeners = [];
        this.winListeners = [];
        this.loseListeners = [];
        this.resetListeners = [];
        this.loadListeners = [];

    }

    setupNewGame() {
        this.board = new Array(this.boardDimension**2).fill(0);
        this.board = addTile(this.board);
        this.board = addTile(this.board);
        this.score = 0;
        this.won = false;
        this.over = false;

        update(this.getGameState(), this.resetListeners);
    }

    loadGame(gameState) {
        this.board = gameState.board;
        this.score = gameState.score;
        this.won = gameState.won;
        this.over = gameState.over;

        update(this.getGameState(), this.loadListeners);
    }

    move(direction) {

        switch (direction) {
            case 'up':
                this.board = moveUp(this.board, this);
                break;
            case 'down':
                this.board = moveDown(this.board, this);
                break;
            case 'left':
                this.board = moveLeft(this.board, this)
                break;
            case 'right':
                this.board = moveRight(this.board, this);
                break;
        }

        if (this.won == true) {
            update(this.getGameState(), this.winListeners)
        }

        if (checkForGameOver(this)) {
            this.over = true;
            update(this.getGameState(), this.loseListeners);
        }
    }

    toString() {
        let string = "";
        let newLineCounter = 0;
        for (let i=0; i<(this.board.length); i++) {
            string = string.concat(`[${(this.board[i] == 0) ? ' ' : this.board[i]}] `);
            newLineCounter++;
            if (newLineCounter == this.boardDimension) {
                string = string.concat("\n");
                newLineCounter = 0;
            }
        }
        return string;
    }

    onMove(callback) {
        this.moveListeners.push(callback);
    }

    onWin(callback) {
        this.winListeners.push(callback);
    }

    onLose(callback) {
        this.loseListeners.push(callback);
    }

    onReset(callback) {
        this.resetListeners.push(callback);
    }

    onLoad(callback) {
        this.loadListeners.push(callback);
    }
    
    getGameState() {
        return {
            board: this.board,
            score: this.score,
            won: this.won,
            over: this.over
        }
    }

}

/* HELPER FUNCTIONS */

const update = function (event, listeners) {
    listeners.forEach((listener) => {
        listener(event);
    })
}

/* If there exists no blank space to add a tile, returns provided board array. Otherwise, 
    returns a new board array with a uniformly random blank space filled with either 2 
    (with 90% frequency) or 4 (10% frequency). */
const addTile = function (board) {

    const blankTileIndices = board.reduce((blankTileIndicesArray, currentTileValue, currentTileIndex) => {
        if (currentTileValue == 0)
            blankTileIndicesArray.push(currentTileIndex);
            return blankTileIndicesArray;
    }, []);

    if (blankTileIndices.length == 0) {
        return board;
    } else {
        const boardWithTile = board.slice(0, board.length);
        const tileValueToAdd = (Math.random() < 0.1) ? 4 : 2;
        const indexToAddTileTo = blankTileIndices[Math.floor(Math.random() * blankTileIndices.length)];
        boardWithTile[indexToAddTileTo] = tileValueToAdd;
        return boardWithTile;
    }

}


const moveUp = function (board, model) {

    let successfulMove = false;
    const numOfCol = Math.sqrt(board.length), numOfRow = Math.sqrt(board.length), rowLength = Math.sqrt(board.length);

    const columnArrays = [];
    for (let i=0; i<numOfCol; i++) {
        let column = [];
        for (let j=0; j<numOfRow; j++) {
            column.push(board[i+(j*rowLength)]);
        }
        columnArrays.push(column);
    }

    for (let i=0; i<columnArrays.length; i++) {
        const originalColumn = columnArrays[i];
        const mergedColumn = mergeColumnUp(originalColumn, model);
        const columnChanged = mergedColumn.reduce((differenceFlag, currentTile, tileIndex) => {
            return (currentTile != originalColumn[tileIndex]) ? true : differenceFlag;
        }, false);
        if (columnChanged) {
            successfulMove = true;
            columnArrays[i] = mergedColumn;
        }
    }

    let mergedBoard = board.slice(0, board.length);

    if (successfulMove) { 
        for (let i=0; i<numOfCol; i++) {
            for (let j=0; j<numOfRow; j++) {
                mergedBoard[i+(j*rowLength)] = columnArrays[i][j];
            }
        }
        mergedBoard = addTile(mergedBoard);
        model.board = mergedBoard;
        update(model.getGameState(), model.moveListeners);
    }
    return mergedBoard;
}

const mergeColumnUp = function (column, model) {

    const filteredColumn = column.filter((tile) => {
        return (tile != 0);
    });

    if (filteredColumn.length == 0 || filteredColumn.length == 1) {
        return filteredColumn.concat(new Array(column.length - filteredColumn.length).fill(0));
    } else {
        let i = 1;
        while (i<filteredColumn.length) {
            if (filteredColumn[i] == filteredColumn[i-1]) {
                filteredColumn[i-1] = filteredColumn[i-1]*2;
                model.score += filteredColumn[i-1];
                if (filteredColumn[i-1] == 2048) {
                    model.won = true;
                }
                filteredColumn.splice(i, 1);
            }
            i++;
        }
        return filteredColumn.concat(new Array(column.length - filteredColumn.length).fill(0));
    }

}


const moveDown = function (board, model) {

    let successfulMove = false;
    const numOfCol = Math.sqrt(board.length), numOfRow = Math.sqrt(board.length), rowLength = Math.sqrt(board.length);

    const columnArrays = [];
    for (let i=0; i<numOfCol; i++) {
        let column = [];
        for (let j=0; j<numOfRow; j++) {
            column.push(board[i+(j*rowLength)]);
        }
        columnArrays.push(column);
    }

    for (let i=0; i<columnArrays.length; i++) {
        const originalColumn = columnArrays[i];
        const mergedColumn = mergeColumnDown(originalColumn, model);
        const columnChanged = mergedColumn.reduce((differenceFlag, currentTile, tileIndex) => {
            return (currentTile != originalColumn[tileIndex]) ? true : differenceFlag;
        }, false);
        if (columnChanged) {
            successfulMove = true;
            columnArrays[i] = mergedColumn;
        }
    }

    let mergedBoard = board.slice(0, board.length);

    if (successfulMove) { 
        for (let i=0; i<numOfCol; i++) {
            for (let j=0; j<numOfRow; j++) {
                mergedBoard[i+(j*rowLength)] = columnArrays[i][j];
            }
        }
        mergedBoard = addTile(mergedBoard);
        model.board = mergedBoard;
        update(model.getGameState(), model.moveListeners);
    }

    return mergedBoard; 
}

const mergeColumnDown = function (column, model) {

    const filteredColumn = column.filter((tile) => {
        return (tile != 0);
    });

    if (filteredColumn.length == 0 || filteredColumn.length == 1) {
        return new Array(column.length - filteredColumn.length).fill(0).concat(filteredColumn);
    } else {
        let i = filteredColumn.length - 2;
        while (i>=0) {
            if (filteredColumn[i] == filteredColumn[i+1]) {
                filteredColumn[i+1] = filteredColumn[i+1]*2;
                model.score += filteredColumn[i+1];
                if (filteredColumn[i+1] == 2048) {
                    model.won = true;
                }
                filteredColumn.splice(i, 1);
                i-=2;
            } else {
                i--;
            }
        }
        return new Array(column.length - filteredColumn.length).fill(0).concat(filteredColumn);
    }

}


const moveLeft = function (board, model) {
    let successfulMove = false;
    let mergedBoard = [];
    const rowLength = Math.sqrt(board.length);
    for (let i=0; i<board.length; i+=rowLength) {
        const originalRow = board.slice(i, i+rowLength);
        const mergedRow = mergeRowLeft(originalRow, model);
        const rowChanged = mergedRow.reduce((differenceFlag, currentTile, tileIndex) => {
            return (currentTile != originalRow[tileIndex]) ? true : differenceFlag;
        }, false);
        if (rowChanged) {
            successfulMove = true;
        }
        mergedBoard = mergedBoard.concat(mergedRow);
    }
    if (successfulMove) {
        mergedBoard = addTile(mergedBoard);
        model.board = mergedBoard;
        update(model.getGameState(), model.moveListeners);
    }
    return mergedBoard; 
}

const mergeRowLeft = function (row, model) {
    
    const filteredRow = row.filter((tile) => {
        return (tile != 0);
    });

    if (filteredRow.length == 0 || filteredRow.length == 1) {
        return filteredRow.concat(new Array(row.length - filteredRow.length).fill(0));
    } else {
        let i = 1;
        while (i<filteredRow.length) {
            if (filteredRow[i] == filteredRow[i-1]) {
                filteredRow[i-1] = filteredRow[i-1]*2;
                model.score += filteredRow[i-1];
                if (filteredRow[i-1] == 2048) {
                    model.won = true;
                }
                filteredRow.splice(i, 1);
            }
            i++;
        }
        return filteredRow.concat(new Array(row.length - filteredRow.length).fill(0));
    }

}


const moveRight = function (board, model) {
    let successfulMove = false;
    let mergedBoard = [];
    const rowLength = Math.sqrt(board.length);
    for (let i=0; i<board.length; i+=rowLength) {
        const originalRow = board.slice(i, i+rowLength);
        const mergedRow = mergeRowRight(originalRow, model);
        const rowChanged = mergedRow.reduce((differenceFlag, currentTile, tileIndex) => {
            return (currentTile != originalRow[tileIndex]) ? true : differenceFlag;
        }, false);
        if (rowChanged) {
            successfulMove = true;
        }
        mergedBoard = mergedBoard.concat(mergedRow);
    }
    if (successfulMove) {
        mergedBoard = addTile(mergedBoard);
        model.board = mergedBoard;
        update(model.getGameState(), model.moveListeners);
    }
    return mergedBoard; 
}

const mergeRowRight = function (row, model) {
    
    const filteredRow = row.filter((tile) => {
        return (tile != 0);
    });

    if (filteredRow.length == 0 || filteredRow.length == 1) {
        return new Array(row.length - filteredRow.length).fill(0).concat(filteredRow);
    } else {
        let i = filteredRow.length - 2;
        while (i>=0) {
            if (filteredRow[i] == filteredRow[i+1]) {
                filteredRow[i+1] = filteredRow[i+1]*2;
                model.score += filteredRow[i+1];
                if (filteredRow[i+1] == 2048) {
                    model.won = true;
                }
                filteredRow.splice(i, 1);
                i-=2;
            } else {
                i--;
            }
        }
        return new Array(row.length - filteredRow.length).fill(0).concat(filteredRow);
    }

}

const checkForGameOver = function (model) {

    const blanksInBoard = model.board.filter((currentTile) => {
        return (currentTile == 0);
    });

    if (blanksInBoard.length != 0) {
        return false;
    }

    return (moveUpNotPossible(model.board, model) &&
                moveDownNotPossible(model.board, model) &&
                    moveLeftNotPossible(model.board, model) &&
                        moveRightNotPossible(model.board, model));
                    
}


const moveUpNotPossible = function (board) {

    let successfulMove = false;
    const numOfCol = Math.sqrt(board.length), numOfRow = Math.sqrt(board.length), rowLength = Math.sqrt(board.length);

    const columnArrays = [];
    for (let i=0; i<numOfCol; i++) {
        let column = [];
        for (let j=0; j<numOfRow; j++) {
            column.push(board[i+(j*rowLength)]);
        }
        columnArrays.push(column);
    }

    for (let i=0; i<columnArrays.length; i++) {
        const originalColumn = columnArrays[i];
        const mergedColumn = mergeColumnUpHypothetical(originalColumn);
        const columnChanged = mergedColumn.reduce((differenceFlag, currentTile, tileIndex) => {
            return (currentTile != originalColumn[tileIndex]) ? true : differenceFlag;
        }, false);
        if (columnChanged) {
            successfulMove = true;
            columnArrays[i] = mergedColumn;
        }
    }

    return !successfulMove; 
}

const mergeColumnUpHypothetical = function (column) {

    const filteredColumn = column.filter((tile) => {
        return (tile != 0);
    });

    if (filteredColumn.length == 0 || filteredColumn.length == 1) {
        return filteredColumn.concat(new Array(column.length - filteredColumn.length).fill(0));
    } else {
        let i = 1;
        while (i<filteredColumn.length) {
            if (filteredColumn[i] == filteredColumn[i-1]) {
                filteredColumn[i-1] = filteredColumn[i-1]*2;
                filteredColumn.splice(i, 1);
            }
            i++;
        }
        return filteredColumn.concat(new Array(column.length - filteredColumn.length).fill(0));
    }

}


const moveDownNotPossible = function (board) {
    let successfulMove = false;
    const numOfCol = Math.sqrt(board.length), numOfRow = Math.sqrt(board.length), rowLength = Math.sqrt(board.length);

    const columnArrays = [];
    for (let i=0; i<numOfCol; i++) {
        let column = [];
        for (let j=0; j<numOfRow; j++) {
            column.push(board[i+(j*rowLength)]);
        }
        columnArrays.push(column);
    }

    for (let i=0; i<columnArrays.length; i++) {
        const originalColumn = columnArrays[i];
        const mergedColumn = mergeColumnDownHypothetical(originalColumn);
        const columnChanged = mergedColumn.reduce((differenceFlag, currentTile, tileIndex) => {
            return (currentTile != originalColumn[tileIndex]) ? true : differenceFlag;
        }, false);
        if (columnChanged) {
            successfulMove = true;
            columnArrays[i] = mergedColumn;
        }
    }

    return !successfulMove;
}

const mergeColumnDownHypothetical = function (column) {

    const filteredColumn = column.filter((tile) => {
        return (tile != 0);
    });

    if (filteredColumn.length == 0 || filteredColumn.length == 1) {
        return new Array(column.length - filteredColumn.length).fill(0).concat(filteredColumn);
    } else {
        let i = filteredColumn.length - 2;
        while (i>=0) {
            if (filteredColumn[i] == filteredColumn[i+1]) {
                filteredColumn[i+1] = filteredColumn[i+1]*2;
                filteredColumn.splice(i, 1);
                i-=2;
            } else {
                i--;
            }
        }
        return new Array(column.length - filteredColumn.length).fill(0).concat(filteredColumn);
    }

}


const moveLeftNotPossible = function (board) {
    let successfulMove = false;
    let mergedBoard = [];
    const rowLength = Math.sqrt(board.length);
    for (let i=0; i<board.length; i+=rowLength) {
        const originalRow = board.slice(i, i+rowLength);
        const mergedRow = mergeRowLeftHypothetical(originalRow);
        const rowChanged = mergedRow.reduce((differenceFlag, currentTile, tileIndex) => {
            return (currentTile != originalRow[tileIndex]) ? true : differenceFlag;
        }, false);
        if (rowChanged) {
            successfulMove = true;
        }
        mergedBoard = mergedBoard.concat(mergedRow);
    }

    return !successfulMove;  
}

const mergeRowLeftHypothetical = function (row) {

    const filteredRow = row.filter((tile) => {
        return (tile != 0);
    });

    if (filteredRow.length == 0 || filteredRow.length == 1) {
        return filteredRow.concat(new Array(row.length - filteredRow.length).fill(0));
    } else {
        let i = 1;
        while (i<filteredRow.length) {
            if (filteredRow[i] == filteredRow[i-1]) {
                filteredRow[i-1] = filteredRow[i-1]*2;
                filteredRow.splice(i, 1);
            }
            i++;
        }
        return filteredRow.concat(new Array(row.length - filteredRow.length).fill(0));
    }

}


const moveRightNotPossible = function (board) {

    let successfulMove = false;
    let mergedBoard = [];
    const rowLength = Math.sqrt(board.length);
    for (let i=0; i<board.length; i+=rowLength) {
        const originalRow = board.slice(i, i+rowLength);
        const mergedRow = mergeRowRightHypothetical(originalRow);
        const rowChanged = mergedRow.reduce((differenceFlag, currentTile, tileIndex) => {
            return (currentTile != originalRow[tileIndex]) ? true : differenceFlag;
        }, false);
        if (rowChanged) {
            successfulMove = true;
        }
        mergedBoard = mergedBoard.concat(mergedRow);
    }

    return !successfulMove;
}

const mergeRowRightHypothetical = function (row) {

    const filteredRow = row.filter((tile) => {
        return (tile != 0);
    });

    if (filteredRow.length == 0 || filteredRow.length == 1) {
        return new Array(row.length - filteredRow.length).fill(0).concat(filteredRow);
    } else {
        let i = filteredRow.length - 2;
        while (i>=0) {
            if (filteredRow[i] == filteredRow[i+1]) {
                filteredRow[i+1] = filteredRow[i+1]*2;
                filteredRow.splice(i, 1);
                i-=2;
            } else {
                i--;
            }
        }
        return new Array(row.length - filteredRow.length).fill(0).concat(filteredRow);
    }

}
