const puppeteer = require('puppeteer');
const {
    PendingXHR
} = require('pending-xhr-puppeteer');

const jsonIO = require('../helper/json-io');

(async () => {
    const config = await jsonIO.readJson('./config.json');
    if (!config || !config.jira) return;

    const browser = await puppeteer.launch({
        headless: false
    })

    const page = await browser.newPage()
    const pendingXHR = new PendingXHR(page);
    const navigationPromise = page.waitForNavigation()

    //await page.on('console', obj => console.log(obj.text()));

    await page.goto('https://maginus.atlassian.net/', {
        waitUntil: 'domcontentloaded'
    })

    await page.setViewport({
        width: 1280,
        height: 800
    })

    await navigationPromise

    await page.waitForSelector('#form-login #username', {
        visible: true
    })
    await page.type('#form-login #username', config.jira.username)

    await page.click('#login-submit')

    await pendingXHR.waitForAllXhrFinished();

    await page.waitForSelector('#form-login #password', {
        visible: true
    })

    await page.type('#form-login #password', config.jira.password)

    await page.click('#login-submit')

    await navigationPromise

    await pendingXHR.waitForAllXhrFinished();

    await page.waitForSelector('#navigation-app #quickSearchGlobalItem', {
        visible: true
    })

    await page.waitFor(2000);

    await page.goto('https://maginus.atlassian.net/issues/?jql=order%20by%20created%20DESC', {
        waitUntil: 'domcontentloaded'
    })

    await navigationPromise
    await pendingXHR.waitForAllXhrFinished();

    await page.waitForSelector('.search-container', {
        visible: true
    })

    //Check textarea advanced-search is visible and available
    const isAdvancedSearchVisible = await page.evaluate(() => {
        let textarea = document.querySelector('.search-container #advanced-search');
        if (textarea) return true;
        return false;
    })

    if (!isAdvancedSearchVisible) {
        await page.evaluate(() => {
            document.querySelector('.search-container .mode-switcher a.active').click();
        })
        await pendingXHR.waitForAllXhrFinished();
        await page.waitFor(1000);
        await page.waitForSelector('.search-container #advanced-search', {
            visible: true
        })
    }

    await page.evaluate((query) => {
        document.querySelector('.search-container #advanced-search').value = query;
    }, config.jira.query);

    await page.click('.search-container .search-options-container button')
    await pendingXHR.waitForAllXhrFinished();
    await page.waitFor(1000);


    const result = await page.evaluate(() => {
        var rows = Array.from(document.querySelectorAll('#issuetable tbody tr'));
        var jsonResults = []
        rows.forEach(tr => {
            var issueKey = tr.querySelector('.issuekey').innerText;
            var summary = tr.querySelector('.summary').innerText;
            var timespend = tr.querySelector('.aggregatetimespent').innerText;
            jsonResults.push({
                issueKey,
                summary,
                timespend
            })
        });

        return jsonResults;
    })

    var success = await jsonIO.writeJson('tasks.json', result);
    console.log(success);
    await browser.close()
})()