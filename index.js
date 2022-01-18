const axios = require("axios");

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
            const {
              data: {
                metadata: { title: receivedTitle },
              },
            } = await axios.get(
              "https://api.staging-st.amazingtalker.com/v1/pages/teachers/page_data",
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
            const expectedTitle = /<title>(.*)<\/title></.exec(html)[1];

            if (receivedTitle !== expectedTitle) {
              console.log(
                `curl "https://api.staging-st.amazingtalker.com/v1/pages/teachers/page_data?language_url_name=${language}&tag_value=${tag}&city_code=${city}" -H 'AtSubdomain: ${subdomain}'`
              );
              console.log("receivedTitle: ", receivedTitle);
              console.log("expectedTitle: ", expectedTitle);
            }
            console.log("\n");
          } catch (error) {
            console.log(error.message);
          }
        }
      }
    }
  }
})();
