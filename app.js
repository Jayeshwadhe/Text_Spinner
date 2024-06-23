const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const stopWords = require('./stopwords')
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/spin', async (req, res) => {
    const text = req.body.text;
    const words = text.split(' ');

    const processedWords = await Promise.all(words.map(async word => {
        if (word.length <= 2 || stopWords.includes(word.toLowerCase())) {
            return word;
        }
        try {
            const response = await axios.get(`https://api.datamuse.com/words?rel_syn=${word}`);
            const synonyms = response.data;
            if (synonyms.length > 0) {
                const randomSynonym = synonyms[Math.floor(Math.random() * synonyms.length)].word;
                return randomSynonym;
            }
            return word;
        } catch (error) {
            console.error(`Error fetching synonyms for ${word}:`, error);
            return word;
        }
    }));

    const spunText = processedWords.join(' ');
    res.render('index', { spunText });
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
