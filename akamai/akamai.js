const puppeteer = require('puppeteer');

const Variable = require('./variable');
const Rule = require('./rule');
const Behavior = require('./behavior');
const Criteria = require('./criteria');
const Menu = require('./menu');
const Property = require('./property');

module.exports = {
    Property,
    Variable,
    Rule,
    Criteria,
    Behavior,
    Menu,

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
            width: 1280,
            height: 800
        })
        await page.goto(url, {
            waitUntil: 'domcontentloaded'
        })
    }
}