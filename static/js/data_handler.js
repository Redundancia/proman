// this object contains the functions which handle the data and its reading/writing
// feel free to extend and change to fit your needs

// (watch out: when you would like to use a property/function of an object from the
// object itself then you must use the 'this' keyword before. For example: 'this._data' below)
export let dataHandler = {
    _data: {}, // it is a "cache for all data received: boards, cards and statuses. It is not accessed from outside.
    _api_get: function (url, callback) {
        // it is not called from outside
        // loads data from API, parses it and calls the callback with it

        fetch(url, {
            method: 'GET',
            credentials: 'same-origin'
        })
        .then(response => response.json())  // parse the response as JSON
        .then(json_response => callback(json_response));  // Call the `callback` with the returned object
    },
    _api_post: function (url, data, callback) {
        // it is not called from outside
        // sends the data to the API, and calls callback function
        fetch(url, {
            method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: "include",
                    body: JSON.stringify(data),
                    cache: "no-cache",
        })
            .then(response => response.json())
            .then(json_response => callback(json_response));
    },
    init: function () {
    },
    getBoards: function (callback) {
        // the boards are retrieved and then the callback function is called with the boards

        // Here we use an arrow function to keep the value of 'this' on dataHandler.
        //    if we would use function(){...} here, the value of 'this' would change.
        this._api_get('/get-boards', (response) => {
            this._data['boards'] = response;
            callback(response);
        });
    },
    getBoard: function (boardId, callback) {
        // the board is retrieved and then the callback function is called with the board
    },
    getStatuses: function (boardId, callback) {
        this._api_post('/get-statuses', boardId,(response) => {
            this._data['statuses'] = response;
            callback(response);
        });
    },
    getStatus: function (cardId, statusId, callback) {
        // the status is retrieved and then the callback function is called with the status
        this._api_post(`/dragged-card`,[cardId,statusId], (response) => {
            this._data['cardStatus'] = response;
            callback(response);
            });
    },
    getCardsByBoardId: function (boardId, callback) {
        // the cards are retrieved and then the callback function is called with the cards
        this._api_get(`/get-cards/${boardId}`, (response) => {
            this._data['cards'] = response;
            callback(response);
        });
    },
    getCard: function (cardId, callback) {
        // the card is retrieved and then the callback function is called with the card
    },
    createNewBoard: function (board, callback) {
        // creates new board, saves it and calls the callback function with its data
        this._api_post("/create-board", board, (response) => {
            this._data['boards'] = response;
            callback(response);
        });
    },
    createNewCard: function ( boardId, card, callback) {
        // creates new card, saves it and calls the callback function with its data
         this._api_post(`/create-card/${boardId}`, card, (response) => {
            this._data['cards'] = response;
            callback(response);
        });
    },
    getColumnsByBoardId: function (boardId, callback) {
        // the cards are retrieved and then the callback function is called with the cards
        this._api_get(`/get-columns/${boardId}`, (response) => {
            this._data['columns'] = response;
            callback(response);
        });
    },

    changeBoardName: function (boardId, newBoardName, callback) {
        this._api_post(`/new-board-name`,[boardId,newBoardName], (response) => {
            this._data['newBoardName'] = response;
            callback(response);
            });
    },
    changeColumnName: function (newColumnName, statusId, boardId,callback) {
        this._api_post(`/new-column-name`,[newColumnName, statusId ,boardId], (response) => {
            this._data['newColumnName'] = response;
            callback(response);
            });
    },
    changeCardTitle: function (cardId, newCardTitle, callback){
       this._api_post(`/new-card-title`,[cardId, newCardTitle], (response) => {
            this._data['newCardTitle'] = response;
            callback(response);
            });
    },

    removeCardById: function(cardId, callback){
        this._api_post(`/remove-card`, cardId, (response) => {
            callback(response);
        });
    },
    removeBoardById: function(boardId, callback){
        this._api_post(`/remove-board`, boardId, (response) => {
            callback(response);
        });
    },

    // here comes more features
    addColumn(boardId, callback) {
        this._api_post(`/add-column`, boardId, (response) => {
            callback(response);
        });
    },
    deleteColumn(statusId, boardId, callback) {
        this._api_post(`/delete-column`, [statusId, boardId], (response) => {
            callback(response);
        });
    }
};
