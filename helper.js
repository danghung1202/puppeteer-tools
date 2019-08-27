/*
 * Returns the text of the first element matching the selector
 * in the current page or element. Returns empty string if the selector
 * does not match
 * @param {string} selector - The selector to match the element we're looking for
 * @param {puppeteer.Page | puppeteer.ElementHandle} page - The page or element from where we are searching
 * https://medium.com/stink-studios/real-time-scraping-using-puppeteer-40495b5fc270
 */
const getText = async (
    selector,
    page
) => {
    const el = await page.$(selector);

    if (!el) {
        return "";
    }

    const text = (await el
        .getProperty("innerText")
        .then(x => x.jsonValue()));

    return text.trim();
};