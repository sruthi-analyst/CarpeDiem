import { useRef } from "react";
import { motion } from "framer-motion";
import Features from "../components/Features";
import CTA from "../components/CTA";
import ContactUs from "../components/ContactUs";
import Navbar from "../components/Navbar";

export default function Home() {
  // Section refs
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Variants for stagger animation inside the phone
  const chatContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.3 } },
  };

  const chatItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      {/* Pass scroll handlers to Navbar */}
      <Navbar
        onFeaturesClick={() => scrollToSection(featuresRef)}
        onAboutClick={() => scrollToSection(aboutRef)}
        onContactClick={() => scrollToSection(contactRef)}
      />

      <div className="bg-[#fdf6f0] min-h-screen overflow-hidden">
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center justify-between px-8 lg:px-32 pt-10">
          {/* Left Content Animation */}
          <motion.div
            className="max-w-lg"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1 mb-4 rounded-full bg-white border text-md">
              ✨ Introducing Carpe Diem
            </span>
            <h1 className="text-6xl font-bold text-[#4b2e23] leading-tight">
              Your AI-powered personal finance assistant
            </h1>
            <p className="text-gray-700 mt-4">
              Intelligent guidance for savings, taxes, and investments with complete privacy protection
            </p>

            <div className="mt-6 flex gap-4">
              <button className="bg-[#4b2e23] text-white px-6 py-3 rounded-full">
                Get Started Free
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                100% Private
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                AI Powered
              </span>
            </div>
          </motion.div>

          {/* Phone Mockup Animation */}
          <motion.div
            className="mt-12 lg:mt-0"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-80 h-[600px] bg-black rounded-[2.5rem] p-1 shadow-xl border-3 border-black">
              {/* Notch */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-black w-24 h-5 rounded-full z-10"></div>

              {/* Screen */}
              <div className="bg-white w-full h-full rounded-[2rem] flex flex-col">
                {/* Status Bar */}
                <div className="flex justify-between items-center text-black text-xs px-5 pt-2 pb-1">
                  <span className="font-semibold">9:41</span>
                  <div className="flex items-center gap-1">
                    {/* Wi-Fi Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1l22 22M2 7c5.523-5.523 14.477-5.523 20 0M6.343 11.657c3.905-3.905 10.243-3.905 14.148 0M10.586 16.243a5 5 0 016.828 0" />
                    </svg>
                    {/* Battery Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16 7H4a2 2 0 00-2 2v2a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2zm-1 5H5V8h10v4z" />
                    </svg>
                  </div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#4b2e23] text-white font-bold w-8 h-8 rounded-full flex items-center justify-center text-xs">CD</div>
                    <div>
                      <p className="text-sm font-semibold">Carpe Diem</p>
                      <p className="text-xs text-gray-500">Your AI Assistant</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>

                {/* Chat Messages */}
                <motion.div
                  className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3"
                  variants={chatContainer}
                  initial="hidden"
                  animate="show"
                >
                  {[
                    { type: "bot", text: "I noticed you saved $150 this month! Should I move it to your emergency fund?", img: "https://cdn-icons-png.flaticon.com/512/4712/4712100.png" },
                    { type: "user", text: "Yes, please!", img: "https://cdn-icons-png.flaticon.com/512/847/847969.png" },
                    { type: "bot", text: "Done! You're now $150 closer to your financial goals. Keep up the great work!", img: "https://cdn-icons-png.flaticon.com/512/4712/4712100.png" },
                    { type: "user", text: "Thanks, Carpe Diem!", img: "https://cdn-icons-png.flaticon.com/512/847/847969.png" },
                    { type: "bot", text: "Seize the day! 🌟", img: "https://cdn-icons-png.flaticon.com/512/4712/4712100.png" },
                  ].map((msg, idx) => (
                    <motion.div
                      key={idx}
                      variants={chatItem}
                      className={`flex items-start gap-2 max-w-[80%] ${msg.type === "user" ? "self-end flex-row-reverse" : "self-start"}`}
                    >
                      <img src={msg.img} alt="Avatar" className="w-8 h-8 rounded-full" />
                      <div className={`p-3 rounded-lg text-sm ${msg.type === "user" ? "bg-[#4b2e23] text-white" : "bg-gray-100"}`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Input Bar */}
                <div className="p-3 border-t flex gap-2">
                  <input
                    className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none"
                    placeholder="Ask me anything..."
                  />
                  <button className="bg-[#4b2e23] text-white px-4 py-2 rounded-full">Send</button>
                </div>

                {/* Bottom Icons */}
                <div className="flex justify-around py-2 border-t text-xs">
                  <button className="flex flex-col items-center text-gray-500">📊 <span>Budget</span></button>
                  <button className="flex flex-col items-center text-[#4b2e23] font-semibold">💬 <span>Chat</span></button>
                  <button className="flex flex-col items-center text-gray-500">💾 <span>Save</span></button>
                  <button className="flex flex-col items-center text-gray-500">📈 <span>Invest</span></button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Sections with refs */}
      <section ref={featuresRef}><Features /></section>
      <section ref={aboutRef}><CTA /></section>
      <section ref={contactRef}><ContactUs /></section>
    </>
  );
}