require("dotenv").config();
const { WebClient } = require("@slack/client");
const web = new WebClient(process.env.SLACK_TOKEN);

const currentTime = new Date().toTimeString();

(async () => {
  const res = await web.auth.test();

  const userId = res.user_id;

  await web.chat.postMessage({
    channel: userId,
    text: `the current time is ${currentTime}`
  });

  console.log("RES:", res);

  console.log("Message Posted");
})();
