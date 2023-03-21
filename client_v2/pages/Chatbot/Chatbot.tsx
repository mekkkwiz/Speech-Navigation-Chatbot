import React, { useState, useEffect, useRef, useCallback } from "react";
import Axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { saveMessage } from "../../redux/_actions/message_actions";
import RenderOneMessage from "./Sections/RenderOneMessage";
import { List, Avatar } from "antd";
import {
  RobotOutlined,
  SmileOutlined,
  SoundOutlined,
  StopOutlined,
} from "@ant-design/icons";
import styles from "../../styles/Chatbot.module.css";
import useSpeechRecognition from "./hooks/useSpeechRecognition";
import useScrollToBottom from "./hooks/useScrollToBottom";
import useAutoResizeTextarea from "./hooks/useAutoResizeTextarea";

interface RootState {
  messages: {
    messages: Conversation[];
  };
}

interface Conversation {
  who: "user" | "bot";
  content: any;
}

function Chatbot() {
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.messages.messages);

  const [transcript, setTranscript] = useState<string>("");
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, toggleListening } =
    useSpeechRecognition(setTranscript, messageContainerRef);
  const scrollToBottom = useScrollToBottom(messages);
  useAutoResizeTextarea(transcript, textareaRef);

  useEffect(() => {
    scrollToBottom();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(event.target.value);
  };

  const textQuery = useCallback(async (text: string) => {
    let conversation: Conversation = {
      who: "user",
      content: {
        text: {
          text: text,
        },
      },
    };
    dispatch(saveMessage(conversation));
    console.log("text i send", conversation);

    const textQueryVariables = {
      text,
    };
    try {
      const response = await Axios.post(
        "http://localhost:5000/api/dialogflow/textQuery",
        textQueryVariables
      );
      console.log("textQuery response", response);

      const audioRes = response.data.audioResponse;

      for (let content of response.data.textResponse.fulfillmentMessages) {
        let conversation: Conversation = {
          who: "bot",
          content: content,
        };
        dispatch(saveMessage(conversation));
        if (audioRes) {
          let audio = new Audio("data:audio/wav;base64," + audioRes);
          audio.play();
        }
      }
    } catch (error) {
      conversation = {
        who: "bot",
        content: {
          text: {
            text: "มีข้อผิดพลาดเกิดขึ้น โปรดตรวจสอบปัญหา",
          },
        },
      };
      dispatch(saveMessage(conversation));
    }
  }, [dispatch]);

  const keyPressHandler = useCallback((e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!transcript) {
        return alert("คุณต้องพิมพ์บางอย่างก่อนที่จะส่งข้อความ");
      }
      setTranscript("");
      textQuery(transcript);
    }
  }, [textQuery, transcript]);

  useEffect(() => {
    window.addEventListener("keypress", keyPressHandler);
    return () => {
      window.removeEventListener("keypress", keyPressHandler);
    };
  }, [keyPressHandler]);

  const renderMessages = (returnedMessages: Conversation[]) => {
    if (returnedMessages) {
      return (
        <List
          dataSource={returnedMessages}
          renderItem={(message, i) => {
            if (
              message.content &&
              message.content.text &&
              message.content.text.text
            ) {
              return (
                <RenderOneMessage
                  key={i}
                  who={message.who}
                  text={message.content.text.text}
                />
              );
            } else if (
              message.content &&
              message.content.payload.fields.video_url
            ) {
              const AvatarSrc =
                message.who === "bot" ? (
                  <RobotOutlined className="inline-block align-middle text-black text-xl" />
                ) : (
                  <SmileOutlined className="inline-block align-middle text-black text-xl" />
                );
              return (
                <List.Item style={{ padding: "1rem" }}>
                  <List.Item.Meta
                    avatar={<Avatar icon={AvatarSrc} />}
                    title={message.who}
                    description={
                      <video controls width="700" autoPlay={true} loop={true}>
                        <source
                          src={
                            message.content.payload.fields.video_url.stringValue
                          }
                          type="video/mp4"
                        />
                      </video>
                    }
                  />
                </List.Item>
              );
            } else if (
              message.content &&
              message.content.payload.fields.imageUrl
            ) {
              const AvatarSrc =
                message.who === "bot" ? (
                  <RobotOutlined className="inline-block align-middle text-black text-xl" />
                ) : (
                  <SmileOutlined className="inline-block align-middle text-black text-xl" />
                );
              return (
                <List.Item style={{ padding: "1rem" }}>
                  <List.Item.Meta
                    avatar={<Avatar icon={AvatarSrc} />}
                    title={message.who}
                    description={
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          message.content.payload.fields.imageUrl.stringValue
                        }
                        alt="QR code"
                        width={400}
                        height={400}
                      />
                    }
                  />
                </List.Item>
              );
            }
          }}
        />
      );
    } else {
      return null;
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [transcript]);

  useEffect(() => {
    if (!isListening) {
      textareaRef.current?.focus();
    }
  }, [isListening]);

  return (
    <div className="h-[80vh] w-full border rounded-[7px] border-black flex flex-col justify-between">
      {isListening && <div className={styles.listening}> listening...</div>}
      <div
        className={`h-[calc(80vh - 50px)] w-full overflow-auto p-2 md:p-4`}
        ref={messageContainerRef}
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        {renderMessages(messages)}
      </div>
      <div className="flex items-center bg-gray-100 rounded-[4px] p-[5px]">
        <textarea
          ref={textareaRef}
          className="m-0 flex-1 rounded-[4px] text-base outline-none auto-h p-2"
          value={transcript}
          onChange={handleInputChange}
          rows={1}
          placeholder="คุณสามารถพิมพ์ข้อความที่นี่หรือกดไอคอนไมค์เพื่อพูด..."
        />
        <button
          className="bg-gray-200 rounded-[4px] p-[5px] ml-[5px] w-10 py-2"
          onClick={toggleListening}
        >
          {isListening ? (
            <StopOutlined className="inline-block align-middle" />
          ) : (
            <SoundOutlined className="inline-block align-middle" />
          )}
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
