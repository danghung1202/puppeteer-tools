const puppeteer = require('puppeteer');
const akamaiMenu = require('./menu');

var self = module.exports = {

    checkHasBehaviorByName: async (page, behaviorName) => {
        const xpathHeader = `//pm-rule-editor/pm-behavior-list//pm-behavior[div[@class="header" and contains(string(), "${behaviorName}")]]`
        return (await page.$('xpath=' + xpathHeader)) || false;
    },

    addNewBehavior: async (page, behaviorName) => {
        const xpathBtn = `//pm-rule-editor/pm-behavior-list//akam-content-panel-header[contains(string(), "Behaviors")]//button`
        await page.locator('xpath=' + xpathBtn)
            .on(puppeteer.LocatorEvent.Action, () => {
                console.log(`Click to '+Behavior' button to add new behavior`)
            }).click()

        await akamaiMenu.clickToMenuItemInAkamMenu(page, "Standard property behavior")

        const selectedRule = `//pm-add-behavior-modal//div[@class="add-behavior-modal-sidebar-body"]//ul/li[contains(text(), "${behaviorName}")]`
        await page.locator('xpath=' + selectedRule)
            .on(puppeteer.LocatorEvent.Action, () => {
                console.log(`Select  the '${behaviorName}' from behavior template`)
            }).click();

        const insertBtn = `//div[@akammodalactions]/button[contains(text(), "Insert Behavior")]`
        await page.locator('xpath=' + insertBtn)
            .on(puppeteer.LocatorEvent.Action, () => {
                console.log(`Click to 'Insert Behavior' to save new behavior`)
            }).click();

    },

    updateValueForInputFieldInBehavior: async (page, behaviorName, fieldLabel, fieldValue, index = 1) => {
        const xpathInput = `//pm-rule-editor/pm-behavior-list//pm-behavior[div[@class="header" and contains(string(), "${behaviorName}")]][${index}]//div[akam-form-label[contains(string(), "${fieldLabel}")]]/following-sibling::div//input[@type="text"]`
        await page.locator('xpath=' + xpathInput).fill(fieldValue);
    },

    updateValueForSelectFieldInBehavior: async (page, behaviorName, fieldLabel, fieldValue, index = 1) => {
        const xpathSelect = `//pm-rule-editor/pm-behavior-list//pm-behavior[div[@class="header" and contains(string(), "${behaviorName}")]][${index}]//div[akam-form-label[contains(string(), "${fieldLabel}")]]/following-sibling::div//akam-select//akam-input-action-icon`
        await page.locator('xpath=' + xpathSelect).setEnsureElementIsInTheViewport(false)
            .on(puppeteer.LocatorEvent.Action, () => {
                console.log(`Click to select field in: ${behaviorName} ${fieldLabel}`)
            })
            .click();

        await akamaiMenu.clickToItemInDropdown(page, fieldValue);
    }
}