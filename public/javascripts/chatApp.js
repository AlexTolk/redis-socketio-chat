const ul = document.getElementById('messages');
const text = document.getElementById('messageInput');
const form = document.getElementById('form');
const room = document.getElementById('room');
let socket;

const sessionLog = [];

function handleSelection() {
    const newRoom = room.value;
    if (socket.currentRoom) {
        socket.emit('leave', { room: socket.currentRoom });
        sessionLog.pop();
    }
    sessionLog.push(newRoom);
    socket.currentRoom = newRoom;
    join(newRoom);
}

function addMessage(isSelf, message) {
    let li = document.createElement('li');
    li.classList.add(isSelf ? 'right' : 'left');
    let span = document.createElement('span');
    span.textContent = message;
    li.appendChild(span);
    ul.appendChild(li);
}

function join(id) {
    if (!socket) return;
    socket.emit('join', { room: id })
    axios.get(`http://localhost:11001/chat/get/${id}`)
        .then(response => {
            response.data.forEach(message => {
                addMessage(message.userID === socket.id, message.message);
            });
        })
        .catch(error => {
            console.error('Error fetching chat history:', error);
        });
}

function start(){
    socket = io('ws://localhost:11001', {
        transports: ['websocket']
    });
    const initialRoom = room.value;
    socket.currentRoom = initialRoom;
    sessionLog.push(initialRoom);
    join(initialRoom);
    socket.on('message', (payload) => {
        addMessage(payload.userID === socket.id, payload.message);
    });
}


function send(to, message) {
    if (message && socket && socket.connected) {
        socket.emit('send', {to, message}, (response) => {
            if(response=='ok') {
                addMessage(true, message);
            }
        });
    }
}


form.addEventListener('submit', (event) => {
    event.preventDefault();
    send(socket.currentRoom, text.value)
    text.value = '';
});
window.onload = start;