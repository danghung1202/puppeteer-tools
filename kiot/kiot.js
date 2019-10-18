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
        ignoreHTTPSErrors: true,
        headless: true
    });

    const page = await browser.newPage()
    const pendingXHR = new PendingXHR(page);
    const navigationPromise = page.waitForNavigation()

    await page.goto('https://test1202.kiotviet.vn/', {
        waitUntil: 'domcontentloaded'
    })

    await page.setViewport({
        width: 1280,
        height: 800
    })

    await navigationPromise

    await page.waitForSelector('#UserName', {
        visible: true
    })

    await page.type('#UserName', 'your username')

    await page.type('#Password', 'your password')

    await page.click('#loginNewSale')

    await navigationPromise

    await pendingXHR.waitForAllXhrFinished();

    await page.goto('https://test1202.kiotviet.vn/#/Products', {
        waitUntil: 'domcontentloaded'
    })

    await navigationPromise
    await pendingXHR.waitForAllXhrFinished();

    await page.waitForSelector('.headerContent .kv2BtnExport', {
        visible: true
    })

    await page.evaluate(() => {
        document.querySelector('.headerContent .kv2BtnExport').click();
    })

    await pendingXHR.waitForAllXhrFinished();

    await page.waitForSelector('#importExportContent .iconKvExport a.noti_link', {
        visible: true
    })

    var downloadUrl = await page.evaluate(() => {
        return document.querySelector('#importExportContent .iconKvExport a.noti_link').href;
    })

    console.log(downloadUrl);
    await download(downloadUrl, path.basename(decodeURI(downloadUrl)), function () {
        console.log('done');
    });

    await browser.close()
})()