const puppeteer = require('puppeteer');
const {
    PendingXHR
} = require('pending-xhr-puppeteer');

(async () => {
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
    await page.type('#form-login #username', 'hung.dang@niteco.se')

    await page.click('#login-submit')

    await pendingXHR.waitForAllXhrFinished();

    await page.waitForSelector('#form-login #password', {
        visible: true
    })

    await page.type('#form-login #password', '02091945j')

    await page.click('#login-submit')

    await navigationPromise

    await pendingXHR.waitForAllXhrFinished();

    await page.waitForSelector('#navigation-app #quickSearchGlobalItem', {
        visible: true
    })

    await page.waitFor(2000);

    // await page.evaluate(() => {
    //     document.querySelector('#navigation-app #quickSearchGlobalItem').click();
    // })

    // await pendingXHR.waitForAllXhrFinished();

    // await page.waitFor(1000);

    // await page.evaluate(() => {
    //     document.querySelector('a.jvwfrr').click();
    // })

    await page.goto('https://maginus.atlassian.net/issues/?jql=order%20by%20created%20DESC', {
        waitUntil: 'domcontentloaded'
    })

    await navigationPromise
    await pendingXHR.waitForAllXhrFinished();

    await page.waitForSelector('.search-container', {
        visible: true
    })

    //Check textarea advanced-search is visible and available
    var isAdvancedSearchVisible = await page.evaluate(() => {
        let textarea = document.querySelector('.search-container #advanced-search');
        if (textarea) return true;
        return false;
    })

    console.log(isAdvancedSearchVisible);

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

    await page.evaluate(() => {
        document.querySelector('.search-container #advanced-search').value = 'project = BULL AND worklogAuthor = hung.dang AND worklogDate >= -7d AND worklogDate <= -1d  ORDER BY status ASC';
    })
    await page.click('.search-container .search-options-container button')
    await pendingXHR.waitForAllXhrFinished();
    await page.waitFor(1000);


    var result = await page.evaluate(() => {
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

    console.log(result);

    await browser.close()
})()