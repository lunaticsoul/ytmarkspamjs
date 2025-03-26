Create a project at google's console then Enable service: youtube.googleapis.com for client id

set it at config.json
both client id and channel are required
"clientId": "[CLIENT_ID].apps.googleusercontent.com"
"channel": "UC2[CHANNEL_ID]"

run the server

access http://localhost:port to set token

make a http request to `/api/process`
