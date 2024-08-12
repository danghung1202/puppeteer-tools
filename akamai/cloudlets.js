const puppeteer = require('puppeteer');
const log = require('./log')

const getPolicyVersionNumberBasedOnEnvironment = async (page, environment) => {
    const xpathStaging = `xpath=//div[@class="infoBlockAccordion"]//div[contains(@class, "panel-heading")]//div[span[string()="${environment}"]]/span[2]`
    await page.locator(xpathStaging)
        .on(puppeteer.LocatorEvent.Action, () => {
            log.white(`Navigated to policy details and click to header '${environment}'`)
        }).click();

    await new Promise(r => setTimeout(r, 1000));
    const stagingVersion = await page.$eval(xpathStaging, el => el.innerText);
    return stagingVersion;
}

var self = module.exports = {
    goToCloudletsByName: async (page, cloudletsName) => {
        await page.locator('xpath=//akam-table[@id-property="policyId"]//table/tbody/tr').wait();

        const xpthSearchInput = `//div[contains(@class, "cloudletsView")]//input[@type="search"]`
        await page.locator('xpath=' + xpthSearchInput)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Fill in search box: '${cloudletsName}'`)
            })
            .fill(cloudletsName)

        const matchResult = `//div[contains(@class, "cloudletsView")]//table//tr[td[contains(string(), "${cloudletsName}")]]/td[1]//a`
        await page.locator('xpath=' + matchResult)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.yellowBg(`Click to cloudlets: '${cloudletsName}'`)
            }).click()
        await page.waitForNavigation();
    },

    getStagingPolicyVersionNumber: async (page) => {
        return await getPolicyVersionNumberBasedOnEnvironment(page, "Staging");
    },
    getProductionPolicyVersionNumber: async (page) => {
        return await getPolicyVersionNumberBasedOnEnvironment(page, "Production");
    },
    /**
     * When you are in Property page, you can check if there has a draft version based on other version number
     * @param {*} page The Puppeteer's page object
     * @param {*} baseVersionNumber The base version number, ex 'Version 40'
     * @returns 
     */
    checkHasDraftVersionBasedOnOtherVersionNumber: async (page, baseVersionNumber) => {
        const xpath = `//akam-table//table//tr[td[@row-property="description"][contains(string(), "${baseVersionNumber}")]]/td[1][a[count(i) = 0]]`
        let hasDraftVersion = (await page.$('xpath=' + xpath)) || false;
        return hasDraftVersion;
    },

    goToLatestDraftVersionBasedOnVersionNumber: async (page, baseVersionNumber) => {
        const xpathVersion = `//akam-table//table//tr[td[@row-property="description"][contains(string(), "${baseVersionNumber}")]]/td[1]/a[count(i) = 0]`
        const versionName = await page.$eval('xpath=' + xpathVersion, el => el.innerText);

        await page.locator('xpath=' + xpathVersion)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Click to the draft version number: '${versionName}'`)
            }).click();
        await page.waitForNavigation();
    },

    createNewVersionBasedOnVersionNumber: async (page, baseVersionNumber, versionNote) => {
        const xpathIcon = `xpath=//akam-table//table//tr[td[@row-property="version"][contains(string(), "${baseVersionNumber}")]]/td[last()]/div`
        await page.locator(xpathIcon)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Click to open the menu of policy: '${baseVersionNumber}'`)
            }).click()

        await self.clickToItemInDropdown(page, baseVersionNumber, "Edit New Version")

        const xpathNotes = `xpath=//div[@class="policyVersionModal"]//textarea[@name="notes"]`
        await page.locator(xpathNotes)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Fill the notes policy: '${versionNote}'`)
            }).fill(`${versionNote} (Based on ${baseVersionNumber})`)

        const xpathSaveBtn = `xpath=//div[@class="modal-footer"]/button[contains(string(), "Edit New Version")]`
        await page.locator(xpathSaveBtn).on(puppeteer.LocatorEvent.Action, () => {
            log.white(`Click to 'Edit New Version' button to create new version: '${versionNote}'`)
        }).click()

        await page.waitForNavigation();
    },

    openAndFillBasicRuleForm: async (page, ruleName, sourceUrl, redirectURL, redirectType, copyQueryString, relativeRedirectOption = undefined) => {
        await page.locator('xpath=//akam-table-toolbar//button[contains(string(), "Add Rule")]')
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Click to 'Add Rule' button`)
            }).click()

        //fill rule form
        await page.locator(`xpath=//form[@name="ruleForm"]//rule-settings-name//input[@name="ruleName"]`)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Fill the rule name '${ruleName}'`)
            }).fill(ruleName)
        await page.locator(`xpath=//form[@name="ruleForm"]//div[@id="rule-settings-redirect"]//input[@name="sourceURL"]`)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Fill the source URL '${sourceUrl}'`)
            }).fill(sourceUrl)
        await page.locator(`xpath=//form[@name="ruleForm"]//div[@id="rule-settings-redirect"]//input[@name="redirectURL"]`)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Fill the redirect URL '${redirectURL}'`)
            }).fill(redirectURL)
        await page.locator(`xpath=//form[@name="ruleForm"]//div[@id="rule-settings-redirect"]//select[@name="redirectType"]`)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Select the redirect type '${redirectType}'`)
            }).fill(redirectType)

        if (copyQueryString) {
            await page.locator(`xpath=//form[@name="ruleForm"]//div[@id="rule-settings-redirect"]//rule-settings-copy-query-params//input[@type="checkbox"]/following-sibling::div`)
                .on(puppeteer.LocatorEvent.Action, () => {
                    log.white(`Checked to Copy Query String checkbox`)
                })
                .click()
        }

        if (relativeRedirectOption) {
            const xpathRelativeOption = `xpath=//form[@name="ruleForm"]//div[@id="rule-settings-use-relative-url"]//select[@name="relativeURL"]`
            let optionValue = await page.$$eval(`${xpathRelativeOption}/option`, (options, text) => options.find(o => o.innerText === text).value, relativeRedirectOption)
            await page.on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Select Relative Redirect Options: ${optionValue}`)
            }).select(xpathRelativeOption, optionValue);
        }

    },

    /**
     * When you opened the Add Rule form dialog, you can click to show Advanced View
     * @param {*} page 
     */
    openAdvancedViewInRuleForm: async (page) => {
        await page.locator(`xpath=//form[@name="ruleForm"]//div[@id="modalButtonDiv"]//button[contains(@class, "switchDetailView")]`)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Click to 'Show Advanced View'`)
            }).click()
    },

    saveRuleDetailsIntoPolicy: async (page) => {
        await page.locator(`xpath=//div[@id="modalButtonDiv"]//button[@id="saveRule"]`)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.yellow(`Click to 'Save Rule' button`)
            }).click();
    },

    savePolicyChanges: async (page) => {
        await new Promise(r => setTimeout(r, 1000));

        const versionName = await page.$eval('xpath=//div[contains(@class, "policyVersionDetails")]//span', el => el.innerText);
        await page.locator('xpath=//div[contains(@class, "policyVersionDetails")]//span').click()

        const xBtnSave = `//akam-table-toolbar//button[contains(string(), "Save Changes")]`
        const isDisabled = await page.$eval('xpath=' + xBtnSave, el => el.disabled)
        if (!isDisabled) {
            const [res] = await Promise.all([
                page.waitForResponse(res => res.url().includes('/cloudlets/api/v2/policies/')),
                await page.locator('xpath=//akam-table-toolbar//button[contains(string(), "Save Changes")]')
                .on(puppeteer.LocatorEvent.Action, () => {
                    log.white(`Click to 'Save Changes' button`)
                }).click()
            ]);
            const result = res ? await res.json() : {};
            const matchRules = result ? result.matchRules : undefined;
            const warnings = result ? result.warnings: undefined;
            if (matchRules) {
                log.greenBg(`Saved policy ${versionName} successfully. ${warnings ? "There are some warnings" : ""}`);
                return true;
            }
            return false;
        } else {
            log.red(`There is nothing change in the policy ${versionName}. The "Save Changes" button is disabled.`)
            return false
        }
    },

    updateRuleMatchInAdvancedView: async (page, matchName, matchOperator, matchValue, index) => {
        const matchPath = `xpath=//div[@id="rule_details_advanced"]//div[contains(@class, "updateableList")]/div[${index}]`
        const matchNamePath = `${matchPath}//ng-form//select`
        var optionValue = await page.$$eval(`${matchNamePath}/option`, (options, text) => options.find(o => o.innerText === text).value, matchName)
        await page.select(matchNamePath, optionValue);
        log.white(`Select Rule Match Name: ${matchName}`)

        const matchOperatorPath = `${matchPath}//match-operator//select`
        let operatorOptions = await page.$$eval(`${matchOperatorPath}/option`, (options, text) => options.find(o => o.innerText === text).value, matchOperator)
        await page.select(matchOperatorPath, operatorOptions);
        log.white(`Select Rule Match Operator: ${matchOperator}`)

        const matchValuePath = `${matchPath}//match-multi-value//input[@type="text"]`
        await page.locator(matchValuePath)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Fill the rule match value: ${matchValue}`)
            }).fill(matchValue);
        await page.keyboard.press('Enter')

        //const checkbox1 = `//div[@id="rule_details_advanced"]//div[contains(@class, "updateableList")]/div[1]//match-multi-value//input[@type="checkbox"]/following-sibling::div[contains(string(), "Allow wildcards * (zero or more) and ? (any character)")]`
    },

    /**
     * Click to menu item in `<ul><li></li></ul>` when open the dropdown from policy item
     * @param {*} page 
     * @param {*} dropdownItemText 
     */
    clickToItemInDropdown: async (page, versionNumber, dropdownItemText) => {
        const xpathTdIcon = `xpath=//akam-table//table//tr[td[@row-property="version"][contains(string(), "${versionNumber}")]]/td[last()]/div`
        const matchItemPath = `${xpathTdIcon}//ul[@class="dropdown-menu"]/li[contains(string(),"${dropdownItemText}")]`
        await page.locator(matchItemPath)
            .on(puppeteer.LocatorEvent.Action, () => {
                log.white(`Click to item ${dropdownItemText} in dropdown`)
            })
            .click();
    }

}