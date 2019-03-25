require("dotenv").config();

// pull in slack libs
const { createEventAdapter } = require("@slack/events-api");
const { WebClient } = require("@slack/client");
const { createMessageAdapter } = require("@slack/interactive-messages");

// Get tokens
const bot_token = process.env.SLACK_BOT_TOKEN;
const signingSecret = process.env.SLACK_SIGNING_SECRET;

//Create clients
const slackEvents = createEventAdapter(signingSecret);
const slackInteractions = createMessageAdapter(signingSecret);
const webBotClient = new WebClient(bot_token);

//App Config
const http = require("http");
const express = require("express");
const port = process.env.PORT || 3000;
const app = express();
const bodyParser = require("body-parser");

// Attach the adapter to the Express application as a middleware
// app.use((req, res, next) => {
//   console.log(req.url);
//   next();
// });
app.use("/slack/actions", slackInteractions.expressMiddleware());
app.use("/slack/events", slackEvents.expressMiddleware());
app.use("/command", bodyParser.urlencoded({ extended: true }));
app.use("/command", bodyParser.json());

app.post("/command/greet", (req, res) => {
  res.json({
    text: `Hello ${req.body.user_name}!`,
    attachments: [
      {
        callback_id: "greet_response",
        text: "What did you think of this greeting?",
        actions: [
          {
            name: "greet_res",
            text: "Likee",
            type: "button",
            style: "success",
            value: "like"
          },
          {
            name: "greet_res",
            text: "Hate",
            type: "button",
            style: "danger",
            value: "hate"
          }
        ]
      }
    ]
  });
});

slackInteractions.action("greet_response", (payload, respond) => {
  console.log("GREET ACTION", payload);
  return `we have acknowledged your opinion of ${payload.actions[0].value}`;
});

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on("message", async event => {
  console.log("Message");

  if (event.subtype != "bot_message") {
    console.log(event);
    await webBotClient.chat.postEphemeral({
      user: event.user,
      channel: event.channel,
      text: `You said: ${event.text}`
    });
  }
});

// Handle errors (see `errorCodes` export)
slackEvents.on("error", console.error);

// Start the express application server
http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});
