const chalk = require("chalk");
const axios = require("axios");

const subdomains = [
  "tw",
  //  "en", "au", "ca", "cn", "es", "fr", "hk", "jp", "kr", "pt", "th", "uk"
];
const languages = [
  "english",
  //  "chinese", "japanese"
];
const tags = [
  "",
  // , "business", "children"
];
const cities = [
  "neihu",
  // "taipei",
  // "en_united_states_oklahoma_city",
  // "es_argentine_republic_mendoza",
  // "fr_france_ajaccio",
  // "tokyo",
  // "kr_korea_tongyeong",
];

(async () => {
  console.log(chalk.yellow("tutors debug page test started"));
  for (const subdomain of subdomains) {
    for (const language of languages) {
      for (const tag of tags) {
        for (const city of cities) {
          try {
            console.log(subdomain, language, tag, city);
            const { data: receivedHtml } = await axios.request({
              url: `https://${subdomain}.amazingtalker.com/tutors-debug/${language}/${tag}`,
              params: { city },
            });
            const { data: expectedHtml } = await axios.request({
              url: `https://${subdomain}.amazingtalker.com/tutors/${language}/${tag}`,
              params: { city },
            });
            [
              { name: "metadata title", re: /<title>(.*)<\/title></ },
              {
                name: "metadata description",
                re: /name="description" content="(.*?)">/,
              },
              {
                name: "page hero title desktop",
                re: /<h2 class="wall-title at-text-shadow is-hidden-mobile".+?>(.*?)<\/h2></,
              },
              {
                name: "page hero title mobile",
                re: /<h2 class="wall-title at-text-shadow is-hidden-tablet".+?>(.*?)<\/h2></,
              },
              {
                name: "page hero subtitle",
                re: /class="wall-subtitle at-text-shadow".+?>(.*?)<\//,
              },
            ].forEach(({ name, re }) => {
              console.log(chalk.gray(name));
              const received = re.exec(receivedHtml)[1];
              const expected = re.exec(expectedHtml)[1];
              console.log(chalk.gray("received: " + received));
              console.log(chalk.gray("expected: " + expected));
              if (!received || !expected || received !== expected) {
                console.log(`https://${subdomain}.amazingtalker.com/tutors-debug/${language}/${tag}`);
                throw Error();
              }
              console.log(chalk.green("pass"));
            });
          } catch (error) {
            console.log(chalk.red("fail"));
            if (error.message) console.log(chalk.red(error.message));
          }
        }
      }
    }
  }
  console.log(chalk.yellow("tutors debug page test ended"));
  process.exit();
})();
