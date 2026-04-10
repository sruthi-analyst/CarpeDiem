import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, Volume2 } from "lucide-react";

export default function ChatbotSideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I'm your AI financial assistant. I can help you with budgeting, investments, tax planning, and more." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);

  // --- Speech to Text ---
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang || "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (err) => {
      console.error("Speech Recognition Error:", err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // --- Text to Speech ---
  const speakText = (text) => {
    if (!("speechSynthesis" in window)) {
      alert("Your browser does not support Text-to-Speech.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang || "en-US";
    speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, lang: selectedLang })
      });

      const data = await res.json();

      const botMsg = data.response || "No response from AI.";
      setMessages((prev) => [...prev, { sender: "bot", text: botMsg }]);
      speakText(botMsg); // Speak bot's reply
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠ Error: Could not reach AI server." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          initial={{ x: 0 }}
          animate={{ x: 10 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1.2,
            ease: "easeInOut",
          }}
          className="fixed top-1/2 right-0 transform -translate-y-1/2 bg-[#4b2e23] hover:bg-[#7b2e23] text-black px-3 py-2 rounded-l-full shadow-lg z-50 flex items-center justify-center text-2xl"
          style={{
            writingMode: "vertical-lr",
            borderTopLeftRadius: "50px",
            borderBottomLeftRadius: "50px",
          }}
        >
          👋
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 w-96 h-full bg-white shadow-xl border-l border-gray-200 flex flex-col z-50"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-[#4b2e23] text-white gap-2">
              <h2 className="text-lg font-semibold">Carpe Diem AI</h2>
              <button onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg max-w-[80%] whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-[#4b2e23] text-white ml-auto"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {msg.text}
                  {msg.sender === "bot" && (
                    <button
                      className="ml-2 text-gray-500 hover:text-black"
                      onClick={() => speakText(msg.text)}
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              {loading && (
                <div className="text-gray-500 text-sm italic">
                  {selectedLang !== "en" ? "Thinking & translating..." : "Thinking..."}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t flex gap-2 items-center">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-2 rounded-full ${
                  isListening ? "bg-red-500 text-white" : "bg-gray-200"
                }`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me about your finances..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={sendMessage}
                className="bg-[#4b2e23] text-white px-4 py-2 rounded-lg"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
