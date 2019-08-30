const puppeteer = require('puppeteer');
const {
    PendingXHR
} = require('pending-xhr-puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        headless: false
    });

    const page = await browser.newPage()
    const pendingXHR = new PendingXHR(page);
    const navigationPromise = page.waitForNavigation()

    //await page.on('console', obj => console.log(obj.text()));

    await page.goto('https://niteco.efficienttime.com/', {
        waitUntil: 'domcontentloaded'
    })

    await page.setViewport({
        width: 1280,
        height: 800
    })

    await navigationPromise

    await page.waitForSelector('#frmLogIn #UserName', {
        visible: true
    })

    await page.type('#frmLogIn #UserName', 'hung.dang@niteco.se')

    await page.type('#frmLogIn #PassWord', '02091945')

    await page.click('#aLogin')

    await navigationPromise

    await pendingXHR.waitForAllXhrFinished();

    await page.waitFor(2000);

    await page.goto('https://niteco.efficienttime.com/Entry/My?week=36&year=2019&cm=0&ht=0', {
        waitUntil: 'domcontentloaded'
    })

    await navigationPromise
    await pendingXHR.waitForAllXhrFinished();

    await page.waitForSelector('.add_dialog', {
        visible: true
    })

    await page.evaluate(() => {
        document.querySelector('.time-sheet tr.controls a.add_dialog').click();
    })

    await page.waitForSelector('#dialog-workinghour', {
        visible: true
    });

    //await page.select('#swTasks', '8d31334c-1791-437b-8305-8e1e525d97e7');

    await page.evaluate(() => {

        var swTasks = document.querySelectorAll('#dialog-workinghour .editor-form select')[1];
        swTasks..querySelector('option[value="8d31334c-1791-437b-8305-8e1e525d97e7"]').selected = true;
        swTasks..value = '8d31334c-1791-437b-8305-8e1e525d97e7'
        // Create a new 'change' event
        var event = new Event('change');
        // Dispatch it.
        swTasks.dispatchEvent(event);

        document.querySelector('#dialog-workinghour .editor-form #SubTask').value = 'Daily Meeting';
        document.querySelectorAll('#dialog-workinghour .editor-form .button_row a')[1].click();
    })

    await page.waitFor(4000);

    var myTasks = [{
            issueKey: 'BULL-1910',
            summary: 'BULL-479 Investigate and estimate story',
            timespend: '4 hours'
        },
        {
            issueKey: 'BULL-633',
            summary: 'Merge Main Branch into Bullion Branch',
            timespend: '4 days, 5 hours'
        },
        {
            issueKey: 'BULL-1920',
            summary: 'BULL-940 Override Hephaestus Store Helper',
            timespend: '1 day, 2 hours, 30 minutes'
        },
        {
            issueKey: 'BULL-1909',
            summary: 'BULL-1288 Optimzie import historic metal prices',
            timespend: '7 hours'
        },
        {
            issueKey: 'BULL-1904',
            summary: 'BULL-1674 [Bug][PAMP] Can\'t checkout/sell back due to PAMP error',
            timespend: '3 hours'
        },
        {
            issueKey: 'BULL-1774',
            summary: 'BULL-940 Currency in bullion category listing page is shown £ for a customer\' currency $',
            timespend: '2 days, 1 hour'
        }
    ];

    for (var i = 0; i < myTasks.length; i++) {
        console.log(myTasks[i].summary);
        await page.evaluate((task) => {
            var swTasks = document.querySelectorAll('#dialog-workinghour .editor-form select')[1];
            swTasks.querySelector('option[value="5c179adc-ec0f-41ad-bfa9-1ba99f3320f9"]').selected = true;
            swTasks.value = '5c179adc-ec0f-41ad-bfa9-1ba99f3320f9'
            // Create a new 'change' event
            var event = new Event('change');
            // Dispatch it.
            swTasks.dispatchEvent(event);

            document.querySelector('#dialog-workinghour .editor-form #SubTask').value = task.summary;
            document.querySelectorAll('#dialog-workinghour .editor-form .button_row a')[1].click();
        }, myTasks[i]);
        await page.waitFor(4000);
    }

    await page.waitFor(4000);
    await page.evaluate(() => {
        document.querySelectorAll('#dialog-workinghour .editor-form .button_row a')[2].click();
    })

    await page.evaluate(() => {
        document.querySelector('.time-sheet tr.controls a.save').click();
    })

    // await pendingXHR.waitForAllXhrFinished();
    // await navigationPromise

    // await page.screenshot({
    //     path: 'timesheet.png',
    //     fullPage: true
    // })

    await browser.close()
})()