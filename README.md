# Book recommendation App

The program will first ask the user to pick a genre and pick a random book of the selected genre. Then it will find the book in Amazon and add it to the cart. The browser will be opened and the cart page will be shown to the user. 

## Get Started

To start the program, clone the project and use 

```shell 

npm install 
npm start

``` 

Please make sure you are using the latest version of Node. This should prompt the program to load up a list of genres to pick from in the terminal. 

## Challenges

I took a bit of the time to debug due to some inconsistency with the styling & labelling of the elements in the source website (Goodreads) which could be due to the responsiveness to window sizes.

I also spent a bit more time to manipulate certain buttons as shortcuts to get to the product page in Amazon. However, when a button from Goodreads.com triggers a new tab, it is more problematic to continue to operate on that new tab. It seems to take too long to debug and time conscious wise, I have picked another method to achieve the same goal although the code might seem less elegant. 

**Author : Karen Cheung** 
**Tech used : Javascript , Node js(v17.6.0), Puppeteer** 