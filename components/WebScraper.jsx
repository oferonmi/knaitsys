// Webpage scrapping functions
// import puppeteer from 'puppeteer';

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
        console.log(pg_data);
        return (pg_data);
      }).catch((error) => {
        console.error("Error:", error);
      });
}

// Puppeteer
// export const scrapeUsingPuppeteer = async (url) => {
//     // launch browser
//     const browser = await puppeteer.launch({
//         headless: false,
//         args: ["--disable-setuid-sandbox"],
//         'ignoreHTTPSErrors': true
//     });

//     // Open a new page
//     let page = await browser.newPage();
//       // Set screen size
//       // await page.setViewport({width: 1080, height: 1024});
//       // - open the website and wait until the dom content is loaded (HTML is ready)
//       await page.goto(url, {
//           waitUntil: "domcontentloaded",
//       });

//       // Wait for the required DOM to be rendered
// 		  // await page.waitForSelector('.page_inner');

//     // Get page data
//     const pg_data = await page?.evaluate(() => {
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

//     // Close the browser
//     await browser.close();
// }
