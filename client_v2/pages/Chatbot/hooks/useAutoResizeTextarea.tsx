import React, { useEffect } from "react";

const useAutoResizeTextarea = (
  transcript: string,
  textareaRef: React.RefObject<HTMLTextAreaElement>
) => {
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [transcript]);
};

export default useAutoResizeTextarea;
