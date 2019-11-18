const puppeteer = require('puppeteer');
const {
    PendingXHR
} = require('pending-xhr-puppeteer');
const path = require("path");
const fileDownload = require('../helper/file-download');

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
    const result = await fileDownload.downloadFile(downloadUrl, path.basename(decodeURI(downloadUrl)));

    await browser.close()
})()