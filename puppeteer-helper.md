# Puppeteer Helper

## Puppeteer function wrapper
### The ActionStack class

> Actually, this class can be used for any function you write

One thing that was discovered about using Puppeteer in Jest tests early on was that when some Puppeteer methods fail or time out, Jest will often just throw a generic message about timing out but not tell you what line it happened at. Another thing that was discovered early on was that it was pretty hard to tell what exactly was being tested in a test containing a bunch of page.click and page.type commands on elements with esoteric selector statements.

This is why we introduced the ActionStack class which allows us to describe each action that happens so that:

1) it is clearer to the reader of the code what is happening and
2) if the test fails, the error message says what the action was that failed instead of a generic timeout/Puppeteer API error, making the test much more debuggable.

```typescript
    export default class ActionStack {
        constructor() {
            this.actionsSoFar = [];
        }
        async executeAction(actionDescription, action) {
            try {
                this.actionsSoFar.push(actionDescription);
                return await action();
            } catch (e) {
                this.actionsSoFar.pop();
                let errorMessage = `Failed during action "${actionDescription}", due to error: ${e}\n`;
                errorMessage += 'Actions leading up to failure:\n';
                for (let i = this.actionsSoFar.length >= 3 ? this.actionsSoFar.length - 3 : 0; i < this.actionsSoFar.length; i++) {
                    errorMessage += '"' + this.actionsSoFar[i] + '"\n';
                }
                throw new Error(errorMessage);
            }
        }
    }

```

On one line for example we have the statement,

    page.click('.up-ds-modal__footer-buttons > .up-ds-button--primary-base')

which on it’s own makes no sense to someone reading the test for the first time, but

    await as.executeAction('Click the submit button', () => page.click('.up-ds-modal__footer-buttons > .up-ds-button--primary-base'));

gives more context. And if the click fails, due to the button still being disabled because a required field is missing for example, the error message will tell you what action failed as well as the previous three actions that led up to it, making debugging much simpler whether locally or on a CI/CD server.


**Reference**

[Using Puppeteer to Create an End-to-End Test Framework](https://medium.com/uptake-tech/using-puppeteer-to-create-an-end-to-end-test-framework-f1e7e008c793)


## Some Useful Helper Methods

```javascript
module.exports = {
    click: async function(page, selector){
        try{
          await page.waitForSelector(selector)
          await page.click(selector)

        } catch(error){
            throw new Error('Could not click on selector : ' + selector)
        }
    },
    typeText: async function(page, text, selector){
        try {
            await page.waitForSelector(selector)
            await page.type(selector,text)
            //await page.keyboard.press('Enter')
        } catch (error) {
            throw new Error('Could not type text on selector : ' + selector)
        }
    },
    loadUrl: async function(page, url){
        await  page . goto (url, {waitUntil :  ' networkidle0 ' })
    },
    getText: async function(page,selector){
        try {
            await page.waitForSelector(selector)
            return page.$eval(selector, e => e.innerHtml)
        } catch (error) {
            throw new Error('cannot get text from selector : ' + selector)
        }
    },
    getCount: async function(page,selector){
        try {
            await page.waitForSelector(selector)
            return page.$$eval( selector, items => items.length)
        } catch (error) {
            throw new Error('cannot get count of selector :' + selector )
        }
    },
    waitForText: async function(page, selector, text){
        try {
            await page.waitForSelector(selector)
            await page.waitForFunction((selector, text) =>
                document.querySelector(selector).innerText.includes(text),
                {},
                selector,
                text
            )
        } catch (error) {
            throw new Error('text: ' + text + ' not found for selector '+ selector)
        }
    },
    pressKey :  async  function ( page , key ) {
        try {
            await page.keyboard.press(key)
        } catch (error) {
            throw new Error('Could not press key: ' + key + 'on the keybroad')
        }
    },
    shouldExist: async function(page,selector){
        try {
            await page.waitForSelector(selector)
        } catch (error) {
            throw new Error('connot should exitst : ' + selector)
        }
    },
    selectFrameclick: async function(page,selector){
        try {
            await page.waitFor(1000)
            await page.waitForSelector('#iframe_content', { delay: 100 });
            const frame = await page.frames().find(f => f.name() === 'iframe_content'); 
            await frame.waitForSelector(selector);
            //const frame = await page.mainFrame().childFrames()
            //const iframe = page.frames()[1];
            const button = await frame.$(selector);
            await button.click();
        } catch (error) {
            console.log(error)
            throw new Error('Could not select Frame click with selector : ' + selector)
        }
    },
    selectFrametypeText: async function(page, text, selector){
        try {
            const frame = await page.frames().find(f => f.name() === 'iframe_content'); 
            await frame.waitForSelector(selector, { delay: 200 });
            await (await frame.$(selector)).type(String(text)); 
        } catch (error) {
            throw new Error('Could not select Frame type Text on selector : ' + selector)
        }
    },
    selectFrame: async function(page){
        try {
            await page.waitForSelector('#iframe_content', { delay: 200 });
            var frame = await page.frames().find(f => f.name() === 'iframe_content')
            return frame
            
        } catch (error) {
            console.log(error);
            throw new Error('Could not select Frame click with selector : ' + selector)
        }
    },
    acceptAlert: async function(page){
        try {
            page.on("dialog", (dialog) => {
                dialog.accept()
              });
            
        } catch (error) {
            throw new Error('Can not Accept Alert')
        }
    }
}
```

https://medium.com/@piyathida.sanaoun01/%E0%B9%80%E0%B8%A3%E0%B8%B4%E0%B9%88%E0%B8%A1%E0%B8%95%E0%B9%89%E0%B8%99%E0%B8%97%E0%B8%B3-automate-testing-with-puppeteer-d1a6e7de19c8