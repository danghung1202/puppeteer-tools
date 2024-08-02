const puppeteer = require('puppeteer');
const log = require('./log');

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
    await page.locator('xpath=' + xpathStaging)
        .on(puppeteer.LocatorEvent.Action, () => {
            log.green(`Click to navigate the ${environment} version`)
        }).click();
    await page.waitForNavigation();
}

/**
 * When you are in Property page, you click to create new version based on staging/production version
 * @param {*} page The Puppeteer's page object
 * @param {*} environment `STAGING` | `PRODUCTION`
 * @returns 
 */
const clickToNewVersionBasedOnStagingOrProd = async (page, environment) => {
    await page.locator(`xpath=//pm-active-version[@network="${environment}"]//button[contains(text(), "New Version")]/following-sibling::button`)
        .on(puppeteer.LocatorEvent.Action, () => {
            log.green(`Click to button menu`)
        })
        .click()

    await new Promise(r => setTimeout(r, 1000));

    const xpathNewVersion = `//pm-active-version[@network="${environment}"]//button[contains(text(), "New Version")]`
    await page.locator('xpath=' + xpathNewVersion)
        .on(puppeteer.LocatorEvent.Action, () => {
            log.green(`Click to create the new version based on ${environment} version`)
        }).click();
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

            await page.locator('xpath=' + searchItem)
                .on(puppeteer.LocatorEvent.Action, () => {
                    log.yellowBg(`Click to link contains ${domain}`)
                }).click();
            await page.waitForNavigation();

            return true;
        } catch (error) {
            log.red(`Can not find the Property by ${domain}: ${error}`);
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

        const hostnames = await page.$$eval('xpath=' + xpath, elements => elements.map(e => e.innerText));
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
     * When you are in Property page, you can check if there has a draft version based on other version number
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
        const xpathVersion = `//td[contains(@class, "akam-column-basedOn") and contains(string(), "${baseVersionNumber}")]/preceding-sibling::td//span`
        const versionName = await page.$eval('xpath=' + xpathVersion, el => el.innerText);

        const xpath = `//td[contains(@class, "akam-column-basedOn") and contains(string(), "${baseVersionNumber}")]/preceding-sibling::td//a`
        await page.locator('xpath=' + xpath)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.green(`Click to the draft version number: '${versionName}'`)
            }).click();
        await page.waitForNavigation();
    },

    updatePropertyNote: async (page, notes) => {
        const xpath = `//pm-version-info//akam-text-area/textarea`
        await page.locator('xpath=' + xpath)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Fill the property note with value: ${notes}`)
            }).fill(notes)
    },

    /**
     * When you are in Property details page, you can click to 'Save' button to save all changes
     * @param {*} page 
     * @returns 
     */
    saveThePropertyChange: async (page) => {
        await new Promise(r => setTimeout(r, 2000));

        const versionName = await page.$eval('xpath=//pm-page-header//span[@pmpageheadersubtitle]', el => el.innerText);
        await page.locator('xpath=//pm-page-header//span[@pmpageheadersubtitle]').click()

        const xBtnSave = `//div[contains(@class,"edit-actions")]/button[text()="Save"]`; //[not(@disabled)]
        const isDisabled = await page.$eval('xpath=' + xBtnSave, el => el.disabled)
        if (!isDisabled) {
            const [res] = await Promise.all([
                page.waitForResponse(res => res.url().includes('pm-backend-blue/service/v1/properties/version')),
                await page.locator('xpath=' + xBtnSave).on(puppeteer.LocatorEvent.Action, () => {
                    log.white(`Click to Save the version: '${versionName}'`)
                }).click()
            ]);
            const result = res ? (await res.json()).result : undefined;
            if (result) {
                if (result == "ERROR") {
                    log.redBg(`Saved version ${versionName} successfully but has ERROR. Review the changes`);
                } else {
                    log.greenBg(`Saved version ${versionName} successfully with ${result}`);
                }

                return true;
            }
            return false;
        } else {
            log.red(`There is nothing change in the version ${versionName}. The "Save" button is disabled.`)
            return false
        }
    },

    /**
     * Get the information of property by version number
     * @param {*} page 
     * @param {*} versionNumber 
     * @returns json object of `{version, lastEdited, author, notes}`
     */
    getSummaryOfPropertyVersion: async (page, versionNumber) => {
        const xpathTr = `//table//tr[td[contains(@class, "akam-column-version")  and contains(string(), "${versionNumber}")]]`
        await page.locator('xpath=' + xpathTr).wait()
        const lastEdited = await page.$eval(`xpath=${xpathTr}/td[contains(@class,"akam-column-lastEdited")]`, el => el.innerText)
        const author = await page.$eval(`xpath=${xpathTr}/td[contains(@class,"akam-column-lastEditedByUser")]`, el => el.innerText)
        const notes = await page.$eval(`xpath=${xpathTr}/td[contains(@class,"akam-column-notes")]`, el => el.innerText)

        return {
            version : versionNumber,
            lastEdited,
            author,
            notes
        }
    }

}