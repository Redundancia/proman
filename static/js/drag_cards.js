// import { dom } from "./dom.js";


export let initDrag = {
    initDragAndDrop: function (saveCardCallback) {
        let allCards = document.getElementsByClassName('card')
        for (let card of allCards) {
            card.draggable = true;
            card.addEventListener('dragstart', initDrag.dragStartHandler);
            card.addEventListener('drag', initDrag.dragHandler);
            card.addEventListener('dragend', initDrag.dragEndHandler);
        }
        let columns = document.getElementsByClassName('board-column-content')
        for (let column of columns) {
            column.addEventListener("dragenter", initDrag.dropZoneEnterHandler);
            column.addEventListener("dragleave", initDrag.dropZoneLeaveHandler);
            column.addEventListener("dragover", initDrag.dropZoneOverHandler);
            column.addEventListener("drop", (ev) => initDrag.dropZoneDropHandler(ev, saveCardCallback));
        }
    },

    dragStartHandler: function (ev) {
        this.classList.add('dragged', 'drag-feedback')
        ev.dataTransfer.setData("text/html", "dragged")
        initDrag.deferredOriginChanges(this, 'drag-feedback')
    },

    dragHandler: function () {
    },

    dragEndHandler: function () {
        this.classList.remove('dragged')
    },


    dropZoneEnterHandler: function (ev) {
        if (ev.dataTransfer.types.includes("text/html")) {
            this.classList.add("over-zone")
        }
        ev.preventDefault()
    },

    dropZoneLeaveHandler: function (ev) {
        this.classList.remove("over-zone") // temporarly
        if (ev.dataTransfer.types.includes("text/html") &&
            ev.relatedTarget !== null &&
            ev.currentTarget !== ev.relatedTarget.closest('.card')) {
            this.classList.remove("over-zone")
        }
    },

    dropZoneOverHandler: function (ev) {
        if (ev.dataTransfer.types.includes("text/html")) {
            this.classList.add("over-zone")
            ev.preventDefault()
        }
    },


    dropZoneDropHandler: function (ev, saveCardCallback) {
        ev.currentTarget.classList.remove("over-zone")
        let draggedElement = document.querySelector('.dragged')
        ev.currentTarget.appendChild(draggedElement)
        ev.preventDefault()
        saveCardCallback(ev.currentTarget)
    },


    setDropZonesHighlight: function (highlight = true) {
        const cardSlots = document.getElementsByClassName("card-slot")
        const deck = document.getElementById("deck")
        if (highlight) {
            deck.classList.add("active-zone")
        } else {
            deck.classList.remove("active-zone");
            deck.classList.remove("over-zone")
        }
        for (const cardSlot of cardSlots) {
            if (highlight) {
                cardSlot.classList.add("active-zone");
            } else {
                cardSlot.classList.remove("active-zone");
                cardSlot.classList.remove("over-zone");
            }
        }
    },

    deferredOriginChanges: function (origin, dragFeedbackClassName) {
        setTimeout(() => {
            origin.classList.remove(dragFeedbackClassName)
        })
    }
}


//
// import { dom } from "./dom.js";
//
// initDragAndDrop();
// console.log("trying to load drag cards")
//
// function initDragAndDrop() {
//     let allCards = document.getElementsByClassName('card')
//     for (let card of allCards){
//         card.draggable=true;
//         card.addEventListener('dragstart', dragStartHandler);
//         card.addEventListener('drag', dragHandler);
//         card.addEventListener('dragend', dragEndHandler);
//     }
//     let columns = document.getElementsByClassName('board-column-content')
//     for (let column of columns){
//         column.addEventListener("dragenter", dropZoneEnterHandler);
//         column.addEventListener("dragleave", dropZoneLeaveHandler);
//         column.addEventListener("dragover", dropZoneOverHandler);
//         column.addEventListener("drop", dropZoneDropHandler);
//     }
// }
//
//
// function dragStartHandler(ev){
//     console.log("trying to start drag with this", this)
//     this.classList.add('dragged', 'drag-feedback')
//     ev.dataTransfer.setData("text/html", "dragged")
//     deferredOriginChanges(this, 'drag-feedback')}
//
// function dragHandler(){}
//
// function dragEndHandler(){
//     this.classList.remove('dragged')}
//
//
// function dropZoneEnterHandler(ev){
//     if (ev.dataTransfer.types.includes("text/html")){
//         this.classList.add("over-zone")}
//     ev.preventDefault()}
//
// function dropZoneLeaveHandler(ev){
//     this.classList.remove("over-zone") // temporarly
//     if (ev.dataTransfer.types.includes("text/html") &&
//         ev.relatedTarget !== null &&
//         ev.currentTarget !== ev.relatedTarget.closest('.card')){
//         this.classList.remove("over-zone")}}
//
// function dropZoneOverHandler(ev){
//     if (ev.dataTransfer.types.includes("text/html")){
//         this.classList.add("over-zone")
//         ev.preventDefault()}}
//
//
// function dropZoneDropHandler(ev){
//     this.classList.remove("over-zone")
//     let draggedElement = document.querySelector('.dragged')
//     console.log(ev.currentTarget)
//     ev.currentTarget.appendChild(draggedElement)
//     ev.preventDefault()
//     dom.saveCardsStatus(this)
// }
//
//
// function setDropZonesHighlight(highlight = true) {
//     const cardSlots = document.getElementsByClassName("card-slot")
//     const deck = document.getElementById("deck")
//     if (highlight) {deck.classList.add("active-zone")
//     } else {
//         deck.classList.remove("active-zone");
//         deck.classList.remove("over-zone")}
//     for (const cardSlot of cardSlots) {
//         if (highlight) {
//             cardSlot.classList.add("active-zone");
//         } else {
//             cardSlot.classList.remove("active-zone");
//             cardSlot.classList.remove("over-zone");}}}
//
// function deferredOriginChanges(origin, dragFeedbackClassName){
//     setTimeout(() =>{
//         origin.classList.remove(dragFeedbackClassName)})}