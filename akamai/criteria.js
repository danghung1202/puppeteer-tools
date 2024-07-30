const puppeteer = require('puppeteer');
const akamaiMenu = require('./menu');

const setCriteriaName = async (page, criteriaName) => {
    
    const xpathSelect = `//pm-rule-editor/pm-match-list//pm-match[last()]//akam-select`
    await page.locator('xpath=' + xpathSelect).setEnsureElementIsInTheViewport(false).click();

    await akamaiMenu.clickToItemInDropdown(page, criteriaName)
}

const setCriteriaCondition = async (page, criteriaCondition) => {
    const xpathSelect = `//pm-rule-editor/pm-match-list//pm-match[last()]//form/pm-enum//akam-select`
    await page.locator('xpath=' + xpathSelect).setEnsureElementIsInTheViewport(false).click();

    await akamaiMenu.clickToItemInDropdown(page, criteriaCondition)
}

const setCriteriaValue = async (page, criteriaValue) => {
    const xpathInput = `//pm-rule-editor/pm-match-list//pm-match[last()]//form//input[@akamfocusablehtmlelement and @type="text"]`
    await page.locator('xpath=' + xpathInput).setEnsureElementIsInTheViewport(false).click();

    await page.locator('xpath=' + xpathInput).fill(criteriaValue);
}

var self = module.exports = {

    checkHasExistedCriteria: async (page, criteriaName, criteriaCondition, criteriaValue) => {
        return false;
    },

    addNewCriteria: async (page, criteriaName, criteriaCondition, criteriaValue) => {
        const xpathBtn = `//pm-rule-editor/pm-match-list//akam-content-panel-header[contains(string(), "Criteria")]//button`
        await page.locator('xpath=' + xpathBtn).setEnsureElementIsInTheViewport(false)
            .on(puppeteer.LocatorEvent.Action, () => {
                console.log(`Add new criteria: ${criteriaName} ${criteriaCondition} ${criteriaValue}`)
            })
            .click();

        await setCriteriaName(page, criteriaName)
        await setCriteriaCondition(page, criteriaCondition)
        await setCriteriaValue(page, criteriaValue)
    },

    /**
     * 
     * @param {*} page 
     * @param {*} criteriaName The criteria's name such as `Hostname`, `Path` etc..
     * @param {*} index 
     */
    deleteAllValueInExitedCriteria: async (page, criteriaName, index = 1) => {
        const xpathTagCloseIcons = `//pm-rule-editor/pm-match-list//pm-match//akam-select[contains(string(), "${criteriaName}")]/following-sibling::form//akam-tag-input//akam-tag//akam-icon`
        await page.locator('xpath=' + xpathTagCloseIcons).wait();

        const tagCloseIcons = await page.$$('xpath=' + xpathTagCloseIcons);
        for (let i = 0; i < tagCloseIcons.length; i++) {
            await tagCloseIcons[i].click()
        }
    },

    addValueToExistedCriteria: async (page, criteriaName, newCriteriaValue, index = 1) => {
        const xpathInput = `//pm-rule-editor/pm-match-list//pm-match//akam-select[contains(string(), "${criteriaName}")]/following-sibling::form//input[@akamfocusablehtmlelement]`
        await page.locator('xpath=' + xpathInput).fill(newCriteriaValue);
    }

}