# Backend API Project

TODO

## Slack Integration

URL: https://slack.com/api/chat.postMessage

Header: Authorization: Bearer xxxx

```{
    "channel": "U04FY0U8G0L",
    "blocks":[
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Don't forget your booking you have a booking *tomorrow*.\nPlease confirm if you still need your booking"
            }
          },
          {
            "type": "actions",
            "block_id": "processAddTask",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "emoji": true,
                  "text": "Confirm"
                },
                "style": "primary",
                "value": "1"
              },
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "emoji": true,
                  "text": "Cancel"
                },
                "style": "danger",
                "value": "0"
              }
            ]
          }
        ]
}
```