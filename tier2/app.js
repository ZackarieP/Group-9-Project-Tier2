// Layer 2
const express = require("express");
const app = express();
app.use(express.json({limit: '5mb'}));
const port = 8080;
const http = require('http');
const fs = require('fs');

// Layer 2 get all images and edit name and path
app.get('/images', (req, res) => {
    http.get('http://10.128.0.2:8080/images', (result) => {
        const {statusCode} = result;
        const contentType = result.headers['content-type'];

        let error;
        // Any 2xx status code signals a successful response but
        // here we're only checking for 200.
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
        }
        if (error) {
            console.error(error.message);
            // Consume response data to free up memory
            result.resume();
            return;
        }

        result.setEncoding('utf8');
        let rawData = '';
        result.on('data', (chunk) => {
            rawData += chunk;
        });

        result.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                let strHTML = "";
                parsedData.forEach(element => {
                    element = element.replace('myjpeg', 'jpeg');
                    strHTML += "<a href='/images/" + element + "'>" + element + "</a><br />";
                });
                res.send(strHTML);
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
});

app.get('/images/*', (req, res) => {
    let paramImage = req.params[0].replace('jpeg', 'myjpeg');
    http.get('http://10.128.0.2:8080/images/' + paramImage, (result) => {
        const {statusCode} = result;
        const contentType = result.headers['content-type'];

        let error;
        // Any 2xx status code signals a successful response but
        // here we're only checking for 200.
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
        }
        if (error) {
            console.error(error.message);
            // Consume response data to free up memory
            result.resume();
            return;
        }

        result.setEncoding('utf8');
        let rawData = '';
        result.on('data', (chunk) => {
            rawData += chunk;
        });

        result.on('end', () => {
            try {
                res.send(rawData);
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
});

app.post("/upload", (req, res) => {
    req.body.image.name = req.body.image.name.replace('jpeg', 'myjpeg');
    const postData = JSON.stringify(req.body.image);

    let options = {
        host: '10.128.0.2', port: port, path: '/upload', method: 'POST', headers: {
            'Content-Type': 'application/json'
        }
    };

    let httpRequest = http.request(options, function (response) {
        console.log(`STATUS: ${response.statusCode}`);
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        response.on('end', () => {
            console.log('No more data in response.');
            res.send('Tier 2 upload complete.');
        });
    });

    httpRequest.write(postData);
    httpRequest.end();
});


app.listen(port, (err) => {
    if (err) console.log(err);
    console.log(`Listening on port ${port}`);
});