const puppeteer = require('puppeteer');
const {
    PendingXHR
} = require('pending-xhr-puppeteer');

const jsonIO = require('../helper/json-io');

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

    await page.type('#frmLogIn #UserName', 'your username')

    await page.type('#frmLogIn #PassWord', 'your password')

    await page.click('#aLogin')

    await navigationPromise

    await pendingXHR.waitForAllXhrFinished();

    await page.waitFor(2000);

    await page.goto('https://niteco.efficienttime.com/Entry/My?week=39&year=2019&cm=0&ht=0', {
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
        swTasks.querySelector('option[value="8d31334c-1791-437b-8305-8e1e525d97e7"]').selected = true;
        swTasks.value = '8d31334c-1791-437b-8305-8e1e525d97e7'
        // Create a new 'change' event
        var event = new Event('change');
        // Dispatch it.
        swTasks.dispatchEvent(event);

        document.querySelector('#dialog-workinghour .editor-form #SubTask').value = 'Daily Meeting';
        document.querySelectorAll('#dialog-workinghour .editor-form .button_row a')[1].click();
    })

    await page.waitFor(2000);

    const myTasks = await jsonIO.readJson('tasks.json');

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