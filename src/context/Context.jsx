import { createContext, useState, useEffect } from "react";
import run from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const savedChats = localStorage.getItem("savedChats");
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChatHistory(parsedChats);
      setPrevPrompts(
        parsedChats.map((chat) => ({ id: chat.id, prompt: chat.prompt }))
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("savedChats", JSON.stringify(chatHistory));
  }, [chatHistory]);

  const delayPara = (index, nextWord) => {
    setTimeout(function () {
      setResultData((prev) => prev + nextWord);
    }, 75 * index);
  };

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
    setResultData("");
    setRecentPrompt("");
  };

  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);
    let response;
    let currentPrompt = prompt || input;
    const currentId = Date.now().toString();

    // Always generate a new response
    response = await run(currentPrompt);
    setRecentPrompt(currentPrompt);

    let newResponse = "";
    let responseArray = response.split("**");

    for (let i = 0; i < responseArray.length; i++) {
      if (i === 0 || i % 2 === 0) {
        newResponse += responseArray[i];
      } else {
        newResponse += "<b>" + responseArray[i] + "</b>";
      }
    }

    let newResponseWithBreaks = newResponse.split("*").join("<br />");
    let newResponseArray = newResponseWithBreaks.split(" ");

    for (let i = 0; i < newResponseArray.length; i++) {
      const nextWord = newResponseArray[i];
      delayPara(i, nextWord + " ");
    }

    const newChat = {
      id: currentId,
      prompt: currentPrompt,
      response: newResponseWithBreaks,
    };
    setChatHistory((prev) => [newChat, ...prev]);
    setPrevPrompts((prev) => [
      { id: currentId, prompt: currentPrompt },
      ...prev,
    ]);

    setLoading(false);
    setInput("");
  };

  const loadChat = (id) => {
    const chat = chatHistory.find((chat) => chat.id === id);
    if (chat) {
      setRecentPrompt(chat.prompt);
      setResultData(chat.response);
      setShowResult(true);
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
    newChat,
    loadChat,
    chatHistory,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
