//Initialize the express 'app' object
let express = require('express');
let app = express();
app.use('/', express.static('public'));
app.use("/scripts", express.static(__dirname + '/public/javascripts'));
app.use("/styles", express.static(__dirname + '/public/stylesheets'));
app.use("/images", express.static(__dirname + '/public/images'));
app.use("/sounds", express.static(__dirname + '/public/sounds'));



app.get('/dissonance', function (req, res) {
    res.sendFile('public/dissonance.html', { root: __dirname });

})

app.get('/consonance', function (req, res) {
    res.sendFile('public/consonance.html', { root: __dirname });

})


//Initialize the actual HTTP server
let http = require('http');
let server = http.createServer(app);
let port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("Server listening at port: " + port);
});

//Initialize socket.io
let io = require('socket.io');
io = new io.Server(server);

let disPlayers = [];
let consPlayers = [];
let currentUser;
let currentConsUser;
let userGone;
let distBetween;
let disCount = 0;
let consCount = 0;


//Listen for individual clients/users to connect
io.sockets.on('connection', function (socket) {
    console.log("We have a new client: " + socket.id);
    io.sockets.emit('disCount', disCount);
    io.sockets.emit('consCount', consCount);


    //when a user joins, send that user its own socket ID
    socket.emit('userID', socket.id);

    socket.on('joinRoom', function (room) {
        console.log("join request received");
        console.log(room);
        if (room == "dis") {
            console.log(disCount);
            if (disCount < 2) {
                disPlayers.push({
                    x: 0,
                    y: 0,
                    id: socket.id,
                    xDist: 0,
                    yDist: 0,
                    totalDist: 0
                });
                disCount++;
                console.log(disPlayers[0]);
                //when a user joins, send that user its own socket ID
                socket.emit('playerStatus', "Playing");

            } else {
                socket.emit('playerStatus', "Observing");
            }
            io.sockets.emit('disCount', disCount);
        } else if (room == "cons") {
            console.log(consCount);
            if (consCount < 2) {
                consPlayers.push({
                    x: 0,
                    y: 0,
                    id: socket.id,
                    xDist: 0,
                    yDist: 0,
                    totalDist: 0
                });
                consCount++;
                console.log(consPlayers[0]);
                //when a user joins, send that user its own socket ID
                socket.emit('playerStatus', "Playing");

            } else {
                socket.emit('playerStatus', "Observing");
            }
            io.sockets.emit('consCount', consCount);
        }
    });

    //Listen for a message named 'data' from this client
    socket.on('dataDis', function (data) {
        //Data can be numbers, strings, objects
        console.log("Received: 'data' " + data);

        //assign incoming user data to an index in our users array so we can distinguish between users.
        //check incoming data.socket.id against the socket ids of the users that have connected
        //identify which user's data is associated with the data that has come in
        for (i = 0; i < disPlayers.length; i++) {
            if (disPlayers[i].id == data.id) {
                currentUser = i;
            }
        }


        //grab incoming data of mouseX and mouseY and update users array with current XY data
        disPlayers[currentUser].x = data.x;
        disPlayers[currentUser].y = data.y;

        //-----------calculate distances ---------
        let xTotal = 0;
        let yTotal = 0;

        // establish an average point between the xy coordinates of the disPlayers
        for (i = 0; i < disPlayers.length; i++) {
            xTotal = disPlayers[i].x + xTotal;
            yTotal = disPlayers[i].y + yTotal;
        }

        let avgX = xTotal / disPlayers.length;
        let avgY = yTotal / disPlayers.length;

        // calculate the distance between the user and the average point

        for (i = 0; i < disPlayers.length; i++) {
            disPlayers[i].xDist = disPlayers[i].x - avgX;
            disPlayers[i].yDist = disPlayers[i].y - avgY;
            let x = disPlayers[i].xDist;
            let y = disPlayers[i].yDist;
            distBetween = Math.sqrt(x * x + y * y);
            disPlayers[i].totalDist = distBetween;
        }


        //Send the data to all clients, including this one
        //Set the name of the message to be 'data'
        io.sockets.emit('data', disPlayers);

        //Send the data to all other clients, not including this one
        // socket.broadcast.emit('data', data);

        //Send the data to just this client
        // socket.emit('data', data);
    });

    socket.on('dataCons', function (dataC) {
        //Data can be numbers, strings, objects
        console.log("Received: 'data' " + dataC);

        //assign incoming user data to an index in our users array so we can distinguish between users.
        //check incoming data.socket.id against the socket ids of the users that have connected
        //identify which user's data is associated with the data that has come in
        for (i = 0; i < consPlayers.length; i++) {
            if (consPlayers[i].id == dataC.id) {
                currentConsUser = i;
            }
        }


        //grab incoming data of mouseX and mouseY and update users array with current XY data
        consPlayers[currentConsUser].x = dataC.x;
        consPlayers[currentConsUser].y = dataC.y;

        //-----------calculate distances ---------
        let xTotal = 0;
        let yTotal = 0;

        // establish an average point between the xy coordinates of the disPlayers
        for (i = 0; i < consPlayers.length; i++) {
            xTotal = consPlayers[i].x + xTotal;
            yTotal = consPlayers[i].y + yTotal;
        }

        let avgX = xTotal / consPlayers.length;
        let avgY = yTotal / consPlayers.length;

        // calculate the distance between the user and the average point

        for (i = 0; i < consPlayers.length; i++) {
            consPlayers[i].xDist = consPlayers[i].x - avgX;
            consPlayers[i].yDist = consPlayers[i].y - avgY;
            let x = consPlayers[i].xDist;
            let y = consPlayers[i].yDist;
            distBetween = Math.sqrt(x * x + y * y);
            consPlayers[i].totalDist = distBetween;
        }


        //Send the data to all clients, including this one
        //Set the name of the message to be 'data'
        io.sockets.emit('data', consPlayers);

        //Send the data to all other clients, not including this one
        // socket.broadcast.emit('data', data);

        //Send the data to just this client
        // socket.emit('data', data);
    });


    //Listen for this client to disconnect, then remove them from the array of users
    socket.on('disconnect', function () {
        console.log("A client has disconnected: " + socket.id);

        for (i = 0; i < disPlayers.length; i++) {
            if (disPlayers[i].id == socket.id) {
                userGone = i;
                disCount--;
            }
        }
        disPlayers.splice(userGone, 1);
        console.log("this guy left" + userGone);
        console.log("these are here" + disPlayers);

        for (i = 0; i < consPlayers.length; i++) {
            if (consPlayers[i].id == socket.id) {
                userGone = i;
                consCount--;
            }
        }
        consPlayers.splice(userGone, 1);
        console.log("this guy left" + userGone);
        console.log("these are here" + consPlayers);
    });
});