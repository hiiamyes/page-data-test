const axios = require("axios");

(async () => {
  try {
    const received = await axios.get(
      "https://api.staging-st.amazingtalker.com/v1/pages/teachers/page_data",
      {
        params: { language_url_name: "japanese", city_code: "neihu" },
        headers: { AtSubdomain: "tw" },
      }
    );
    console.log(received.data.metadata.title);
    const expected = await axios.get(
      "https://tw.amazingtalker.com/tutors/chinese",
      { params: { city: "neihu" } }
    );
    console.log(/<title>(.*)<\/title></.exec(expected.data)[1]);
  } catch (error) {
    console.log(error.message);
  }
})();
