const chalk = require("chalk");
const axios = require("axios");
const { isEqual, orderBy, concat } = require("lodash/fp");

const RAILS_API_BASE_URL = "https://api.amazingtalker.com";
// const RAILS_API_BASE_URL = "http://192.168.1.63:3000";
// const RAILS_API_BASE_URL = "https://api.staging-rt.amazingtalker.com";
// const RAILS_API_BASE_URL = "https://api.staging.amazingtalker.com";
// const RAILS_API_BASE_URL = "https://api.staging-st.amazingtalker.com";

const subdomains = [
  ["en", "en"],
  ["tw", "zh-TW"],
  ["es", "es"],
  ["fr", "fr"],
  ["hk", "zh-HK"],
  ["jp", "ja"],
  ["kr", "ko"],
  ["uk", "en-GB"],
  ["au", "en-AU"],
  ["ca", "en-CA"],
  ["cn", "zh-CN"],
  ["pt", "pt"],
  ["th", "th"],
];
const languages = [
  null,
  "english",
  "chinese",
  "japanese",
];
const tags = [
  null,
  "business",
  "children",
];
const tagIds = [null, "121-5", "121-2"];
const cities = [
  null,
  // "en_united_states_oklahoma_city",
  // "es_argentine_republic_mendoza",
  // "fr_france_ajaccio",
  "taipei",
  // "tokyo",
  // "kr_korea_tongyeong",
];

const queries = [
  { city: null, offline: null },
  { city: "taipei", offline: null },
  { city: null, offline: "classes-near-me" },
];

(async () => {
  for (const [subdomain, locale] of subdomains) {
    for (const language of languages) {
      for (let tagIndex = 0; tagIndex < tags.length; tagIndex++) {
        const tag = tags[tagIndex];
        if (!language && tag) continue;
        for (const query of queries) {
          const { city, offline } = query
          try {
            const { data: pageData } = await axios.request({
              url: `${RAILS_API_BASE_URL}/v1/pages/teachers/page_data`,
              headers: { AtSubdomain: subdomain, AtLocale: locale },
              params: {
                language_url_name: language,
                tag_value: tag,
                city_code: city,
                offline,
              },
            });
            const { data: expectedHtml, request } = await axios.request({
              url: `https://${subdomain}.amazingtalker.com/tutors${language ? `/${language}` : ""}${
                tag ? `/${tag}` : ""
              }`,
              params: { city, offline },
            });

            const expectedTitle = /<h2 class="wall-title at-text-shadow is-hidden-mobile" [^>]*>[^>]*<\/h2></
              .exec(expectedHtml)[0]
              .replace(/<h2 [^>]*>/, '')
              .replace(/<\/h2></,'');
            const expectedMobileTitle = /<h2 class="wall-title at-text-shadow is-hidden-tablet" [^>]*>(.*)<\/h2></
              .exec(expectedHtml)[0]
              .replace(/<h2 [^>]*>/, '')
              .replace(/<\/h2></,'');
            const expectedSubtitle = /<h3 class="wall-subtitle at-text-shadow" [^>]*>[^>]*<\/h3></
              .exec(expectedHtml)[0]
              .replace(/<h3 [^>]*>/, '')
              .replace(/<\/h3></,'');

            if (
              isEqual(pageData.page_hero.title, expectedTitle) &&
              isEqual(pageData.page_hero.mobile_title, expectedMobileTitle) &&
              isEqual(pageData.page_hero.subtitle, expectedSubtitle)
            ) {
              console.log(subdomain, locale, language, tag, city, offline, chalk.green("pass"));
            } else {
              console.log(
                subdomain,
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
                "\n",
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
})();
