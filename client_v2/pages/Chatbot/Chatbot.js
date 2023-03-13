import React, { useState, useEffect, useRef } from "react";
import Axios from 'axios';
import { useDispatch, useSelector } from "react-redux";
import { saveMessage } from '../../redux/_actions/message_actions'
import RenderOneMessage from './Sections/RenderOneMessage';
import { List, Avatar } from 'antd';
import { RobotOutlined, SmileOutlined, SoundOutlined, StopOutlined } from '@ant-design/icons'

function Chatbot() {
  const dispatch = useDispatch()
  const messageFormRedux = useSelector((state) => state.messages.messages)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize speech recognition and add event listeners
  useEffect(() => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "th-TH";
    recognitionRef.current = recognition;

    recognition.addEventListener("result", handleSpeechResult);

    return () => {
      recognition.removeEventListener("result", handleSpeechResult);
    };
  }, []);

  const handleSpeechResult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    console.log("Transcript: ", transcript);
    // Stop speech recognition after a 2-second pause in speech
    clearTimeout(recognitionRef.current.timeoutId);
    recognitionRef.current.timeoutId = setTimeout(() => {
      recognitionRef.current.stop();
      setIsListening(false);
    }, 1200);
    // textQuery(transcript);
    // Fill the text input with the transcript
    const input = document.querySelector('input[type="text"]');
    if (input) {
      input.value = transcript;
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(prevIsListening => !prevIsListening);
  };

  const textQuery = async (text) => {
    let conversation = {
      who: 'user',
      content: {
        text: {
          text: text
        }
      }
    }
    dispatch(saveMessage(conversation))
    console.log("text i send", conversation)

    const textQueryVariables = {
      text
    }
    try {
      const response = await Axios.post('http://localhost:5000/api/dialogflow/textQuery', textQueryVariables)
      console.log("textQuery response", response)

      const audioRes = response.data.audioResponse;

      for (let content of response.data.textResponse.fulfillmentMessages) {
        let conversation = {
          who: 'bot',
          content: content
        }
        dispatch(saveMessage(conversation))
        if (audioRes) {
          let audio = new Audio('data:audio/wav;base64,' + audioRes);
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
      dispatch(saveMessage(conversation))
    }
  }

  const keyPressHandler = (e) => {
    if (e.key === "Enter") {
      if (!e.target.value) {
        return alert('You need to type something first');
      }
      textQuery(e.target.value)
      e.target.value = "";
    }
  }

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
              return (
                <List.Item style={{ padding: '1rem' }}>
                  <List.Item.Meta
                    avatar={<Avatar icon={AvatarSrc} />}
                    title={message.who}
                    description={
                      <video controls width="500" autoPlay={true} loop={true}>
                        <source src={message.content.payload.fields.video_url.stringValue} type="video/mp4" />
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
    <div className="h-[80vh] w-full border rounded-[7px] border-black flex flex-col justify-between">
      <div className="h-[calc(80vh - 50px)] w-full overflow-auto p-2 md:p-4">
        {renderMessages(messageFormRedux)}
      </div>
      <div className="flex items-center bg-gray-100 rounded-[4px] p-[5px]">
        <input
          className="m-0 flex-1 rounded-[4px] text-base outline-none"
          placeholder="Send a message..."
          onKeyPress={keyPressHandler}
          type="text"
        />
        <button className="bg-gray-200 rounded-[4px] p-[5px] ml-[5px] w-10"
          onClick={toggleListening}>
          {isListening ? <StopOutlined className="inline-block align-middle" /> : <SoundOutlined className="inline-block align-middle" />}
        </button>
      </div>
    </div>

  );
}

export default Chatbot;
