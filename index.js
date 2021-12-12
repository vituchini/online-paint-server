const express = require('express')
const app = express()
const WSServer = require('express-ws')(app)
const aWss = WSServer.getWss()
const cors = require('cors')
const fs = require('fs')
const path = require("path");

const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

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

app.post('/image', (req, res) => {
    try {
        const data = req.body.img.replace('data:image/png;base64,', '')
        fs.writeFileSync(path.resolve(__dirname, 'files', `${req.query.id}.jpg`), data, 'base64')
        return res.status(200).json({message: 'OK'})
    } catch (e) {
        console.log('ERROR', e)
        return res.status(500).json('ERROR')
    }
})
app.get('/image', (req, res) => {
    try {
        const file = fs.readFileSync(path.resolve(__dirname, 'files', `${req.query.id}.jpg`))
        const data = 'data:image/png;base64,' + file.toString('base64')
        return res.status(200).json(data)
    } catch (e) {
        console.log('ERROR', e)
        return res.status(500).json('ERROR')
    }
})
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
