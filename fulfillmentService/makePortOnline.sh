# Start ngrok
echo "Starting ngrok, please wait..."
ngrok http 3030 > /dev/null &

# Wait for ngrok to start
sleep 5

# Retrieve public URL of ngrok tunnel
ngrok_url=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')

# Prompt user to use ngrok URL in their Dialogflow fulfillment webhook URL
echo "Please use the following URL as your Dialogflow fulfillment webhook URL:"
echo "${ngrok_url}"

# Start app
npm run dev