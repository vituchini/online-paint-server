const express = require('express')
const app = express()
const WSServer = require('express-ws')(app)
const aWss = WSServer.getWss()
const PORT = process.env.PORT || 5000

function broadcastConnection(ws, msg) {
    console.log(
        aWss.clients
    )
    aWss.clients.forEach(client => {
        if (client.id === msg.id) {
            client.send(JSON.stringify(msg))
        }
    })
}

function connectionHandler(ws, msg) {
    ws.id = msg.id
    broadcastConnection(ws, msg)
}

app.ws('/', (ws, res) => {
    ws.on('message', (msg) => {
        msg = JSON.parse(msg)
        console.log(msg.id)
        switch (msg.method) {
            case 'connection': {
                connectionHandler(ws, msg)
                break
            }
            case 'draw': {
                broadcastConnection(ws, msg)
                break
            }
        }
    })
})

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
