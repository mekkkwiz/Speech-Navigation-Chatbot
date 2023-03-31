const express = require('express');
const dialogflow = require('@google-cloud/dialogflow').v2;


const router = express.Router();

const config = require('../config/keys');

const projectId = config.googleProjectID
const client_email = config.googleClientEmail
const sessionId = config.dialogFlowSessionID
const languageCode = config.dialogFlowSessionLanguageCode
const private_key = config.googlePrivateKey


// Create a new session
// endpoint options for non-US regions data center
// const options = {
//     apiEndpoint: "australia-southeast1-dialogflow.googleapis.com"
// }

const sessionClient = new dialogflow.SessionsClient({
    credentials: {
        client_email: client_email,
        private_key: private_key
    },
    projectId: projectId,
    apiEndpoint: 'dialogflow.googleapis.com'
});
// const sessionPath = `projects/${projectId}/locations/australia-southeast1/agent/sessions/${sessionId}` // for non-US regions data center
const sessionPath = sessionClient.projectAgentSessionPath( // for US regions data center (default)
    projectId,
    sessionId
);

// We will make two routes~

// Text Query Route

router.post('/textQuery', async (req, res) => {
    // We need to send some information that comes from the client to Dialogflow API
    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: req.body.text,
                // The language used by the client (th)
                languageCode: languageCode,
            },
        },
        outputAudioConfig: {
            audioEncoding: 'OUTPUT_AUDIO_ENCODING_LINEAR_16',
        },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.log('Detected intent');
    const result = responses[0].queryResult;
    const audio = responses[0].outputAudio;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
    } else {
        console.log('  No intent matched.');
    }

    // Convert the binary audio data to base64 encoding
    const audioBase64 = Buffer.from(audio, 'binary').toString('base64');

    // Send both text and audio response in the JSON object
    res.send({
        textResponse: result,
        audioResponse: audioBase64
    });
})



//Event Query Route

router.post('/eventQuery', async (req, res) => {
    //We need to send some information that comes from the client to Dialogflow API
    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            event: {
                // The query to send to the dialogflow agent
                name: req.body.event,
                // The language used by the client (th)
                languageCode: languageCode,
            },
        },
        outputAudioConfig: {
            audioEncoding: 'OUTPUT_AUDIO_ENCODING_LINEAR_16',
        },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.log('Detected intent');
    const result = responses[0].queryResult;
    const audio = responses[0].outputAudio;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
    } else {
        console.log('  No intent matched.');
    }

    // Convert the binary audio data to base64 encoding
    const audioBase64 = Buffer.from(audio, 'binary').toString('base64');

    // Send both text and audio response in the JSON object
    res.send({
        textResponse: result,
        audioResponse: audioBase64
    });
})

module.exports = router;