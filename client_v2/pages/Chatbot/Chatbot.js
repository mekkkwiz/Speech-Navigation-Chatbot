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
      for (let content of response.data.fulfillmentMessages) {
        //* create a new message object from bot response
        let conversation = {
          who: 'bot',
          content: content
        }
        //* store new message object from bot response to redux store by using saveMessage acction
        dispatch(saveMessage(conversation))
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
      for (let content of response.data.fulfillmentMessages) {
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
                <RobotOutlined style={{ display: 'inline-block', verticalAlign: 'middle', fontSize: '20px', color: 'black' }} />
                : <SmileOutlined style={{ display: 'inline-block', verticalAlign: 'middle', fontSize: '20px', color: 'black' }} />
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
    <div style={{
      height: 700, width: 700,
      border: '3px solid black', borderRadius: '7px'
    }}>
      <div style={{ height: 644, width: '100%', overflow: 'auto' }}>
        {renderMessages(messageFormRedux)}
      </div>


      <input
        style={{
          margin: 0, width: '100%', height: 50,
          borderRadius: '4px', padding: '5px', fontSize: '1rem'
        }}
        placeholder="Send a message..."
        onKeyPress={keyPressHandler}
        type="text"
      />
    </div>
  );
}

export default Chatbot;