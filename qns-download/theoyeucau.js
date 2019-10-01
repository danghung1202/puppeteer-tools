/**
 * @name screenshots
 *
 * @desc Snaps a basic screenshot of the full New York Time homepage and saves it a .png file.
 *
 * @see {@link https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#screenshot}
 */

const puppeteer = require('puppeteer');
const {
    PendingXHR
} = require('pending-xhr-puppeteer');

const fs = require('fs');
var request = require('request');
var path = require("path");

//download function
var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

(async () => {
    const browser = await puppeteer.launch({
        headless: true
    })
    const page = await browser.newPage();
    const pendingXHR = new PendingXHR(page);

    await page.setViewport({
        width: 1280,
        height: 800
    })
    await page.goto('https://www.theoyeucau.com/episode/sac-dep-va-giong-hat/', {
        waitUntil: 'domcontentloaded'
    })

    await pendingXHR.waitForAllXhrFinished();

    // await page.waitForSelector('.vjs-big-play-button');
    // await page.click('.vjs-big-play-button')
    //await page.waitForSelector('iframe');

    //await page.waitFor(5000);

    // const frame = page.frames().find(frame => frame.url().indexOf('imasdk.googleapis.com') != -1)

    // await frame.waitForSelector('button.videoAdUiSkipButton')


    //var button = await frame.$('button.videoAdUiSkipButton');
    //console.log(button);
    //await frame.click('button.videoAdUiSkipButton')

    await page.waitForSelector('li.vjs-playlist-item');
    var srcs = await page.evaluate(() => {
        var lis = Array.from(document.querySelectorAll('li.vjs-playlist-item'));

        var audioSrc = [];
        lis.forEach(li => {
            li.click();

            var audioUrl = document.querySelector('audio.vjs-tech')
            audioSrc.push(audioUrl.src)
        })

        return audioSrc;
    });

    console.log(srcs);

    console.log("Begin");
    var playlist = await page.$$eval('li.vjs-playlist-item', lis => {
        var audioSrc = [];
        lis.forEach(li => {
            li.click();
            var audioUrl = document.querySelector('audio.vjs-tech')

            audioSrc.push(audioUrl.src)
        });
        return audioSrc;
    });

    console.log(playlist);

    const playlistItems = await page.$$('li.vjs-playlist-item');

    // for (var i = 0; i < playlistItems.length; i++) {
    //     await playlistItems[i].click();
    //     await page.waitFor(1000);
    //     console.log(await page.evaluate(() => {
    //         return document.querySelector('audio.vjs-tech').src;
    //     }));


    //     var audioUrl = await page.$eval('audio.vjs-tech', audio => {
    //         return audio.src
    //     })
    //     console.log(audioUrl);
    //     // await download(audioUrl, path.basename(decodeURI(audioUrl)), function () {
    //     //     console.log('done');
    //     // });
    // }

    //await page.screenshot({ path: 'theoyeucau.png', fullPage: true })
    //await page.waitFor(10000);
    await browser.close()
})()