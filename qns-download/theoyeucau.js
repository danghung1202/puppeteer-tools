const puppeteer = require('puppeteer');
const {
    PendingXHR
} = require('pending-xhr-puppeteer');

const path = require("path");
const jsonIO = require('../helper/json-io');
const fileIO = require('../helper/file-io');
const fileDownload = require('../helper/file-download');

(async () => {
    const browser = await puppeteer.launch({
        headless: true
    })
    const page = await browser.newPage();
    const pendingXHR = new PendingXHR(page);
    const config = await jsonIO.readJson('./config.json');

    if (!config || !config.url) return;

    var isFolderExists = await fileIO.exists(config.folder);
    if (!isFolderExists) await fileIO.mkdirRecursive(config.folder);

    await page.setViewport({
        width: 1280,
        height: 800
    })
    await page.goto(config.url, {
        waitUntil: 'domcontentloaded'
    })

    await pendingXHR.waitForAllXhrFinished();

    await page.waitForSelector('li.vjs-playlist-item');

    const musicUrls = await page.evaluate(() => {
        const lis = Array.from(document.querySelectorAll('li.vjs-playlist-item'));

        var audioSrc = [];
        lis.forEach(li => {
            li.click();

            var audioUrl = document.querySelector('audio.vjs-tech')
            audioSrc.push(audioUrl.src)
        })

        return audioSrc;
    });

    jsonIO.writeJson(`${config.folder}/playlist.json`, musicUrls);

    //// other way to get playlist url
    // var playlist = await page.$$eval('li.vjs-playlist-item', lis => {
    //     var audioSrc = [];
    //     lis.forEach(li => {
    //         li.click();
    //         var audioUrl = document.querySelector('audio.vjs-tech')

    //         audioSrc.push(audioUrl.src)
    //     });
    //     return audioSrc;
    // });

    // console.log(playlist);

    for (var i = 0; i < musicUrls.length; i++) {
        console.log(`Downloading at url ${musicUrls[i]}`);

        let result = await fileDownload.downloadFile(musicUrls[i], `${config.folder}/${path.basename(decodeURI(musicUrls[i]))}`)
            .catch(err => {
                console.log(err);
                return false;
            });

        if (!result) console.log("Failed to download at url " + musicUrls[i]);
    }

    //await page.waitFor(10000);
    await browser.close()
})()