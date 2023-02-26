import React, { useEffect, useRef } from "react";
import Axios from 'axios';
import { useDispatch, useSelector } from "react-redux";
import { saveMessage } from '../../redux/_actions/message_actions'
import RenderOneMessage from './Sections/RenderOneMessage.js';
import { List, Avatar } from 'antd';
import { RobotOutlined, SmileOutlined } from '@ant-design/icons'
// import videoPlayer from './Sections/VideoPlayer.js';
import ReactPlayer from 'react-player';

function Chatbot() {
  const dispatch = useDispatch()
  const messageFormRedux = useSelector((state) => state.messages.messages)

  //* this is will trigger eventQuery for make initial welcome message
  //* by using useEffect to store response messages

  // useEffect(() => {
  //   eventQuery('WelcomeToMyWebsite')
  // }, [])

  // useEffect(() => {
  //     attemptPlay();
  // }, []);

  //* this function will handle input text messages from users
  //* and send request to server and save response to redux store by dispatch
  const textQuery = async (text) => {
    //* will send request to text query route
    //* create a new message object from text input
    let conversation = {
      who: 'user',
      content: {
        text: {
          text: text
        }
      }
    }
    //* store new message object from user input to redux store by using saveMessage acction
    dispatch(saveMessage(conversation))
    console.log("text i send", conversation)

    //* We need to take care of the message Chatbot sent
    const textQueryVariables = {
      text
    }
    try {
      //* I will send request to the textQuery ROUTE
      const response = await Axios.post('http://localhost:5000/api/dialogflow/textQuery', textQueryVariables)
      console.log("textQuery response", response)

      const audioRes = response.data.audioResponse;

      for (let content of response.data.textResponse.fulfillmentMessages) {
        //* create a new message object from bot response
        let conversation = {
          who: 'bot',
          content: content
        }
        //* store new message object from bot response to redux store by using saveMessage acction
        dispatch(saveMessage(conversation))
        // Check if the message from the bot includes an audio response
        if (audioRes) {
          // Create an Audio element and set its source to the base64-encoded audio data
          let audio = new Audio('data:audio/wav;base64,' + audioRes);

          // Play the audio
          audio.play();
        }
      }



    } catch (error) {
      conversation = {
        who: 'bot',
        content: {
          text: {
            text: " Error just occurred, please check the problem"
          }
        }
      }

    }
  }
  //* this function will handle input event from users
  const eventQuery = async (event) => {
    //* We need to take care of the message Chatbot sent
    const eventQueryVariables = {
      event
    }
    try {
      //* I will send request to the textQuery ROUTE
      const response = await Axios.post('http://localhost:5000/api/dialogflow/eventQuery', eventQueryVariables)
      for (let content of response.data.textResponse.fulfillmentMessages) {
        //* create a new message object from bot response
        let conversation = {
          who: 'bot',
          content: content
        }
        //* store new message object from bot response to redux store by using saveMessage acction
        dispatch(saveMessage(conversation))
      }

    } catch (error) {
      let conversation = {
        who: 'bot',
        content: {
          text: {
            text: " Error just occurred, please check the problem"
          }
        }
      }

    }
  }

  //* handle when user press enter to send a message
  const keyPressHandler = (e) => {
    if (e.key === "Enter") {
      if (!e.target.value) {
        return alert('You need to type something first');
      }

      //* we will send request to text query route
      textQuery(e.target.value)
      e.target.value = "";
    }
  }




  //* render messages from redux store by using List and RenderOneMessage function
  const renderMessages = (returnedMessages) => {
    if (returnedMessages) {
      return (
        <List
          dataSource={returnedMessages}
          renderItem={(message, i) => {
            if (message.content && message.content.text && message.content.text.text) {
              return <RenderOneMessage key={i} who={message.who} text={message.content.text.text} />
            }
            else if (message.content && message.content.payload.fields.video_url) {
              const AvatarSrc = (message.who === 'bot') ?
                <RobotOutlined className="inline-block align-middle text-black text-xl" />
                : <SmileOutlined className="inline-block align-middle text-black text-xl" />
              //! console.log(message.content.payload.fields.video_url)
              return (
                <List.Item style={{ padding: '1rem' }}>
                  <List.Item.Meta
                    avatar={<Avatar icon={AvatarSrc} />}
                    title={message.who}
                    description={
                      <video controls width="500" autoPlay={true} loop={true}>
                        <source src={message.content.payload.fields.video_url.stringValue}
                          type="video/mp4" />
                      </video>
                    }
                  />
                </List.Item>
              )
            }
          }}
        />
      )
    }
    else {
      return null
    }
  }


  return (
    <div className="h-[770px] w-[770px] border-[3px] rounded-[7px] border-black">
      <div className="h-[714px] w-full overflow-auto">
        {renderMessages(messageFormRedux)}
      </div>


      <input
        className="m-0 w-full h-[50px] rounded-[4px] p-[5px] text-base"
        placeholder="Send a message..."
        onKeyPress={keyPressHandler}
        type="text"
      />
    </div>
  );
}

export default Chatbot;