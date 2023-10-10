// Webpage scrapping functions
// import puppeteer from "puppeteer";

// Cheerio
export const scrapeUsingCheerio = (url) => {

    const cheerio = require("cheerio");

    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        const $ = cheerio.load(html);
        const title = $("h1").text() + $("h2").text() + $("h3").text();
        const text_body = $("p").text();

        const pg_data = title + "\n" + text_body;
        // console.log("Title:", title);
        // console.log("Paragraph:", text_body);
        // console.log(pg_data);
        return (pg_data);
      }).catch((error) => {
        console.error("Error:", error);
      });
}

// Puppeteer
// export const scrapeUsingPuppeteer = async (url) => {
//     // Start a Puppeteer session with:
//     // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
//     // - no default viewport (`defaultViewport: null` - website page will in full width and height)
//     const browser = await puppeteer.launch({
//         headless: false,
//         defaultViewport: null,
//     });

//     // Open a new page
//     const page = await browser.newPage();

//     // - open the website and wait until the dom content is loaded (HTML is ready)
//     await page.goto(url, {
//         waitUntil: "domcontentloaded",
//     });

//     // Get page data
//     const pg_data = await page.evaluate(() => {
//         // Fetch the first element with class "quote"
//         const htmlSelectorList = document.querySelectorAll("div, p");

//         // Fetch the sub-elements from chosen html selector elements, get text content and return.
//         return Array.from(htmlSelectorList).map((htmlSelector) => {
//             const title = htmlSelector.querySelector("h1").innerText;
//             const text_body = htmlSelector.querySelector("p").innerText;

//             return title + "\n"+ text_body;
//         });
//     });

//     // Display the quotes
//     // console.log(pg_data);
//     return pg_data;

//     // Close the browser
//     await browser.close();
// }
