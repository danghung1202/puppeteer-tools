const puppeteer = require('puppeteer');

const jsonIO = require('../../../helper/json-io');
const akamai = require('../../akamai');
const log = require('../../log');
const json2csv = require('json2csv').parse;
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        slowMo: 10
    })
    const page = await browser.newPage();

    const akamaiUrl = "https://control.akamai.com/";
    const cookies = await jsonIO.readJson('./akamai/data/cookies.json');
    const domains = await jsonIO.readJson('./akamai/data/domains.json');
    await akamai.loginToAkamaiUsingCookies(page, cookies, akamaiUrl);

    const result = [];
    for (let i = 0; i < domains.length; i++) {
        try {

            await akamai.Property.goToPropertyPageByDomain(page, domains[i]);

            const stagingVersion = await akamai.Property.getStagingVersionNumber(page)
            const productionVersion = await akamai.Property.getProductionVersionNumber(page)
            const staging = await akamai.Property.getSummaryOfPropertyVersion(page, stagingVersion)
            const production = await akamai.Property.getSummaryOfPropertyVersion(page, productionVersion)
            result.push({
                hostname: domains[i],
                staging: staging.version,
                stagingLastEdited: staging.lastEdited,
                stagingAuthor: staging.author,
                stagingNotes: staging.notes,
                production: production.version,
                productionLastEdited: production.lastEdited,
                productionAuthor: production.author,
                productionNotes: production.notes,
            })
            log.green(`${domains[i]} Get info successfully`)

        } catch (error) {
            log.redBg(domains[i] + ": " + error);
        }
    }

    // Convert to CSV
    const fields = ['hostname', 'staging', 'stagingLastEdited', 'stagingAuthor', 'stagingNotes', 'production', 'productionLastEdited', 'productionAuthor', 'productionNotes'];
    const csv = json2csv(result, {
        fields
    });

    // Save CSV to file
    fs.writeFileSync('./akamai/tasks/getversion/versions.csv', csv);
    log.greenBg('Save file successfully')
    await page.screenshot({
        path: 'home.png',
    });
    //await browser.close()
})()