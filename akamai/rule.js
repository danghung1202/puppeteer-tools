const puppeteer = require('puppeteer');
const akamaiMenu = require('./menu');
const log = require('./log')

const DEFAULT_RULE = 'Default Rule'
var self = module.exports = {
    /**
     * When you are in property version page, you can check if property has the rule by rule's name
     * 
     * This method not apply for finding 'Default Rule' rule
     * @param {*} page 
     * @param {*} rules array of hierarchy rules, ex ['CACHING', 'Edge Cache', 'Cache ID modifier']
     * @returns True if found the rule, otherwise return false
     */
    checkIfHasTheRule: async (page, rules) => {
        //waiting for the default rule loaded completely
        const xpathDefaultRule = `//pm-configuration-settings//pm-rule-node[@depth=0 and contains(string(),"${DEFAULT_RULE}")]`;
        await page.locator('xpath=' + xpathDefaultRule).wait()

        var xpath = `//pm-configuration-settings//pm-rule-node[@depth=1 and contains(string(),"${rules[0]}")]`;
        for (let i = 1; i < rules.length; i++) {
            xpath += `/following-sibling::pm-rule-node[@depth=${i+1} and contains(string(),"${rules[i]}")]`
        }
        return (await page.$('xpath=' + xpath)) || false;
    },

    clickToSelectTheDefaultRule: async (page) => {
        const xpathDefaultRule = `//pm-configuration-settings//pm-rule-node[@depth=0 and contains(string(),"${DEFAULT_RULE}")]`;
        await page.locator('xpath=' + xpathDefaultRule).wait()
        await page.locator('xpath=' + xpathDefaultRule)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.yellow(`Click to Default rule`)
            }).click()
    },

    /**
     * When you are in property version page, you can click to the rule by rule's name
     * 
     * For click to select 'Default Rule' rule, using the method `clickToSelectTheDefaultRule`
     * @param {*} page 
     * @param {*} rules array of hierarchy rules, ex ['CACHING', 'Edge Cache', 'Cache ID modifier']
     * @returns True if found the rule, otherwise return false
     */
    clickToSelectTheRule: async (page, rules) => {
        const hasTheRule = await self.checkIfHasTheRule(page, rules);
        if (!hasTheRule) {
            log.white(`The rule ${rules.join(' -> ')} is not found!`)
            return false;
        }

        var xpath = `//pm-configuration-settings//pm-rule-node[@depth=1 and contains(string(),"${rules[0]}")]`;
        for (let i = 1; i < rules.length; i++) {
            xpath += `/following-sibling::pm-rule-node[@depth=${i+1} and contains(string(),"${rules[i]}")]`
        }

        await page.locator('xpath=' + xpath)
            .setEnsureElementIsInTheViewport(false)
            //.setVisibility(null)
            //.setWaitForEnabled(false)
            //.setWaitForStableBoundingBox(false)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Click to rule: ${rules.join(' -> ')}`)
            })
            .click();
        return true
        //await new Promise(r => setTimeout(r, 2000));
    },

    /**
     * When you selected the rule in property version page, you can click to `...` icon to open the rule's menu options.
     * 
     * Then you can click to menu item by `menuItemText`
     * 
     * For click to select 'Default Rule' rule, using the method `clickToSelectTheDefaultRule`
     * @param {*} page 
     * @param {*} menuItemText enum of `Edit Name | Delete | Save As User Rule Template | Duplicate | Submit Rule Template`
     * @returns True if found the rule, otherwise return false
     */
    clickToMenuItemOfSelectedRule: async (page, menuItemText) => {
        const menu = `//pm-rule-node[contains(@class,"selected")]//akam-icon[@icon="actions"]`;
        await page.locator('xpath=' + menu)
            .setEnsureElementIsInTheViewport(false)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Click to menu icon of selected rule`)
            })
            .click();

        await akamaiMenu.clickToMenuItemInAkamMenu(page, menuItemText);
    },

    /**
     * First you select the rule then can delete it
     * @param {*} page 
     * @param {*} rules array of hierarchy rules, ex ['CACHING', 'Edge Cache', 'Cache ID modifier']
     */
    deleteTheSelectedRule: async (page, rules) => {
        if (await self.clickToSelectTheRule(page, rules)) {
            await self.clickToMenuItemOfSelectedRule(page, "Delete");

            const okButton = `//akam-modal-container/div[@akammodalactions]/button[@akam-modal-close="ok"]`;
            await page.locator('xpath=' + okButton)
                .on(puppeteer.LocatorEvent.Action, () => {
                    log.white(`Click to 'OK' button to delete the ${rules.join(' -> ')}`)
                })
                .click();
            return true;
        } else {
            log.white(`Can not delete the ${rules.join(' -> ')}. The rule may not found`)
            return false
        }
    },

    /**
     * When you selected the rule, you can add new rule from template before/after/child the selected rule
     * @param {*} page 
     * @param {*} ruleTemplateName The rule template's name
     * @param {*} position Default is `After Current Rule`,  enum of `After Current Rule | Before Current Rule | Child Rule`
     */
    addNewRuleFromRuleTemplate: async (page, ruleTemplateName, position = "After Current Rule") => {

        const xpath = `//pm-configuration-settings//button[contains(string(), "Rules")]/following-sibling::button`;
        await page.locator('xpath=' + xpath)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Click to '+ Rules' button`)
            }).click();

        await akamaiMenu.clickToMenuItemInAkamMenu(page, position)

        const selectCategory = `//pm-add-rule-modal//akam-select[@formcontrolname="searchCategory"]`
        await page.locator('xpath=' + selectCategory)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Open the the dropdown 'searchCategory'`)
            }).click();

        await akamaiMenu.clickToItemInDropdown(page, "All");

        const selectedRule = `//pm-add-rule-modal//div[@class="add-rule-modal-sidebar-body"]//ul/li[contains(text(), "${ruleTemplateName}")]`
        await page.locator('xpath=' + selectedRule)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Choose the '${ruleTemplateName}' template rule`)
            }).click();

        const insertBtn = `//div[@akammodalactions]/button[contains(text(), "Insert Rule")]`
        await page.locator('xpath=' + insertBtn)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Click to 'Insert Rule' to insert new rule`)
            }).click();
    },

    /**
     * When you selected the rule, you can add new rule from template that is after the selected rule
     * @param {*} page 
     * @param {*} ruleTemplateName 
     */
    addNewRuleAfterSelectedRule: async (page, ruleTemplateName) => {
        await self.addNewRuleFromRuleTemplate(page, ruleTemplateName, "After Current Rule");
    },

    /**
     * When you selected the rule, you can add new rule from template that is before the selected rule
     * @param {*} page 
     * @param {*} ruleTemplateName 
     */
    addNewRuleBeforeSelectedRule: async (page, ruleTemplateName) => {
        await self.addNewRuleFromRuleTemplate(page, ruleTemplateName, "Before Current Rule");
    },

    /**
     * When you selected the rule, you can add new rule from template that is child of the selected rule
     * @param {*} page 
     * @param {*} ruleTemplateName 
     */
    addNewRuleIsChildOfSelectedRule: async (page, ruleTemplateName) => {
        await self.addNewRuleFromRuleTemplate(page, ruleTemplateName, "Child Rule");
    },

    /**
     * Behind the sense, Akamai used the Angular framework to build the control panel. 
     * 
     * Sometime when you finished editing the selected rule then you click to other rule, the page can not detect the UI change. 
     * 
     * For workaround, you should click to the Rule Name header to notify the Angular framework that  there is the change and it should to trigger the render UI
     * @param {*} page 
     */
    informAkamaiToFinishedEditingTheRule: async (page) => {
        const xpathBtn = `//pm-rule-editor/div[@class="rule-name"]`;
        const ruleName = await page.$eval('xpath=' + xpathBtn, el => el.innerText)

        await page.locator('xpath=' + xpathBtn)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.blue(`Finished editing the rule: ${ruleName}`);
            }).click();
    }

}