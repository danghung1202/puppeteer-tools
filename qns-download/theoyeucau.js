const puppeteer = require('puppeteer');
const {
    PendingXHR
} = require('pending-xhr-puppeteer');

const path = require("path");
const fileDownload = require('../helper/file-download');

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

    console.log(musicUrls);

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
        let result = await fileDownload.downloadFile(musicUrls[i], path.basename(decodeURI(musicUrls[i])));
        if (!result) console("Failed to download at url " + musicUrls[i]);
    }

    //await page.waitFor(10000);
    await browser.close()
})()