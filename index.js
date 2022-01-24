const chalk = require("chalk");
const axios = require("axios");

const RAILS_API_BASE_URL = "https://api.staging-st.amazingtalker.com";

const subdomains = [
  "en",
  "tw",
  "au",
  "ca",
  "cn",
  "es",
  "fr",
  "hk",
  "jp",
  "kr",
  "pt",
  "th",
  "uk",
];
const languages = ["english", "chinese", "japanese"];
const tags = ["business", "children"];
const cities = [
  "en_united_states_oklahoma_city",
  "es_argentine_republic_mendoza",
  "fr_france_ajaccio",
  "taipei",
  "tokyo",
  "kr_korea_tongyeong",
];

(async () => {
  for (const subdomain of subdomains) {
    for (const language of languages) {
      for (const tag of tags) {
        for (const city of cities) {
          try {
            let received, expected;
            const { data: receivedData } = await axios.get(
              `${RAILS_API_BASE_URL}/v1/pages/teachers/page_data`,
              {
                params: {
                  language_url_name: language,
                  tag_value: tag,
                  city_code: city,
                },
                headers: { AtSubdomain: subdomain },
              }
            );
            const { data: html } = await axios.get(
              `https://${subdomain}.amazingtalker.com/tutors/${language}/${tag}`,
              { params: { city } }
            );

            console.log(
              `https://${subdomain}.amazingtalker.com/tutors/${language}/${tag}?city=${city}`
            );

            // metadata title
            received = receivedData.metadata.title;
            expected = /<title>(.*)<\/title></.exec(html)[1];
            if (!received || !expected || received !== expected) {
              console.log(chalk.yellow("metadata title"));
              console.log(
                `curl "${RAILS_API_BASE_URL}/v1/pages/teachers/page_data?language_url_name=${language}&tag_value=${tag}&city_code=${city}" -H 'AtSubdomain: ${subdomain}'`
              );
              console.log("received: ", received);
              console.log("expected: ", expected);
              throw Error();
            }

            // metadata description
            received = receivedData.metadata.description;
            expected = /name="description" content="(.*?)">/.exec(html)[1];
            if (!received || !expected || received !== expected) {
              console.log(chalk.yellow("metadata description"));
              console.log(
                `curl "${RAILS_API_BASE_URL}/v1/pages/teachers/page_data?language_url_name=${language}&tag_value=${tag}&city_code=${city}" -H 'AtSubdomain: ${subdomain}'`
              );
              console.log("received: ", received);
              console.log("expected: ", expected);
              throw Error();
            }

            // page hero title desktop
            received = receivedData.page_hero.title;
            expected =
              /<h2 class="wall-title at-text-shadow is-hidden-mobile".+?>(.*?)<\/h2></.exec(
                html
              )[1];
            if (!received || !expected || received !== expected) {
              console.log(chalk.yellow("page hero title desktop"));
              console.log(
                `curl "${RAILS_API_BASE_URL}/v1/pages/teachers/page_data?language_url_name=${language}&tag_value=${tag}&city_code=${city}" -H 'AtSubdomain: ${subdomain}'`
              );
              console.log("received: ", received);
              console.log("expected: ", expected);
              throw Error();
            }

            // page hero title mobile
            received = receivedData.page_hero.mobile_title;
            expected =
              /<h2 class="wall-title at-text-shadow is-hidden-tablet".+?>(.*?)<\/h2></.exec(
                html
              )[1];
            if (!received || !expected || received !== expected) {
              console.log(chalk.yellow("page hero title mobile"));
              console.log(
                `curl "${RAILS_API_BASE_URL}/v1/pages/teachers/page_data?language_url_name=${language}&tag_value=${tag}&city_code=${city}" -H 'AtSubdomain: ${subdomain}'`
              );
              console.log("received: ", received);
              console.log("expected: ", expected);
              throw Error();
            }

            // page hero subtitle
            received = receivedData.page_hero.subtitle;
            expected = /class="wall-subtitle at-text-shadow".+?>(.*?)<\//.exec(
              html
            )[1];
            if (!received || !expected || received !== expected) {
              console.log(chalk.yellow("page hero subtitle"));
              console.log(
                `curl "${RAILS_API_BASE_URL}/v1/pages/teachers/page_data?language_url_name=${language}&tag_value=${tag}&city_code=${city}" -H 'AtSubdomain: ${subdomain}'`
              );
              console.log("received: ", received);
              console.log("expected: ", expected);
              throw Error();
            }
            console.log(chalk.green("pass"));
          } catch (error) {
            console.log(chalk.red("fail"));
            if (error.message) console.log(chalk.red(error.message));
          }
          console.log("\n");
        }
      }
    }
  }
})();
