const chalk = require("chalk");
const axios = require("axios");
const { isEqual, orderBy } = require("lodash/fp");

const RAILS_API_BASE_URL = "https://api.amazingtalker.com";

const subdomains = [
  // "en",
  "tw",
  // "au",
  // "ca",
  // "cn",
  // "es",
  // "fr",
  // "hk",
  // "jp",
  // "kr",
  // "pt",
  // "th",
  // "uk",
];
const languages = [
  "english",
  //  "chinese", "japanese"
];
const tags = [
  "business",
  // "children"
];
const tagIds = ["121-5", "121-2"];
const cities = [
  // "en_united_states_oklahoma_city",
  // "es_argentine_republic_mendoza",
  // "fr_france_ajaccio",
  "taipei",
  // "tokyo",
  // "kr_korea_tongyeong",
];

(async () => {
  for (const subdomain of subdomains) {
    for (const language of languages) {
      for (let tagIndex = 0; tagIndex < tags.length; tagIndex++) {
        for (const city of cities) {
          try {
            const { data: pageData } = await axios.get(
              `${RAILS_API_BASE_URL}/v1/pages/teachers/page_data`,
              {
                headers: { AtSubdomain: subdomain },
                params: {
                  language_url_name: language,
                  tag_value: tags[tagIndex],
                  city_code: city,
                },
              }
            );
            const { data: wallData } = await axios.post(
              `${RAILS_API_BASE_URL}/v1/pages/teachers/wall`,
              {
                headers: { AtSubdomain: subdomain },
                data: {
                  teach_language_url_name: language,
                  tag_id: tagIds[tagIndex],
                  city: {
                    code: city,
                  },
                  page: 1,
                },
              }
            );
            console.log(subdomain, language, tags[tagIndex], city);
            if (
              isEqual(
                orderBy(
                  ["key", "city", "city_name"],
                  ["asc", "asc", "asc"],
                  pageData.footer.cities
                ),
                orderBy(
                  ["key", "city", "city_name"],
                  ["asc", "asc", "asc"],
                  wallData.custom_city_codes
                )
              )
            ) {
              console.log(chalk.green("pass"));
            } else {
              console.log(
                orderBy(
                  ["key", "city", "city_name"],
                  ["asc", "asc", "asc"],
                  pageData.footer.cities
                ),
                orderBy(
                  ["key", "city", "city_name"],
                  ["asc", "asc", "asc"],
                  wallData.custom_city_codes
                )
              );
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
