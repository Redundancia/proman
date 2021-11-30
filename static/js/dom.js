// It uses data_handler.js to visualize elements
let newCardInProgress = false;

import {dataHandler} from "./data_handler.js";
import {initDrag} from "./drag_cards.js";

export let dom = {
    init: function () {
        // This function should run once, when the page is loaded.
        let loggedIn = document.contains(document.getElementById('loggedin'));
        if (loggedIn) {
            let privateBoardButton = document.getElementById('add-private-board');
            privateBoardButton.addEventListener('click', dom.createNewPrivateBoard);
        }
        let publicBoardButton = document.getElementById('add-public-board');
        publicBoardButton.addEventListener('click', dom.createNewBoard);
    },
    clearBoards: function (){
        let boardContainer = document.getElementById('boards')
        boardContainer.innerHTML= ''
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dom.clearBoards()
        dataHandler.getBoards(function (boards) {
            dom.showBoards(boards);
        });
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also
        let boardsContainer = document.querySelector('#boards');
        for (let board of boards) {
            const outerHtml = `
            <section class="board">

            <div class="board-header"><span class="board-title" id="${board.id}" contenteditable="true" >${board.title}</span>
                <button id="add-card-${board.id}" class="board-add">Add Card</button>
                <button id="delete-board-${board.id}" class="board-remove" value="${board.id}">Delete Board</button>
                <button class="column-add" value="${board.id}"> Add column</button>
                <button class="board-toggle" id="${board.id}" value="closed"><i class="fa fa-chevron-down"></i></button>
            </div>
            <div class="board-columns" id="columns ${board.id}"></div>
            </section>`;
            boardsContainer.insertAdjacentHTML("beforeend", outerHtml);
        }
        let boardClassElements = document.querySelectorAll('.board');
        for (let boardClassElement of boardClassElements) {
            boardClassElement.firstElementChild.firstElementChild.addEventListener('input', dom.saveNewBoardName);
        }
        let toggleButtons = document.getElementsByClassName("board-toggle");
        for (let toggleButton of toggleButtons) {
            toggleButton.addEventListener("click", function (event) {
                let boardId = event.currentTarget.id;
                let addCardButton = document.getElementById(`add-card-${boardId}`);
                if (toggleButton.value != "open") {
                    dom.getColumns(boardId);
                    toggleButton.value = "open";
                    toggleButton.innerHTML = '<i class="fa fa-chevron-up"></i>';
                    if (!newCardInProgress)
                        addCardButton.style.display = "inline-block";

                } else {
                    let actualBoard = document.getElementById(`columns ${boardId}`)
                    actualBoard.innerHTML = '';
                    toggleButton.value = "closed";
                    toggleButton.innerHTML = '<i class="fa fa-chevron-down"></i>';
                    if (!newCardInProgress)
                        addCardButton.style.display = "none";
                }

                if (addCardButton.classList.value !== "board-add evented") {
                    addCardButton.classList.add("evented")
                    addCardButton.addEventListener('click', function (event) {
                        let boardId = event.target.nextElementSibling.value;
                        let addCardButtons = document.getElementsByClassName("board-add");
                        for (let button of addCardButtons) {
                            button.style.display = "none";
                        }
                        ;
                        newCardInProgress = true;
                        dom.inputFieldForNewCard(boardId);
                    });
                }

            });
        }
        dom.addEventListenerDeleteBoard();
        dom.addEventListenerAddColumn();

    },
    loadCards: function (boardId) {
    // retrieves cards and makes showCards called
        dataHandler.getCardsByBoardId(boardId, function (cards) {
            dom.showCards(cards, boardId);
            initDrag.initDragAndDrop(dom.saveCardsStatus);
            dom.addEventListenerDeleteCard()
        });

    },
    showCards: function (cards, boardId) {
        // shows the cards of a board
        // it adds necessary event listeners also
        for (let card of cards){
            let columnContents = document.getElementById(`column ${card.status_id} ${boardId}`)
            let cardItem = `
                <div class="card" contenteditable="true" id="${card.id}">
                        <div class="card-remove"><i class="fas fa-trash-alt"></i></div>
                        <div class="card-title" >${card.title}</div>
                </div>
            `;
            columnContents.insertAdjacentHTML("beforeend", cardItem);
            columnContents.lastElementChild.addEventListener("input", dom.saveNewCardTitle);
        }

    },

    showColumns: function (boardId, columns) {
        let boardColumns = document.getElementById(`columns ${boardId}`);
            for (let col of columns) {
                let statusId = col['id'];
                let statusTitle = col['title'];
                let column = `
                            <div class="board-column">
                                <div class="board-column-title"> ${statusTitle.charAt(0).toUpperCase() + statusTitle.slice(1)} </div>
                                <div class="board-column-content" id="column ${statusId} ${boardId}">
                                </div>
                                <button class="column-remove" id="deleteColumnButton ${statusId} ${boardId}">Delete Column</button>
                            </div>`;
                boardColumns.insertAdjacentHTML("beforeend", column);
            }
        dom.columnAddEventListeners();
        dom.clickDeleteColumnButton();
        dom.loadCards(boardId);
    },

    getColumns: function (boardId) {
        dataHandler.getColumnsByBoardId(boardId, function (columns) {
            dom.showColumns(boardId, columns);
        });
    },

    createNewBoard: function () {
        let loggedIn = document.contains(document.getElementById('loggedin'));
        if (loggedIn) {
            let privateBoardButton = document.getElementById('add-private-board');
            privateBoardButton.hidden = true;
        }
        let publicBoardButton = document.getElementById('add-public-board');
        publicBoardButton.hidden = true;
        let boardsContainer = document.getElementById('boards');
        boardsContainer.insertAdjacentHTML('beforeend', `
                <div class="board-header"><input type="text" name="public-board-name" class="board-title" value="New public board" onclick="this.select()" autofocus/>
                <button id="board-save">Save Board</button>
                <button class="board-toggle"><i class="fa fa-chevron-down"></i></button>
                </div>`);
        let saveBoardButton = document.getElementById('board-save');
        saveBoardButton.addEventListener('click', dom.saveBoard);
    },
    saveBoard: function (event) {
        let boardTitle = event.target.parentElement.firstElementChild.value;
        let creator_username = "";
        if (event.target.id == "board-save") {
            creator_username = "public";
        }
        let data = [boardTitle, creator_username];
        dataHandler.createNewBoard(data, function (boards) {
            document.getElementById('boards').innerHTML = '';
            dom.showBoards(boards);
            document.getElementById('add-public-board').hidden = false;
            if (document.getElementById('add-private-board') != null)
                document.getElementById('add-private-board').hidden = false;
        })
    },

    createNewPrivateBoard: function () {
        document.getElementById('add-private-board').hidden = true;
        document.getElementById('add-public-board').hidden = true;
        let boardsContainer = document.getElementById('boards');
        boardsContainer.insertAdjacentHTML('beforeend', `
            <div class="board-header"><input type="text" name="private-board-name" class="board-title" value="New private board name" onclick="this.select()" autofocus/>
            <button id="board-private-save">Save Board</button>
            <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
            </div>
    `);
        let focusInput = boardsContainer.lastElementChild.firstElementChild;
        focusInput.select();
        let saveBoardButton = document.getElementById('board-private-save');
        saveBoardButton.addEventListener('click', dom.saveBoard);
    },
    getNewCard: function (event, boardId) {
        newCardInProgress = false;
        let field = document.getElementsByName("card-name");
        let statusId = event.target.parentElement.id.split(" ")[1];
        let card = {
            "title": `${field[0].value}`,
            "boardId": `${boardId}`,
            "statusId": `${statusId}`,
            "order": 0
        }
        dataHandler.createNewCard(boardId, card, function (){
            let columnsContainer = document.getElementById(`columns ${boardId}`);
            columnsContainer.innerHTML = '';
            dom.getColumns(boardId)
        })
    },

    inputFieldForNewCard: function (boardId) {
        let column = document.getElementById(`columns ${boardId}`).firstElementChild.firstElementChild.nextElementSibling;
        column.insertAdjacentHTML('beforeend', `
            <div class="card">
                <input type="text" style="color: black" name="card-name" class="card-title" value="New card" onclick="this.select()"/>
            </div>
            <button id="card-save">Save Card</button>
            </div>`);
        let saveCardButton = document.getElementById("card-save");
        saveCardButton.addEventListener('click', function (event) {
            dom.getNewCard(event, boardId);
            let addCardButtons = document.getElementsByClassName("board-add");
            for (let button of addCardButtons) {
                if (button.nextElementSibling.nextElementSibling.value =="open")
                    button.style.display = "inline-block";
            };
        })
    },
    saveCardsStatus: function (draggedCardContainer) {
        let statusId =  draggedCardContainer.id.split(" ")[1];
        let cardId = draggedCardContainer.lastElementChild.id;
        dataHandler.getStatus(cardId, statusId, function (columns) {
        });
    },

    columnAddEventListeners: function () {
        let columns = document.getElementsByClassName("board-column-title");
        for (let column of columns) {
            column.addEventListener("click", dom.renameColumn)
        };
    },
    renameColumn: function (event){
        let defValue= event.target.innerText;
        event.target.outerHTML = `<input id="tmp" value="${defValue}">`;
        document.querySelector("#tmp").addEventListener("change", dom.finishRenameColumn)
    },

    finishRenameColumn: function (event){
        let boardId = event.target.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.id;
        let newColumnName = event.target.value;
        let statusId = event.target.nextElementSibling.id.split(" ")[1];
        dataHandler.changeColumnName(newColumnName, statusId, boardId, () => {
        });
        let columnsContainer = document.getElementById(`columns ${boardId}`);
            columnsContainer.innerHTML = '';
            dom.getColumns(boardId);
    },

    saveNewCardTitle: function (event){
        let cardId = event.target.id;
        let newCardTitle = event.target.innerText;
         dataHandler.changeCardTitle(cardId, newCardTitle, () => {});
    },

    saveNewBoardName: function (event) {
        let boardId = event.target.id;
        let newBoardName = event.target.innerHTML;
        dataHandler.changeBoardName(boardId,newBoardName, () => {})
    },


    addEventListenerDeleteCard: function(){
        let removes = document.getElementsByClassName('card-remove')
        for (let remove of removes){
            if (remove.classList.value !== "card-remove true"){
                remove.classList.add('true')
                remove.addEventListener('click', function addEvent(){
                    let idForRemoveCard = this.parentElement.id
                    dataHandler.removeCardById(idForRemoveCard, (boardId)=>{
                        let columnsContainer = document.getElementById(`columns ${boardId}`);
                        columnsContainer.innerHTML = ''
                        dom.getColumns(boardId)
                    })
                })
            }
        }
    },
    addEventListenerDeleteBoard: function () {
        let removes = document.getElementsByClassName("board-remove");
        for (let remove of removes) {
            if (remove.classList.value !== "board-remove true") {
                remove.classList.add('true')
                remove.addEventListener('click', function() {
                   dataHandler.removeBoardById(remove.value, dom.loadBoards)
                })
            }
        }
    },

    addEventListenerAddColumn() {
        let adds = document.getElementsByClassName("column-add");
        for (let add of adds) {
            add.addEventListener('click', function(event) {
                let boardId = event.target.value;
                dataHandler.addColumn(boardId, () => {
                let columnsContainer = document.getElementById(`columns ${boardId}`);
                        columnsContainer.innerHTML = ''
                        dom.getColumns(boardId)
                });
            })
        }
    },
        clickDeleteColumnButton: function() {
        let removeColumns = document.getElementsByClassName("column-remove");
        for (let removeColumn of removeColumns) {
            removeColumn.addEventListener('click', dom.deleteColumn)
        }
    },

    deleteColumn: function(event){
        let statusId = event.target.id.split(" ")[1];
        let boardId =  event.target.id.split(" ")[2];
        dataHandler.deleteColumn(statusId, boardId, () => {
            let columnsContainer = document.getElementById(`columns ${boardId}`);
            columnsContainer.innerHTML = ''
            dom.getColumns(boardId)
         });
    },
};

