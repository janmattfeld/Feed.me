'use strict';

const router = module.exports = require('express').Router();

const request = require('request');
const FeedParser = require('feedparser');

/*
 * Example: /feed/get?url=http://rss.golem.de/rss.php?feed=ATOM1.0
 */
router.get('/get', (req, res) => {

    const feedURL = req.query.url;

    let feedRequest = request(feedURL, {timeout: 10000, pool: false});
    feedRequest.setMaxListeners(50);
    // Some feeds do not respond without user-agent and accept headers.
    feedRequest.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
    feedRequest.setHeader('accept', 'text/html,application/xhtml+xml');

    let feedParser = new FeedParser({addmeta: false});

    let feed = {
        meta: null,
        articles: []
    };

    feedRequest.on('response', (feedResponse) => {
        // check if status code is not correct
        if (feedResponse.statusCode !== 200) {
            return req.emit('error', new Error('Bad status code'))
        }
        // if the res is correct, when can pipe the response
        feedRequest.pipe(feedParser); // pipe response to feedparser
    });

    feedRequest.on('error', (err) => {
        // handle request error
        console.log(err)
    });

    feedParser.on('readable', () => {
        feed.meta = feedParser.meta;
        let item = feedParser.read();
        while (item) {
            feed.articles.push(item);
            // get the next item, if none, then item will be null next time
            item = feedParser.read();
        }
    });

    feedParser.on('end', () => {
        // handle that we've finished reading articles
        res.send(feed);
    });

    feedParser.on('error', (err) => {
        // handle parser error
        console.log(err);
    });
});
