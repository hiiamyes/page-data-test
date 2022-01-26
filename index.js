const chalk = require("chalk");
const axios = require("axios");
const { get } = require("lodash/fp");

const RAILS_API_BASE_URL = "https://api.amazingtalker.com";

const subdomains = ["tw", "en", "au", "ca", "cn", "es", "fr", "hk", "jp", "kr", "pt", "th", "uk"];
const languages = ["english", "chinese", "japanese"];
const tags = ["", "business", "children"];
const cities = [
  "neihu",
  "en_united_states_oklahoma_city",
  "es_argentine_republic_mendoza",
  "fr_france_ajaccio",
  "taipei",
  "tokyo",
  "kr_korea_tongyeong",
];

(async () => {
  console.log(chalk.yellow("tutors debug page test started"));
  for (const subdomain of subdomains) {
    for (const language of languages) {
      for (const tag of tags) {
        for (const city of cities) {
          try {
            const { data: receivedData } = await axios.request({
              url: `${RAILS_API_BASE_URL}/v1/pages/teachers/page_data`,
              params: {
                language_url_name: language,
                tag_value: tag,
                city_code: city,
              },
              headers: { AtSubdomain: subdomain },
            });
            const { data: expectedHtml } = await axios.request({
              url: `https://${subdomain}.amazingtalker.com/tutors/${language}/${tag}`,
              params: { city },
            });
            [
              { name: "metadata title", key: "metadata.title", re: /<title>(.*)<\/title></ },
              {
                name: "metadata description",
                key: "metadata.description",
                re: /name="description" content="(.*?)">/,
              },
              {
                name: "page hero title desktop",
                key: "page_hero.title",
                re: /<h2 class="wall-title at-text-shadow is-hidden-mobile".+?>(.*?)<\/h2></,
              },
              {
                name: "page hero title mobile",
                key: "page_hero.mobile_title",
                re: /<h2 class="wall-title at-text-shadow is-hidden-tablet".+?>(.*?)<\/h2></,
              },
              {
                name: "page hero subtitle",
                key: "page_hero.subtitle",
                re: /class="wall-subtitle at-text-shadow".+?>(.*?)<\//,
              },
            ].forEach(({ name, key, re }) => {
              // console.log(chalk.gray(name));
              const received = get(key, receivedData);
              const expected = re.exec(expectedHtml)[1];
              // console.log(chalk.gray("received: " + received));
              // console.log(chalk.gray("expected: " + expected));
              if (!received || !expected || received !== expected) {
                console.log([subdomain, language, tag, city].join());
                console.log(chalk.gray(name));
                console.log(chalk.gray("received: " + received));
                console.log(chalk.gray("expected: " + expected));
                console.log(
                  `https://${subdomain}.amazingtalker.com/tutors-debug/${language}/${tag}?${city ? `city=${city}` : ""}`
                );
                console.log(
                  `https://${subdomain}.amazingtalker.com/tutors/${language}/${tag}?${city ? `city=${city}` : ""}`
                );
                console.log(chalk.red("fail"));
                console.log("\n");
                // throw Error();
              }
              // console.log(chalk.green("pass"));
            });
          } catch (error) {
            // console.log(chalk.red("fail"));
            if (error.message) console.log(chalk.red(error.message));
          }
        }
      }
    }
  }
  console.log(chalk.yellow("tutors debug page test ended"));
  process.exit();
})();
