# Building Access Navigation Program using Speech Interaction

The Building Access Navigation Program using Speech Interaction is a senior project for the Computer Engineering program. The program aims to create a system that enables users to navigate a building easily using voice commands and video navigation. In addition to this, the program can answer queries about the professor's location and the weather, providing users with additional information.

This project utilizes cutting-edge technologies such as Natural Language Understanding (NLU) and Text-to-Speech (TTS) engines to provide an intuitive and interactive experience for users. The program is built using Next.js for the front-end, Express for the backend, and Firebase to store video for navigation. Furthermore, the program integrates with the Google TTS API to provide audio responses and Dialogflow for understanding user intent.

The program also features additional functionalities such as the ability to inquire about the professor's whereabouts and weather conditions such as pollution levels and temperature in the user's current location. Our goal is to develop a reliable, efficient, and accessible system that can improve the quality of life for people with disabilities and provide valuable information to users.

## Table of Contents

- [Building Access Navigation Program using Speech Interaction](#building-access-navigation-program-using-speech-interaction)
  - [Table of Contents](#table-of-contents)
  - [Tech Stack](#tech-stack)
  - [Features](#features)
  - [Installation](#installation)
    - [Alternatively, you can use Docker to run the program. Follow these steps to install using Docker](#alternatively-you-can-use-docker-to-run-the-program-follow-these-steps-to-install-using-docker)
  - [Usage](#usage)
  - [Credits](#credits)

## Tech Stack

- Frontend: Next.js
- Backend: Express
- Database: Firebase
- Speech to Text: Google TTS API
- Natural Language Understanding: Dialogflow

## Features

- Speech interaction: Users can navigate the building using speech commands.
- Video navigation: Users can view the building map and navigate using video.
- Audio response: The program responds to user commands with audio using the Google TTS API.
- Answer questions: The program can answer questions about the professor's whereabouts or the weather.

## Installation

1. ### Clone the repository

    ```bash
    git clone https://github.com/mekkkwiz/final-project-app
    ```

2. ### Install dependencies

    ```bash
    cd final-project-app
    npm install

    cd client_v2
    npm install

    cd DfFulfillment
    npm install
    ```

3. ### Create a .env file with the following variables

    ```.env
    GOOGLE_PROJECT_ID="your-project-id"
    DIALOGFLOW_SESSION_ID="unique-session-id"
    DIALOGFLOW_SESSION_LANGUAGE_CODE="th"
    GOOGLE_CLIENT_EMAIL="your-client-email"
    GOOGLE_PRIVATE_KEY="your-private-key"
    ```

    and download your service account key from the Google Cloud Platform and save it as `serviceAccountKey.json` in the DFfullfillment directory of the project.

4. ### Start the server

    ```bash
    npm run dev
    ```

    and run fulfillment server in DfFulfillment directory

    ```bash
    npm run dev
    ```

    you may need to put localhost of fulfillment server on the internet by using ngrok that you can download from <https://ngrok.com/download>

    ```bash
    ngrok http 3030
    ```

    then copy the https url and put it on the fulfillment server on the Dialogflow

### Alternatively, you can use Docker to run the program. Follow these steps to install using Docker

1. Install Docker on your machine.
2. Clone the repository:

    ```bash
    git clone https://github.com/mekkkwiz/final-project-app
    ```

3. Navigate to the root directory of the project:

    ```bash
    cd final-project-app
    ```

4. Build the Docker image:

    ```bash
    docker build -t building-access-navigation .
    ```

5. Run the Docker image:

    ```bash
    docker run -p 3000:3000 -p 5000:5000 -p 3030:3030 building-access-navigation
    ```

6. then do step 3 and 4 in the manual installation section

## Usage

1. Open the program in your browser at <http://localhost:3000>.
2. Allow access to your microphone and camera.
3. Use speech commands to navigate the building, inquire about the professor's location, or ask about the weather.
4. The program will respond with audio via the Google TTS API.

## Credits

- Next.js: <https://nextjs.org/>
- Express: <https://expressjs.com/>
- Firebase: <https://firebase.google.com/>
- Google TTS API: <https://cloud.google.com/text-to-speech>
- Dialogflow: <https://cloud.google.com/dialogflow/>
- Weather API: <https://openweathermap.org/api>
