const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Express ve HTTP Server kurulumu
const app = express();
const server = http.createServer(app);

// Statik dosyalar için 'public' klasörünü kullan

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let apiKey = process.env.OPENAI_API_KEY;


let words = JSON.parse(fs.readFileSync("./public/words.json").toString());
app.get("/words", (req, res) => {


    res.json(words)

})

app.post('/generate-sentence', (req, res) => {
    const word = req.body.word;

    const axios = require('axios');
    let data = JSON.stringify({
        "model": "gpt-3.5-turbo-16k",
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": "Generate a short sentence, between 6 to 12 words, using the word '" + word + "' in a way that clearly demonstrates its meaning. The sentence should be simple and easy to understand for someone learning English."
            }

        ],
        "max_tokens": 60
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey,
        },
        data: data
    };

    axios.request(config)
        .then(response => {
            console.log(word, "-", response.data.choices[0].message.content)
            res.json({ answer: response.data.choices[0].message.content });
        }).catch(error => {
            res.status(500).send({ error });
        });



});

// Server'ı başlat
const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});