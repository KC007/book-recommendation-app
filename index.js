import puppeteer from "puppeteer";
import inquirer from "inquirer";
import _ from "underscore";
import chalk from "chalk";

async function main() {
  console.log(
    chalk.white.bgMagenta.bold(
      "Please wait while we load up your list of genres......."
    )
  );

  let data = await dataScraping();
  let titleList = data.map((x) => {
    return x.title;
  });

  inquirer
    .prompt([
      {
        type: "list",
        name: "user_choice",
        message:
          "Hi, which genre would you be interested in? We are going to pick a book for you.",
        choices: titleList,
        default: "a",
      },
    ])
    .then((answer) => {
      let choice = _.find(data, { title: answer.user_choice });
      redirect(choice.url);
    })
    .catch((error) => {
      console.log(error);
    });
}

/**  A list of genre is extracted from goodreads.com */

async function dataScraping() {
  let data = new Promise((resolve, rejects) => {
    resolve(
      (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(
          "https://www.goodreads.com/choiceawards/best-books-2020"
        );
        const bookGenre = await page.evaluate(() =>
          Array.from(document.querySelectorAll("div.category.clearFix")).map(
            (ele) => ({
              title: ele.childNodes[1].innerText,
              url: ele.childNodes[1].href,
            })
          )
        );
        await browser.close();
        return bookGenre;
      })()
    );
  });

  return data;
}

/** taking user input to goodreads and randomly pick a book of the selected genre */

async function redirect(url) {
  console.log(
    chalk.magentaBright("Wait a moment.... We are taking you to Amazon " + "\n")
  )(async () => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url);

      await page.waitForSelector(".pollAnswer__bookLink");
      const bookArray = await page.$$(".pollAnswer__bookLink");
      const propertyJsHandles = await Promise.all(
        bookArray.map((bookArray) => bookArray.getProperty("href"))
      );

      const linksArray = await Promise.all(
        propertyJsHandles.map((handle) => handle.jsonValue())
      );

      const numOfBooks = bookArray.length - 1;
      let randomBookNum = Math.floor(Math.random() * (numOfBooks - 0) + 0);

      await page.goto(linksArray[randomBookNum]);
      await page.waitForSelector("h1#bookTitle");

      const bookTitle = await page.evaluate(
        () => document.querySelector("h1#bookTitle").innerText
      );

      launchingAmazon(bookTitle);
    } catch (err) {
      console.error(err);
    }
  })();
}

/** find book in Amazon and display cart page */

async function launchingAmazon(booktitle) {
  (async () => {
    try {
      const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
      });
      const page = await browser.newPage();
      await page.goto("https://amazon.com");
      await page.waitForSelector("input[name=field-keywords]");
      await page.type("input[name=field-keywords]", booktitle);
      await page.click('input[type="submit"]');

      await page.waitForSelector("h2.a-size-mini");
      const [a] = await page.$x("//a[contains(text(), 'Paperback')]");

      if (a) {
        await a.click();
      } else {
        throw new Error("Element not found");
      }

      await page
        .waitForSelector("input#add-to-cart-button")
        .then(() => {
          page.click("input#add-to-cart-button");
        })
        .catch((e) => {
          page.click("input#add-to-cart-button-ubb");
        });

      const [link] = await page.$x("//a[contains(text(), ' Go to Cart ')]");

      if (link) {
        await page.click("a#nav-cart");
      }

      /** force it to reload to show the cart page (temporary work around ) */
      await page.click("a#nav-cart");
    } catch (err) {
      console.error(err);
    }
  })();
}

main();
