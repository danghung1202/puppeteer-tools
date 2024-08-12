const puppeteer = require('puppeteer');
const log = require('./log');

module.exports = {
    /**
     * Click to menu item in `<div class="akam-menu"></div>` when open the menu of rule, button...
     * @param {*} page 
     * @param {*} menuItemText 
     */
    clickToMenuItemInAkamMenu: async (page, menuItemText) => {
        const menuItem = `//div[contains(@class, "akam-menu")]//akam-menu-item[contains(string(), "${menuItemText}")]`;
        await page.locator('xpath=' + menuItem)
            .setEnsureElementIsInTheViewport(false)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Click to menu item ${menuItemText} in menu`)
            })
            .click();
    },

    /**
     * Click to menu item in `<ul><li akammenuoption></li></ul>` when open the dropdown
     * @param {*} page 
     * @param {*} dropdownItemText 
     */
    clickToItemInDropdown: async (page, dropdownItemText) => {
        const matchItemPath = `//ul/li[@akammenuoption and contains(string(),"${dropdownItemText}")]`
        await page.locator('xpath=' + matchItemPath)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Click to item ${dropdownItemText} in dropdown`)
            })
            .click();
    }

    
}