# Puppeteer Notes

## DOM interactions

In order to get information on DOM elements, you can use the Puppeteer function page.evaluate(). Inside its callback, you have access to DOM elements (through CSS selectors for example), but the rest of your code is not accessible. As a second argument after the callback, you can pass it a serializable object. This means that a function defined outside evaluate() cannot be used inside of it.

Another problem with page.evaluate() is that it’s hard to debug. In fact, if you try to use console.log inside of it, you won’t see anything in your local logs. To solve this issue, add the following instruction just after you initialize the page object:

    await page.on(‘console’, obj => console.log(obj.text()));


## Optimization
Finally, a very easy way to reduce the execution time of your cloud function is to parallelize text inputs in forms. If you have forms to fill, instead of doing several 

`await page.type('.selector', fieldValue)`, 

parallelize them in a Promise.all. Of course, the submitting of the form must be done outside of this Promise.all to have valid field values.

## Methods of Interest

**goto**

`await page.goto('https://developers.google.com/web/');`

**waitForSelector**

This method allows one to wait for a certain element to render after doing an action such as navigating to a page or submitting a form.

In the example below, after typing into the search box, the browser is told to wait until an element appears with the devsite-suggest-all-results class.


`const allResultsSelector = '.devsite-suggest-all-results';`
`await page.waitForSelector(allResultsSelector);`


**type**

This method also uses a CSS selector to an element that one can type into, such as an `<input type=“text” …>` element, as the first argument, and the string to type into the element as the second element. In the example below it’s used to execute the search.

`await page.type('#searchbox input', 'Headless Chrome');`

**click**

This method is used to click on an element specified by a CSS selector. In the example below it clicks the “Show all results” button on the Google developer page.

```javascript
    const allResultsSelector = '.devsite-suggest-all-results';
    await page.waitForSelector(allResultsSelector);
    await page.click(allResultsSelector);
```

**$eval**

This method doesn’t show up as `page.$eval` in the search example but that’s because there are many ways to evaluate a script within the page’s context (in the search example, `page.evaluate` is used instead of `page.$eval`).

One of the most important ways we use `$eval` in the Accounts end-to-end tests is for getting the text content of an element. For example, you can imagine a test that uses this method to get the text content of the `h1` header of the Google developers page in the following way:

    const titleText = await page.$eval('h1', node => node.innerText);
    expect(titleText).toEqual('Build anything with Google');


## [How to bypass “Access Denied” pages when using Headless Chrome](https://medium.com/@jsoverson/how-to-bypass-access-denied-pages-with-headless-chrome-87ddd5f3413c)


## [page.evaluate is your friend](https://docs.browserless.io/blog/2018/06/04/puppeteer-best-practices.html)

For instance, instead of doing something like this (which has 3 async actions):

```javascript
    const $anchor = await page.$('a.buy-now');
    const link = await $anchor.getProperty('href');
    await $anchor.click();

    return link;
```

Do this instead (1 async action)

```javascript
    await page.evaluate(() => {
        const $anchor = document.querySelector('a.buy-now');
        const text = $anchor.href;
        $anchor.click();
    });
```

## Parallelize with browsers, not pages

Since we've determined that it's not good to run a browser, and that we should only run one when absolutely necessary, the next best-practice is to run only one session through each browser. While you actually might save some overhead by parallelizing work through pages, if one page crashes it can bring down the entire browser with it. That, plus each page isn't guaranteed to be totally clean (cookies and storage might bleed-through as seen here).

Instead of this:

```javascript
    import puppeteer from 'puppeteer';

    // Launch one browser and capture the promise
    const launch = puppeteer.launch();

    const runJob = async (url) {
        // Re-use the browser here
        const browser = await launch;
        const page = await browser.newPage();
        await page.goto(url);
        const title = await page.title();

        browser.close();

        return title;
    };
```
Do this:

```javascript
    import puppeteer from 'puppeteer';

    const runJob = async (url) {
        // Launch a clean browser for every "job"
        const browser = puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        const title = await page.title();

        browser.close();

        return title;
    };

```