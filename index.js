const puppeteer = require('puppeteer');
require('dotenv').config();

const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const client = require('twilio')(accountSid, authToken);

var current = 0;
var previous = 0;

var count = 0;

(async function get() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://parkland.mytutorbridge.com/portal/availability/');

  await page.type('#id_username', process.env.user);
  await page.type('#id_password', process.env.pass);

  await page.keyboard.press('Enter');
  await page.waitForNavigation();

  await page.goto('https://parkland.mytutorbridge.com/portal/availability/');

  const bodies = await page.evaluate(() => {
    let headingFromWeb = document.querySelectorAll("body > main > div > div.col-md-8 > article:nth-child(2) > a");
    const headingList = [...headingFromWeb];
    return headingList.map(h => h.innerHTML);
  });
  current = bodies.length;
  if (count == 0) {
    previous = current;
  }
  if (current != previous || count == 0) {
    console.log('this')
    client.messages
      .create({
        body: 'There is a new tutoring request available! There are currently: ' + current + ' not scheduled!',
        from: '+13072421388',
        to: '+14845153348'
      })
      .then(message => console.log(message.sid));
  }
  console.log('The number of available tutoring sessions is: ' + bodies.length);
  previous = current;
  count++;
  await browser.close();
  setTimeout(get, 120000);
})();
