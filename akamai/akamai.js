const puppeteer = require('puppeteer');

const Variable = require('./variable');
const Rule = require('./rule');
const Behavior = require('./behavior');
const Criteria = require('./criteria');
const Menu = require('./menu');
const Property = require('./property');
const Cloudlets = require('./cloudlets');
const log = require('./log');

module.exports = {
    Property,
    Variable,
    Rule,
    Criteria,
    Behavior,
    Menu,
    Cloudlets,
    /**
     * Login to akamai home page using the cookies
     * @param {*} page 
     * @param {*} cookies Array of cookie json, for example: 
     * 
     * [ {
        "domain": ".akamai.com",
        "expirationDate": 1752203422.539523,
        "hostOnly": false,
        "httpOnly": false,
        "name": "_abck",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "xxxx",
        "id": 1
    } ]

    After you logged in to site, you can using some chrome extension to export the cookies
     * @param {*} url [Optional] The akamai page url, default `https://control.akamai.com/`
     */
    loginToAkamaiUsingCookies: async (page, cookies, url = "https://control.akamai.com/") => {
        // Set the cookies on the page
        await page.setCookie(...cookies);

        await page.setViewport({
            width: 1400,
            height: 900
        })
        await page.goto(url, {
            waitUntil: 'domcontentloaded'
        })
    },

    /**
     * Accept the the dialog `Any unsaved changes will be discarded` when navigate to new page without click 'Save' button to save all changes in property
     * 
     * This method should be invoked only one after login successfully to akamai
     * @param {*} page 
     */
    acceptTheUnsavedChangesDialogWhenNavigate: async (page) => {
        page.on('dialog', async dialog => {
            const message = dialog.message()
            log.white(`The page show the dialog with message ${message}`);
            if(message.includes('Any unsaved changes will be discarded')) {
                log.white(`Clicking "Yes/Ok" to ${message}`);
                await dialog.accept(); // press 'Yes'
            } else {
                log.white(`Clicking "No/Cancel" to ${message}`);
                await dialog.dismiss(); // press 'No'
            }
        });
    }
}