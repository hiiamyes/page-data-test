const chalk = require("chalk");
const axios = require("axios");
const { isEqual, orderBy, concat } = require("lodash/fp");

// const RAILS_API_BASE_URL = "https://api.amazingtalker.com";
// const RAILS_API_BASE_URL = "http://192.168.1.63:3000";
// const RAILS_API_BASE_URL = "https://api.staging-rt.amazingtalker.com";
// const RAILS_API_BASE_URL = "https://api.staging.amazingtalker.com";
// const RAILS_API_BASE_URL = "https://api.staging-st.amazingtalker.com";
const RAILS_API_BASE_URL = "http://localhost:3000";

const countries = [
  // ["en", "en"],
  // ["tw", "zh-TW"],
  ["jp", "ja"],
  // ["kr", "ko"],
  // ["au", "en-AU"],
  // ["pt", "pt"],
  // ["th", "th"],
  // ["cn", "zh-CN"],
  // ["hk", "zh-HK"],
  // ["fr", "fr"],
  // ["es", "es"],
  // ["uk", "en-GB"],
  // ["ca", "en-CA"],
];
const languages = [
  null,
  "english",
  "chinese",
  "japanese",
];
const tags = [null, "business", "children"];
const tagIds = [null, "121-5", "121-2"];
const cities = [
  [null, null],
  ["au", "en_australia_sydney"],
  ["ca", "en_canada_ottawa"],
  ["en", "new_york_city_ny"],
  ["es", "es_spain_zaragoza"],
  ["fr", "fr_france_ajaccio"],
  ["hk", "sha_tin"],
  ["jp", "tokyo"],
  ["kr", "kr_korea_tongyeong"],
  ["pt", "shilin"],
  ["th", "neihu"],
  ["tw", "taipei"],
  ["uk", "en_united_kingdom_sheffield"],
];
const offlines = [null, "classes-near-me"];

(async () => {
  for (const [country, locale] of countries) {
    for (const language of languages) {
      for (let tagIndex = 0; tagIndex < tags.length; tagIndex++) {
        const tag = tags[tagIndex];
        if (!language && tag) continue;
        for (const [cityCountry, city] of cities) {
          if (cityCountry && cityCountry !== country) continue;
          for (const offline of offlines) {
            if (city && offline) continue;
            try {
              const { data: pageData } = await axios.request({
                url: `${RAILS_API_BASE_URL}/v1/pages/teachers/page_data`,
                headers: { AtSubdomain: country, AtLocale: locale },
                params: {
                  language_url_name: language,
                  tag_value: tag,
                  city_code: city,
                  offline,
                },
              });
              const { data: expectedHtml, request } = await axios.request({
                url: `https://${country}.amazingtalker.com/tutors${language ? `/${language}` : ""}${
                  tag ? `/${tag}` : ""
                }`,
                params: { city, offline },
              });

              const expectedTitle = /<h2 class="wall-title at-text-shadow is-hidden-mobile".*?>(.*?)<\/h2>/.exec(
                expectedHtml
              )[1];
              const expectedMobileTitle = /<h2 class="wall-title at-text-shadow is-hidden-tablet".*?>(.*?)<\/h2>/.exec(
                expectedHtml
              )[1];
              const expectedSubtitle = /<h3 class="wall-subtitle at-text-shadow".*?>(.*?)<\/h3>/.exec(expectedHtml)[1];

              if (
                isEqual(pageData.page_hero.title, expectedTitle) &&
                isEqual(pageData.page_hero.mobile_title, expectedMobileTitle) &&
                isEqual(
                  pageData.page_hero.subtitle.replace(/\d* student reviews|\d* avis/, "1234 student reviews"),
                  expectedSubtitle.replace(/\d* student reviews|\d* avis/, "1234 student reviews")
                )
              ) {
                console.log(country, locale, language, tag, city, offline, chalk.green("pass"));
              } else {
                console.log(
                  country,
                  locale,
                  language,
                  tag,
                  city,
                  offline,
                  chalk.red("fail"),
                  "\n",
                  request.res.responseUrl,
                  "\n",
                  pageData.page_hero.title,
                  "\n",
                  expectedTitle,
                  "\n",
                  pageData.page_hero.mobile_title,
                  "\n",
                  expectedMobileTitle,
                  "\n",
                  pageData.page_hero.subtitle,
                  "\n",
                  expectedSubtitle,
                  "\n"
                );
                throw new Error();
              }
            } catch (error) {
              if (error.message) console.log(chalk.red(error.message));
            }
          }
        }
      }
    }
  }
})();
