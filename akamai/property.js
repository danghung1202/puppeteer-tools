const puppeteer = require('puppeteer');

const path = require("path");
const jsonIO = require('../helper/json-io')

/**
 * When you are in Property page, you can get version number of staging/production
 * @param {*} page The Puppeteer's page object
 * @param {*} environment `STAGING` | `PRODUCTION`
 * @returns Version number, ex Version 50
 */
const getVersionNumberOfStagingOrProduction = async (page, environment) => {
    const xpathActiveVersion = `//pm-active-version[@network="${environment}"]//pm-version-link//span`;
    //Waiting for element to be visible
    await page.locator('xpath=' + xpathActiveVersion).wait();

    const versionNumber = await page.$eval('xpath=' + xpathActiveVersion, el => el.innerText);
    return versionNumber
}

/**
 * When you are in Property page, you can navigate to staging/production version page
 * @param {*} page The Puppeteer's page object
 * @param {*} environment `STAGING` | `PRODUCTION`
 * @returns 
 */
const goToStagingOrProductionPropertyPage = async (page, environment) => {
    const xpathStaging = `//pm-active-version[@network="${environment}"]//pm-version-link//a`;
    await page.locator('xpath=' + xpathStaging).click();
    await page.waitForNavigation();
}

/**
 * When you are in Property page, you click to create new version based on staging/production version
 * @param {*} page The Puppeteer's page object
 * @param {*} environment `STAGING` | `PRODUCTION`
 * @returns 
 */
const clickToNewVersionBasedOnStagingOrProd = async (page, environment) => {
    const xpathNewVersion = `//pm-active-version[@network="${environment}"]//button[contains(text(), "New Version")]`
    const button = await page.locator('xpath=' + xpathNewVersion).click();
    await page.waitForNavigation();
    //const xpathVersionMenu = '//pm-active-version[@network="STAGING"]//button[contains(text(), "New Version")]/following-sibling::button'
    //const buttonMenu = await page.locator('xpath=' + xpathVersionMenu).click();
}



module.exports = {
    goToPropertyPageByDomain: async (page, domain) => {
        try {
            const searchInput = '//akamai-portal-search//input[contains(@class,"search")]';

            await page.locator('xpath=' + searchInput).fill(domain);

            const searchItem = '//akamai-portal-search-result-category/div[contains(string(div), "www.' + domain + '")]//a';

            await page.locator('xpath=' + searchItem).click();
            await page.waitForNavigation();
            return true;
        } catch (error) {
            console.error(`Can not find the Property by ${domain}: ${error}`);
            return false;
        }
    },

    /**
     * When you are in Property page, you can get number of STAGING version
     * @param {*} page The Puppeteer's page object
     * @returns Version number, ex Version 50
     */
    getStagingVersionNumber: async (page) => {
        return await getVersionNumberOfStagingOrProduction(page, "STAGING")
    },

    getHostnamesOfStagingVersion: async (page) => {
        const xpath = `//pm-active-version[@network="STAGING"]//label[text()="Hostnames"]/following-sibling::div/div`;
        await page.locator('xpath=' + xpath).wait();

        const hostnames = await page.$$eval('xpath=' + xpath, elements =>elements.map(e => e.innerText));
        console.log(hostnames);
        return hostnames;
    },

    /**
     * When you are in Property page, you can get number of PRODUCTION version
     * @param {*} page The Puppeteer's page object
     * @returns Version number, ex Version 50
     */
    getProductionVersionNumber: async (page) => {
        return await getVersionNumberOfStagingOrProduction(page, "PRODUCTION")
    },

    /**
     * When you are in Property page, you can navigate to STAGING version page
     * @param {*} page The Puppeteer's page object
     * @returns 
     */
    goToStagingPropertyPage: async (page) => {
        await goToStagingOrProductionPropertyPage(page, "STAGING")
    },

    /**
     * When you are in Property page, you can navigate to PRODUCTION version page
     * @param {*} page The Puppeteer's page object
     * @returns 
     */
    goToProductionPropertyPage: async (page) => {
        await goToStagingOrProductionPropertyPage(page, "PRODUCTION")
    },

    /**
     * When you are in Property page, you can click to create new version based on STAGING version
     * @param {*} page The Puppeteer's page object
     * @returns 
     */
    clickToNewVersionBasedOnStaging: async (page) => {
        await clickToNewVersionBasedOnStagingOrProd(page, "STAGING")
    },

    /**
     * When you are in Property page, you can click to create new version based on PRODUCTION version
     * @param {*} page The Puppeteer's page object
     * @returns 
     */
    clickToNewVersionBasedOnProduction: async (page) => {
        await clickToNewVersionBasedOnStagingOrProd(page, "PRODUCTION")
    },

    /**
     * When you are in Property page, you can check if there has a inactive version based on other version number
     * @param {*} page The Puppeteer's page object
     * @param {*} baseVersionNumber The base version number, ex 'Version 40'
     * @returns 
     */
    checkHasDraftVersionBasedOnOtherVersionNumber: async (page, baseVersionNumber) => {
        const xpath = `//td[contains(@class, "akam-column-basedOn") and contains(string(), "${baseVersionNumber}")]/preceding-sibling::td//a`
        let hasDraftVersion = (await page.$('xpath=' + xpath)) || false;
        return hasDraftVersion;
    },
    
    goToLatestDraftVersionBasedOnVersionNumber: async (page, baseVersionNumber) => {
        const xpath = `//td[contains(@class, "akam-column-basedOn") and contains(string(), "${baseVersionNumber}")]/preceding-sibling::td//a`
        await page.locator('xpath=' + xpath).click();
        await page.waitForNavigation();
    },

    updatePropertyNote: async (page, notes) => {
        const xpath = `//pm-version-info//akam-text-area/textarea`
        await page.locator('xpath=' + xpath).fill(notes)
    }


}