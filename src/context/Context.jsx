import { createContext, useState, useCallback } from "react";
import run from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  const delayPara = useCallback((index, nextWord) => {
    setTimeout(() => {
      setResultData((prev) => prev + nextWord);
    }, 75 * index);
  }, []);

  const formatMarkdown = (text) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const italicRegex = /\*(.*?)\*/g;
    const bulletRegex = /^\s*[-*]\s/gm;

    return text
      .replace(boldRegex, "<b>$1</b>")
      .replace(italicRegex, "<i>$1</i>")
      .replace(bulletRegex, "• ")
      .split("\n")
      .join("<br />");
  };

  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);
    setRecentPrompt(input);

    try {
      const response = await run(input);
      const formattedResponse = formatMarkdown(response);

      const words = formattedResponse.split(" ");
      words.forEach((word, index) => {
        delayPara(index, word + " ");
      });

      setPrevPrompts((prev) => [...prev, input]);
    } catch (error) {
      console.error("Error processing response:", error);
      setResultData("An error occurred while processing your request.");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
