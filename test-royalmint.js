const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true
    });
    const page = await browser.newPage()

    const navigationPromise = page.waitForNavigation()

    await page.setViewport({
        width: 1280,
        height: 800
    })

    await page.goto('https://royalmint.local/')

    await page.screenshot({
        path: 'homepage.png',
        fullPage: true
    })

    await page.waitForSelector('.brand-header > .rm-navbar-container > .button-group > .btn > .trmi-user')
    await page.click('.brand-header > .rm-navbar-container > .button-group > .btn > .trmi-user')

    await page.waitForSelector('.col-xs-12 > #loginForm-header #loginEmail1-header')
    await page.click('.col-xs-12 > #loginForm-header #loginEmail1-header')

    await page.type('.col-xs-12 > #loginForm-header #loginEmail1-header', 'danghung1202@gmail.co')

    await page.waitForSelector('.ng-pristine > .row > .col-xs-12 > #login-header > span')
    await page.click('.ng-pristine > .row > .col-xs-12 > #login-header > span')

    await page.waitForSelector('.col-xs-12 > #securityQuestion-header > #formSecurityQuestion > .form-group > .form-control')
    await page.click('.col-xs-12 > #securityQuestion-header > #formSecurityQuestion > .form-group > .form-control')

    await page.waitForSelector('#formSecurityQuestion > .row > .col-xs-12 > #login-securityQuestion > span')
    await page.click('#formSecurityQuestion > .row > .col-xs-12 > #login-securityQuestion > span')

    await navigationPromise

    await page.waitForSelector('#miniBasket > .row > .col-md-9 > .text-right > .btn-default')
    await page.click('#miniBasket > .row > .col-md-9 > .text-right > .btn-default')

    await page.waitForSelector('#pageTop > #menuOverlay')
    await page.click('#pageTop > #menuOverlay')

    await navigationPromise

    await page.waitForSelector('.col-xs-12 > .input-group > .input-group-btn:nth-child(3) > .btn > .trmi')
    await page.click('.col-xs-12 > .input-group > .input-group-btn:nth-child(3) > .btn > .trmi')

    await page.waitForSelector('.row > .col-xs-12 > .row > .col-xs-6 > .btn')
    await page.click('.row > .col-xs-12 > .row > .col-xs-6 > .btn')

    await navigationPromise

    await page.waitForSelector('#checkoutForm #checkoutSelectAdress')
    await page.click('#checkoutForm #checkoutSelectAdress')

    await page.select('#checkoutForm #checkoutSelectAdress', '8')

    await page.waitForSelector('#checkoutForm #checkoutSelectAdress')
    await page.click('#checkoutForm #checkoutSelectAdress')

    await page.waitForSelector('.container > .row > .col-xs-12 > #checkoutForm > .btn')
    await page.click('.container > .row > .col-xs-12 > #checkoutForm > .btn')

    await navigationPromise

    await page.waitForSelector('.col-xs-12 > #checkoutForm #paymentMethod')
    await page.click('.col-xs-12 > #checkoutForm #paymentMethod')

    await page.select('.col-xs-12 > #checkoutForm #paymentMethod', '611ffe48-b02a-4e4e-aa4d-007e45b3ad42')

    await page.waitForSelector('.col-xs-12 > #checkoutForm #paymentMethod')
    await page.click('.col-xs-12 > #checkoutForm #paymentMethod')

    await page.waitForSelector('.row > .col-xs-12 > #checkoutForm > .checkbox > label')
    await page.click('.row > .col-xs-12 > #checkoutForm > .checkbox > label')

    await page.waitForSelector('.container #payNowButton')
    await page.click('.container #payNowButton')

    await navigationPromise

    await page.screenshot({
        path: 'checkout.png',
        fullPage: true
    })

    await browser.close()
})()