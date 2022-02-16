const chalk = require("chalk");
const axios = require("axios");
const { isEqual, orderBy, concat } = require("lodash/fp");

// const RAILS_API_BASE_URL = "https://api.amazingtalker.com";
// const RAILS_API_BASE_URL = "https://api.staging-rt.amazingtalker.com";
const RAILS_API_BASE_URL = "https://api.staging.amazingtalker.com";

const subdomains = [
  ["en", "en"],
  ["tw", "zh-TW"],
  ["au", "en-AU"],
  ["ca", "en-CA"],
  ["cn", "zh-CN"],
  ["es", "es"],
  ["fr", "fr"],
  ["hk", "zh-HK"],
  ["jp", "ja"],
  ["kr", "ko"],
  ["pt", "pt"],
  ["th", "th"],
  ["uk", "en-GB"],
];
const languages = ["english", "chinese", "japanese"];
const tags = ["business", "children"];
const tagIds = ["121-5", "121-2"];
const cities = [
  "en_united_states_oklahoma_city",
  "es_argentine_republic_mendoza",
  "fr_france_ajaccio",
  "taipei",
  "tokyo",
  "kr_korea_tongyeong",
];

(async () => {
  for (const [subdomain, locale] of subdomains) {
    for (const language of languages) {
      for (let tagIndex = 0; tagIndex < tags.length; tagIndex++) {
        for (const city of cities) {
          try {
            const { data: pageData } = await axios.get(`${RAILS_API_BASE_URL}/v1/pages/teachers/page_data`, {
              headers: { AtSubdomain: subdomain, AtLocale: locale },
              params: {
                language_url_name: language,
                tag_value: tags[tagIndex],
                city_code: city,
              },
            });
            const { data: wallData } = await axios.request({
              url: `${RAILS_API_BASE_URL}/v1/pages/teachers/wall`,
              method: "post",
              headers: { AtSubdomain: subdomain },
              data: {
                teach_language_url_name: language,
                tag_id: tagIds[tagIndex],
                city: {
                  code: city,
                },
                page: 1,
              },
            });
            const { data: clientInfoData } = await axios.request({
              url: `${RAILS_API_BASE_URL}/v1/settings/client_info`,
              headers: { AtSubdomain: subdomain, AtLocale: locale },
            });
            const expectedData = orderBy(
              ["code", "name"],
              ["asc", "asc"],
              wallData.custom_city_codes.length
                ? wallData.custom_city_codes.map(({ city, city_name }) => ({ code: city, name: city_name }))
                : clientInfoData.neighboring_city_infos.map(({ code, name }) => ({ code, name }))
            );
            console.log(subdomain, locale, language, tags[tagIndex], city);
            if (isEqual(orderBy(["code", "name"], ["asc", "asc"], pageData.footer.cities), expectedData)) {
              console.log(chalk.green("pass"));
            } else {
              console.log(orderBy(["code", "name"], ["asc", "asc"], pageData.footer.cities), expectedData);
              throw new Error();
            }
          } catch (error) {
            console.log(chalk.red("fail"));
            if (error.message) console.log(chalk.red(error.message));
          }
        }
      }
    }
  }
})();
