import React, { useEffect, useRef, useState } from "react";
import styles from "../../../styles/Chatbot.module.css";

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    webkitSpeechRecognition: any;
  }
}


const useSpeechRecognition = (
  setTranscript: React.Dispatch<React.SetStateAction<string>>,
  messageContainerRef: React.RefObject<HTMLDivElement>
) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "th-TH";
    recognitionRef.current = recognition;

    recognition.addEventListener("result", handleSpeechResult);

    return () => {
      recognition.removeEventListener("result", handleSpeechResult);
    };
  }, []);

  const handleSpeechResult = (event: any) => {
    const transcript = Array.from(event.results)
      .map((result: any) => result[0].transcript)
      .join("");
    setTranscript(transcript);
    clearTimeout(recognitionRef.current.timeoutId);
    recognitionRef.current.timeoutId = setTimeout(() => {
      recognitionRef.current.stop();
      if (messageContainerRef.current) {
        messageContainerRef.current.classList.remove(
          styles.dimmed,
          styles.active
        );
        messageContainerRef.current.classList.add(styles.leave);
        setIsListening(false);
      }
    }, 1200);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      if (messageContainerRef.current) {
        messageContainerRef.current.classList.remove(
          styles.dimmed,
          styles.active
        );
        messageContainerRef.current.classList.add(styles.leave);
      }
    } else {
      recognitionRef.current.start();
      if (messageContainerRef.current) {
        messageContainerRef.current.classList.add(styles.dimmed, styles.active);
        messageContainerRef.current.classList.remove(styles.leave);
      }
    }
    setIsListening((prevIsListening) => !prevIsListening);
  };

  return { isListening, recognitionRef, handleSpeechResult, toggleListening };
};

export default useSpeechRecognition;
