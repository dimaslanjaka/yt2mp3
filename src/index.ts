import * as ytdl from 'ytdl-core';
import * as express from 'express';
import * as bodyParser from 'body-parser';

function getInfo(url: string) {
    return new Promise((resolve, reject) => {
        ytdl.getInfo(url, (err, info) => {
            if (err) {
                reject(err)
            } else {
                resolve(info.formats.map(format => {
                    return {
                        url: format.url,
                        quality: format.quality,
                        quality_label: format.quality_label,
                        type: format.type
                    }
                }))
            }
        });
    })
}

const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));
app.get('/api', (request, response) => {

    let url = request.query.url
    if (!url) {
        response.status(400)
            .json({
                success: false,
                message: 'URL must be specified'
            })
        return;
    }


    getInfo(url)
        .then(val => response.status(200).json(val))
        .catch(err => response.status(500).send(err))
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});
