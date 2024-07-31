const puppeteer = require('puppeteer');
const log = require('./log')

/**
 * Get index of exited variable in list property's variables
 * @param {*} page 
 * @param {*} variableName 
 * @returns Return `-1` if variable is not existed, otherwise return the index (start from 0) of variable
 */
const getIndexOfVariableIfExisted = async (page, variableName) => {
    const xpathInput = `//div[akam-content-panel-header[contains(string(), "Property Variables")]]/following-sibling::div//pm-version-variables//pm-version-variable-name//input`;
    const variableNames = await page.$$eval('xpath=' + xpathInput, elements => elements.map(e => e.value))
    return variableNames.indexOf(variableName)
}

module.exports = {

    /**
     * Add or Update the Property's variable
     * @param {*} page 
     * @param {*} variableName 
     * @param {*} variableValue 
     */
    addOrUpdateVariableInCurrentProperty: async (page, variableName, variableValue) => {
        // const xpathHeader = `//div[akam-content-panel-header[contains(string(), "Property Variables")]]`;
        // await page.locator('xpath=' + xpathHeader).wait();

        const xpathInput = `//div[akam-content-panel-header[contains(string(), "Property Variables")]]/following-sibling::div//pm-version-variables//pm-version-variable-name//input`;
        await page.locator('xpath=' + xpathInput).wait();

        const indexOf = await getIndexOfVariableIfExisted(page, variableName)
        if (indexOf >= 0) {
            const xpathMatchInputValue = `//div[akam-content-panel-header[contains(string(), "Property Variables")]]/following-sibling::div//pm-version-variables//tbody/tr[${indexOf +1}]/td[2]//input`
            await page.locator('xpath=' + xpathMatchInputValue)
                .on(puppeteer.LocatorEvent.Action, () => {
                    log.white(`Filled variable ${variableName} with value ${variableValue}`)
                })
                .fill(variableValue);
        } else {

            const xpath = `//akam-content-panel-header[contains(string(), "Property Variables")]//button[contains(string(), "Variables")]`;
            await page.locator('xpath=' + xpath)
                .on(puppeteer.LocatorEvent.Action, () => {
                    log.yellow(`Click to Default rule`)
                }).click();

            const xpathNewInputName = `//div[akam-content-panel-header[contains(string(), "Property Variables")]]/following-sibling::div//pm-version-variables//tbody/tr[1]/td[1]//input`;
            await page.locator('xpath=' + xpathNewInputName)
                .on(puppeteer.LocatorEvent.Action, () => {
                    log.white(`Filled variable name ${variableName}`)
                }).fill(variableName);

            const xpathNewInputValue = `//div[akam-content-panel-header[contains(string(), "Property Variables")]]/following-sibling::div//pm-version-variables//tbody/tr[1]/td[2]//input`;
            await page.locator('xpath=' + xpathNewInputValue)
                .on(puppeteer.LocatorEvent.Action, () => {
                    log.white(`Filled variable ${variableName} with value ${variableValue}`)
                }).fill(variableValue);
        }

    }
}