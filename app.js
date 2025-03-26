const express = require('express');
const path = require('path');
const config = require('./config.json');
const youtube = require('./youtube');

const app = express();
app.use(express.json());

// we can set it in configuration
// or get it via /api/take-token
let accessToken = config.accessToken;
const charMap = new Map();
for (const [normalizedChar, variantsString] of Object.entries(config.map)) {
  const variants = variantsString.split(',').map(c => c.trim());
  for (const variant of variants) {
    charMap.set(variant.toLowerCase(), normalizedChar);
  }
}

function normalize(text) {
    return [...text.toLowerCase()]
      .filter(char => !/\s/.test(char))
      .map(char => charMap.get(char) || char)
      .join('');
}

function isMatch(comment, target) {
    const normalized = normalize(comment);
    return normalized.includes(target);
}

function judge(topLevel) {
    config.words.forEach(word => {
        if(isMatch(topLevel.snippet.textDisplay, word)) {
            console.log(`${topLevel.id} ${topLevel.snippet.authorDisplayName}: ${topLevel.snippet.textDisplay}`);

            youtube.setModerationStatus(accessToken, topLevel.id, 'heldForReview')
            // check if it not cleanse, by add ! in front of isMatch above
            // if(isSpam(topLevel.snippet.textDisplay, 'max'))
            //     console.log(`${topLevel.id} ${topLevel.snippet.authorDisplayName}: ${topLevel.snippet.textDisplay}`);
            // else if(isSpam(topLevel.snippet.textDisplay, '33'))
            //     console.log(`${topLevel.id} ${topLevel.snippet.authorDisplayName}: ${topLevel.snippet.textDisplay}`);
        }});
}

// let test = '𝘔𝐴𝘟 𝟥3';
// console.log(isMatch(test));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/take-token', (req, res) => {
    const {token} = req.body;
    console.log(`received token: ${token.length} in length`);
    accessToken = token;
    res.json({ message: 'OK' });
});

app.get('/api/process', async (req, res) => {
    if(accessToken == '') {
        res.json({ message: "TOKEN required" });
        return;
    }

    let data = await youtube.search(accessToken, config, 1);
    data.items.forEach(async video => {
        let comments = await youtube.commentThreads(accessToken, video.id.videoId)
        comments.items.forEach(async comment => {
            let topLevel = comment.snippet.topLevelComment;
            judge(topLevel);
            if(comment.replies != undefined)
            {
                comment.replies.comments.forEach(async reply => {
                    judge(reply);
                });
            }
        });
    });

    res.json({ message: 'OK' });
});

app.get('/', (req, res) => {
    res.render('index', config);
});

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
