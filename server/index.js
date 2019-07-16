import app from './app';
import http from 'http';
import cron from 'node-cron';
import db from '../models';

var io = require('socket.io');

let server = http.createServer(app);
var io = io.listen(server);

const port = process.env.PORT || 8080;

cron.schedule('0 * * * *', () => {
    db.Centers.find().then(allCenters => {
        if (allCenters === null) {
            return;
        } else {
            allCenters.forEach(element => {
                // console.log('here');
                if (element.paid === true) {
                    if (Date.now() > element.payment_exp) {
                        element.paid = false;
                        element.save();
                    }
                }
            });
        }
    });
});

app.listen(port, (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log(`Server running on ${port}`);
});