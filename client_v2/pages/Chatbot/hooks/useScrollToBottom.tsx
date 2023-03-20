import { useCallback } from "react";
import styles from "../../../styles/Chatbot.module.css";

const useScrollToBottom = (messages: any[]) => {
  const scrollToBottom = useCallback(() => {
    const messageContainer = document.querySelector(`.${styles.messageContainerDimmed}`);
    if (messageContainer) {
      messageContainer.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        messageContainer.classList.remove(styles.messageContainerDimmed);
      }, 500);
    }
  }, [messages]);

  return scrollToBottom;
};

export default useScrollToBottom;
