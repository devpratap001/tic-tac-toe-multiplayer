const socket = io();

const form = document.querySelector("#form");
const playerName = document.querySelector("input");
const button = document.querySelector("#form > button");
var currentData = {};
var winningCases = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
]

function changeTurn(user, player) {
    if (user.name !== player.name) {
        document.querySelectorAll(".column").forEach((elem) => {
            elem.disabled = true;
        })
    } else {
        document.querySelectorAll(".column").forEach((elem) => {
            elem.disabled = false;
        })
    }
}

function checkGameOver(winner) {
    var buttons = document.querySelectorAll(".column");
    winningCases.forEach(caseArray => {
        const first = buttons[caseArray[0] - 1].innerHTML;
        const second = buttons[caseArray[1] - 1].innerHTML;
        const third = buttons[caseArray[2] - 1].innerHTML;
        if (first !== "" && second !== "" && third !== "") {
            if (first === second && first === third) {
                document.querySelector(".winningAlert").innerHTML = `<h2>Match won by ${winner.name}</h2>`
                document.querySelector(".boxes").style.display = "none";
                document.querySelector(".winningAlert").style.display = "block";
                return
            }
        }
    })
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    socket.emit("playerJoin", { name: playerName.value });
    socket.data = { name: playerName.value };
    playerName.value = ""
    playerName.setAttribute("disabled", "true")
    button.disabled = true;
    document.querySelector(".loader").style.display = "inline-block";
})

socket.on("matchFound", (data) => {
    document.querySelector(".container").style.display = "none";
    document.querySelector(".game").style.display = "flex";
    document.querySelector(".playerOne").innerHTML = data.playerOne.name;
    document.querySelector(".signOne").innerHTML = "O"
    document.querySelector(".playerTwo").innerHTML = data.playerTwo.name;
    document.querySelector(".signTwo").innerHTML = "X"
    document.querySelector(".userCardOne").classList.add("active")
    currentData = { ...data }

    changeTurn(socket.data, data.activePlayer);

    document.querySelectorAll(".column").forEach((elem, index) => {
        elem.addEventListener("click", () => {
            elem.innerHTML = currentData.turn;
            checkGameOver(currentData.activePlayer);
            socket.emit("clickedData", {
                turn: currentData.turn,
                buttonIndex: index,
                competor: socket.data.name === currentData.playerOne.name ? currentData.playerTwo : currentData.playerOne,
                currentPlayer: socket.data.name === currentData.playerOne.name ? currentData.playerOne : currentData.playerTwo
            })
            socket.emit("turnChangeClient", { ...currentData })
        }, { once: true });
    })
    socket.on("turnChangeServer", (data) => {
        document.querySelector(".userCardOne").classList.toggle("active")
        document.querySelector(".userCardTwo").classList.toggle("active")
        changeTurn(socket.data, data.activePlayer);
        currentData = { ...data };
    })
    socket.on("clickedDataServer", (data) => {
        const targetButton = document.querySelectorAll(".column")[data.buttonIndex]
        const cloneElem = targetButton.cloneNode(true);
        cloneElem.innerHTML = data.turn
        targetButton.parentNode.replaceChild(cloneElem, targetButton)
        checkGameOver(data.currentPlayer);
    })

    document.querySelector(".reloadBoard").addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelector(".winningAlert").style.display = "none"
        document.querySelector(".boxes").style.display = "grid"
        socket.emit("reloadBoard", { opponent: socket.data.name === currentData.playerOne.name ? currentData.playerTwo : currentData.playerOne })
        document.querySelectorAll(".column").forEach((elem, index) => {
            const cloneElem = elem.cloneNode(true);
            cloneElem.innerHTML = "";
            elem.parentNode.replaceChild(cloneElem, elem);
            cloneElem.addEventListener("click", () => {
                cloneElem.innerHTML = currentData.turn;
                checkGameOver(currentData.activePlayer);
                socket.emit("clickedData", {
                    turn: currentData.turn,
                    buttonIndex: index,
                    competor: socket.data.name === currentData.playerOne.name ? currentData.playerTwo : currentData.playerOne,
                    currentPlayer: socket.data.name === currentData.playerOne.name ? currentData.playerOne : currentData.playerTwo
                })
                socket.emit("turnChangeClient", { ...currentData })
            }, { once: true });
        })
    })
    socket.on("reloadBoardServer", () => {
        document.querySelector(".winningAlert").style.display = "none"
        document.querySelector(".boxes").style.display = "grid"
        document.querySelectorAll(".column").forEach((elem, index) => {
            const cloneElem = elem.cloneNode(true);
            cloneElem.innerHTML = "";
            elem.parentNode.replaceChild(cloneElem, elem);
            cloneElem.addEventListener("click", () => {
                cloneElem.innerHTML = currentData.turn;
                checkGameOver(currentData.activePlayer);
                socket.emit("clickedData", {
                    turn: currentData.turn,
                    buttonIndex: index,
                    competor: socket.data.name === currentData.playerOne.name ? currentData.playerTwo : currentData.playerOne,
                    currentPlayer: socket.data.name === currentData.playerOne.name ? currentData.playerOne : currentData.playerTwo
                })
                socket.emit("turnChangeClient", { ...currentData })
            }, { once: true });
        })
    })

    document.querySelector("#chatForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const message = document.querySelector(".chatInput");
        var outgoingMessage = document.createElement("div");
        outgoingMessage.classList.add("outgoingChat");
        outgoingMessage.innerText = message.value
        document.querySelector(".chatBox").appendChild(outgoingMessage);

        socket.emit("chatMessage", {
            competor: socket.data.name === currentData.playerOne.name ? currentData.playerTwo : currentData.playerOne,
            payload: message.value
        })
        message.value = "";
    })
    socket.on("chatMessageServer", (data) => {
        var incomingMessage = document.createElement("div");
        incomingMessage.classList.add("incomingChat");
        incomingMessage.innerText = data.payload
        document.querySelector(".chatBox").appendChild(incomingMessage);
    })
})
