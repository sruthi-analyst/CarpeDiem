import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import yahooFinance from "yahoo-finance2";
import fs from "fs";
import multer from "multer";
import FormData from "form-data";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const PORT = process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// --- Finance Topic Description ---
const financeTopicDescription = `
I answer only finance-related questions such as: budgeting, investments, tax planning, loans, credit, banking, stock market, savings, retirement planning, insurance, mutual funds, inflation, portfolio management.
`;

// --- WebSocket handlers for Real-time Granite interaction ---
io.on('connection', (socket) => {
    console.log('✅ Client connected to WebSocket');

    socket.on('generate', async (data) => {
        try {
            const response = await fetch(process.env.IBM_MODEL_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.IBM_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: data.prompt,
                    max_tokens: 200
                })
            });

            const result = await response.json();
            socket.emit('result', result);
        } catch (error) {
            console.error('❌ WebSocket Error:', error);
            socket.emit('error', 'Failed to get response from Granite model');
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected from WebSocket');
    });
});

// --- Translation & Language Detection ---
async function detectLanguage(text) {
  const res = await fetch("https://libretranslate.com/detect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text }),
  });
  const data = await res.json();
  return data?.[0]?.language || "en";
}

async function translateText(text, targetLang = "en", sourceLang = "auto") {
  const res = await fetch("https://libretranslate.com/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: sourceLang,
      target: targetLang,
      format: "text",
    }),
  });
  const data = await res.json();
  return data.translatedText;
}

// --- Helper: Get embeddings from Ollama ---
async function getEmbedding(text) {
  try {
    const response = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "granite3.3:2b", prompt: text }),
    });

    const data = await response.json();

    if (Array.isArray(data.embedding)) return data.embedding;
    if (Array.isArray(data[0]?.embedding)) return data[0].embedding;
    if (Array.isArray(data.data?.[0]?.embedding)) return data.data[0].embedding;

    throw new Error("No valid embedding array in Ollama response");
  } catch (err) {
    console.error("❌ getEmbedding error:", err.message);
    return null;
  }
}


// --- Cosine similarity ---
function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
    return 0;
  }
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

let financeEmbedding;
(async () => {
  financeEmbedding = await getEmbedding(financeTopicDescription);
  if (financeEmbedding) {
    console.log("✅ Finance topic embedding loaded");
  } else {
    console.error("❌ Failed to load finance topic embedding (is Ollama running?)");
  }
})();

// --- AI Helper: Upgraded to OpenAI (ChatGPT) Integration ---
async function callAI(prompt, model = "gpt-4o-mini") {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) throw new Error("OpenAI Key missing");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      }),
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    return data.choices?.[0]?.message?.content || "No response from OpenAI.";
  } catch (err) {
    console.warn("⚠️ OpenAI failed. Using internal fallback.", err.message);
    // Simulated internal brain for critical paths
    if (prompt.toLowerCase().includes("budget")) return "For budgeting, I recommend the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.";
    if (prompt.toLowerCase().includes("policies")) return JSON.stringify([
      { name: "Pradhan Mantri Suraksha Bima Yojana", eligibility: "18-70 years", benefits: "₹2 Lakh accidental death cover", official_link: "https://www.jansuraksha.gov.in/" },
      { name: "Post Office Savings", eligibility: "Any Indian citizen", benefits: "High interest secure deposits", official_link: "https://www.indiapost.gov.in/" }
    ]);
    return "I am having trouble reaching the OpenAI servers. Please check your internet or API key limits.";
  }
}

// ---- AI Finance Chat API with Language Support ----
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, model, lang } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    let detectedLang = lang || (await detectLanguage(prompt).catch(() => "en"));

    const promptInEnglish =
      detectedLang === "en"
        ? prompt
        : await translateText(prompt, "en", detectedLang).catch(() => prompt);

    const promptEmbedding = await getEmbedding(promptInEnglish);
    
    // Similarity check metric (Log only, no blocking)
    if (promptEmbedding && financeEmbedding) {
      const similarity = cosineSimilarity(financeEmbedding, promptEmbedding);
      console.log(`🔍 Similarity Score: ${similarity.toFixed(3)} (Passed through to Ollama)`);
    }



    // Call Ollama directly for the chatbot sidebar (no OpenAI key)
    let aiResponse;
    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model || "granite3.3:2b",
          prompt: `You are a helpful financial assistant. Answer this: ${promptInEnglish}`,
          stream: false,
        }),
      });
      const data = await response.json();
      if (!data.response) throw new Error("Empty response");
      aiResponse = data.response;
    } catch (err) {
      console.warn("⚠️ Ollama offline. Chatbot falling back to basic answers.", err.message);
      if (promptInEnglish.toLowerCase().includes("budget")) aiResponse = "For budgeting, I recommend the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.";
      else if (promptInEnglish.toLowerCase().includes("invest")) aiResponse = "A diversified portfolio of low-cost index funds is often a safe long-term investment strategy.";
      else aiResponse = "I'm currently in basic mode because my local AI (Ollama) is offline and OpenAI is disabled for chat. I can still help with general finance topics!";
    }

    if (detectedLang !== "en") {
      aiResponse = await translateText(aiResponse, detectedLang, "en").catch(() => aiResponse);
    }

    res.json({ response: aiResponse, detectedLang });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: "Chat service error" });
  }
});


// ---- Policies API (Relocated from Frontend to avoid Quota issues) ----
app.post("/api/policies", async (req, res) => {
  try {
    const { city, age } = req.body;
    const prompt = `Give 3 government schemes and insurance policies for city "${city}" and age ${age} in JSON format ONLY: [{"name":"...","eligibility":"...","benefits":"...","official_link":"..."}]`;
    const response = await callAI(prompt);
    
    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch {
      const match = response.match(/\[.*\]/s);
      parsed = match ? JSON.parse(match[0]) : [];
    }
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch policies" });
  }
});

// ---- Voice Chat with ChatGPT ----
app.post("/api/voice-to-text", upload.single("audio"), async (req, res) => {
  try {
    if (!OPENAI_API_KEY || OPENAI_API_KEY.includes("sk-proj-EKB")) {
        return res.status(403).json({ error: "Invalid or expired OpenAI Key. Please update .env" });
    }
    const audioFile = fs.createReadStream(req.file.path);

    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("model", "whisper-1");

    const sttResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const sttResult = await sttResponse.json();
    fs.unlinkSync(req.file.path);

    if (!sttResult.text) {
      return res.status(500).json({ error: "Failed to transcribe audio" });
    }

    const transcribedText = sttResult.text.trim();
    const detectedLang = await detectLanguage(transcribedText).catch(() => "en");

    const inputForGPT =
      detectedLang === "en"
        ? transcribedText
        : await translateText(transcribedText, "en", detectedLang).catch(() => transcribedText);

    const chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant. Reply in the same language as the user." },
          { role: "user", content: inputForGPT }
        ],
      }),
    });

    const chatData = await chatResponse.json();
    let aiReply = chatData.choices?.[0]?.message?.content || "No response from ChatGPT.";

    if (detectedLang !== "en") {
      aiReply = await translateText(aiReply, detectedLang, "en").catch(() => aiReply);
    }

    res.json({ transcribedText, detectedLang, aiResponse: aiReply });
  } catch (err) {
    console.error("Voice Chat Error:", err);
    res.status(500).json({ error: "Voice chat handling failed" });
  }
});

// ---- Text to Voice (TTS) ----
app.post("/api/text-to-voice", async (req, res) => {
  try {
    const { text, lang } = req.body;

    let voiceModel = "gpt-4o-mini-tts";
    let voiceName = "alloy";
    if (lang === "ta") voiceName = "verse";
    if (lang === "hi") voiceName = "suno";

    const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: voiceName,
        input: text
      }),
    });

    if (!ttsResponse.ok) {
      throw new Error(`OpenAI TTS Error: ${ttsResponse.statusText}`);
    }

    const arrayBuffer = await ttsResponse.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("TTS Error:", err.message);
    res.status(500).json({ error: "Text-to-voice failed" });
  }
});


// ---- Stock Analyzer (Powered by Finnhub Live API) ----
app.get("/api/stock/:symbol", async (req, res) => {
  const inputSymbol = req.params.symbol.toUpperCase();
  console.log(`🔍 Stock Search Request via Finnhub: ${inputSymbol}`);
  
  try {
    const finhubKey = process.env.FINHUB_API_KEY;
    if (!finhubKey) throw new Error("Finnhub Key missing");

    // Finnhub expects Indian symbols as RELIANCE.NS, but it provides limited free tier access for non-US stocks. 
    // We will attempt the lookup gracefully.
    let searchSymbol = inputSymbol;
    if (!inputSymbol.includes(".") && ["RELIANCE", "TATAMOTORS", "TCS", "INFY"].includes(inputSymbol)) {
        searchSymbol = `${inputSymbol}.NS`;
    }

    // 1. Fetch live quotes
    const quoteRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${searchSymbol}&token=${finhubKey}`);
    const quoteData = await quoteRes.json();

    // 2. Fetch company profile
    const profileRes = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${searchSymbol}&token=${finhubKey}`);
    const profileData = await profileRes.json();

    // If Finnhub returns 0 for current price, the symbol is invalid or unsupported in the Free tier.
    if (!quoteData || quoteData.c === 0) {
      console.log(`🚫 Finnhub could not resolve ${searchSymbol}. Providing safe fallback.`);
      throw new Error(`Symbol ${searchSymbol} not found in Finnhub Free Tier.`);
    }

    console.log(`✅ Finnhub Data Found: ${profileData.name || searchSymbol} (${searchSymbol})`);

    // 3. Fetch past 30 days history. Finnhub uses UNIX timestamps.
    const toTimestamp = Math.floor(Date.now() / 1000);
    const fromTimestamp = toTimestamp - (30 * 24 * 60 * 60);
    const candleRes = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${searchSymbol}&resolution=D&from=${fromTimestamp}&to=${toTimestamp}&token=${finhubKey}`);
    const candleData = await candleRes.json();

    let history = [];
    if (candleData && candleData.s === "ok") {
        history = candleData.t.map((timestamp, index) => ({
            date: new Date(timestamp * 1000).toISOString(),
            close: candleData.c[index]
        }));
    }

    return res.json({
      symbol: searchSymbol,
      shortName: profileData.name || searchSymbol,
      currentPrice: quoteData.c,
      changePercent: quoteData.dp,
      marketCap: profileData.marketCapitalization ? (profileData.marketCapitalization * 1000000) : "N/A",
      currency: profileData.currency || "USD",
      dayHigh: quoteData.h,
      dayLow: quoteData.l,
      peRatio: "N/A",
      dividendYield: "N/A", 
      targetMeanPrice: "N/A",
      recommendation: quoteData.dp > 0 ? "buy" : "hold",
      history: history.length > 0 ? history : Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        close: quoteData.c + Math.random() * 10 - 5
      })),
      isOffline: false
    });

  } catch (err) {
    console.warn(`⚠️ Using Simulated Mock Data for ${inputSymbol}:`, err.message);
    
    return res.json({
      symbol: inputSymbol,
      shortName: `${inputSymbol} (Offline Mode)`,
      currentPrice: 150.00,
      changePercent: 0.00,
      marketCap: "N/A",
      currency: "USD",
      dayHigh: 155.00,
      dayLow: 145.00,
      peRatio: 20.0,
      dividendYield: "1.50",
      targetMeanPrice: 160.00,
      recommendation: "hold",
      history: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        close: 145 + Math.random() * 10
      })).reverse(),
      isOffline: true
    });
  }
});

// ---- Latest Stock Market & Company News ----
app.get("/api/market-news", async (req, res) => {
  try {
    const finhubKey = process.env.FINHUB_API_KEY;
    if (!finhubKey) throw new Error("Finnhub Key missing");
    
    const { symbol } = req.query;
    let url = `https://finnhub.io/api/v1/news?category=general&token=${finhubKey}`;
    
    if (symbol) {
      let searchSymbol = symbol.toUpperCase();
      if (!searchSymbol.includes(".") && ["RELIANCE", "TATAMOTORS", "TCS", "INFY"].includes(searchSymbol)) {
          searchSymbol = `${searchSymbol}.NS`;
      }
      const toTimestamp = new Date().toISOString().split('T')[0];
      const fromTimestamp = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
      url = `https://finnhub.io/api/v1/company-news?symbol=${searchSymbol}&from=${fromTimestamp}&to=${toTimestamp}&token=${finhubKey}`;
    }

    const newsRes = await fetch(url);
    const newsData = await newsRes.json();
    return res.json(newsData);
  } catch (err) {
    console.warn("⚠️ Error fetching news:", err.message);
    return res.status(500).json({ error: "Failed to fetch news" });
  }
});

// ---- Stock Trend Predictor (Simple ML - Linear Regression) ----
app.get("/api/stock-predict/:symbol", async (req, res) => {
  const inputSymbol = req.params.symbol.toUpperCase();
  try {
    const finhubKey = process.env.FINHUB_API_KEY;
    if (!finhubKey) throw new Error("Finnhub Key missing");

    let searchSymbol = inputSymbol;
    if (!inputSymbol.includes(".") && ["RELIANCE", "TATAMOTORS", "TCS", "INFY"].includes(inputSymbol)) {
        searchSymbol = `${inputSymbol}.NS`;
    }

    // Fetch past 60 days history for training data
    const toTimestamp = Math.floor(Date.now() / 1000);
    const fromTimestamp = toTimestamp - (60 * 24 * 60 * 60);
    const candleRes = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${searchSymbol}&resolution=D&from=${fromTimestamp}&to=${toTimestamp}&token=${finhubKey}`);
    const candleData = await candleRes.json();

    if (!candleData || candleData.s !== "ok") {
      throw new Error("Could not fetch historical data for prediction.");
    }

    const prices = candleData.c;
    const n = prices.length;
    
    // Simple Linear Regression: y = mx + b
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += prices[i];
        sumXY += (i * prices[i]);
        sumX2 += (i * i);
    }
    
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    // Moving average prediction
    const windowSize = 5;
    const recentPrices = prices.slice(-windowSize);
    const movingAverage = recentPrices.reduce((a, b) => a + b, 0) / windowSize;

    // Predict next 5 days combining ML (Linear Regression) and recent moving average bias
    const predictions = [];
    for (let i = 1; i <= 5; i++) {
        let lrPrediction = m * (n + i - 1) + b;
        // Blend linear regression with moving average to dampen extreme slopes
        let blendedPrediction = (lrPrediction * 0.7) + (movingAverage * 0.3); 
        predictions.push({
            day: i,
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            predictedPrice: blendedPrediction
        });
    }

    const trend = m > 0 ? "Bullish (Upward)" : "Bearish (Downward)";

    return res.json({
        symbol: searchSymbol,
        trend,
        slope: m,
        currentPrice: prices[n-1],
        predictions
    });

  } catch (err) {
    console.warn(`⚠️ Prediction error for ${inputSymbol}:`, err.message);
    
    // Fallback simulation
    const currentPrice = 150 + Math.random() * 50;
    const mockM = Math.random() * 2 - 1; // random slope between -1 and 1
    const predictions = [];
    for(let i=1; i<=5; i++) {
      predictions.push({
        day: i,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        predictedPrice: currentPrice + (mockM * i)
      });
    }
    
    return res.json({
      symbol: inputSymbol,
      trend: mockM > 0 ? "Bullish (Upward) - Mock" : "Bearish (Downward) - Mock",
      slope: mockM,
      currentPrice,
      predictions,
      isMock: true
    });
  }
});

app.get("/api/fetch-upi", (req, res) => {
  const mockUPI = [
    { desc: "Zomato Fresh Order", amount: 450, date: new Date().toISOString().split("T")[0] },
    { desc: "Monthly Rent Payment", amount: 15000, date: new Date().toISOString().split("T")[0] },
    { desc: "Electricity Bill", amount: 1200, date: new Date().toISOString().split("T")[0] },
    { desc: "Milk Basket Subscription", amount: 800, date: new Date().toISOString().split("T")[0] },
    { desc: "Sip Weekly Contribution", amount: 1000, date: new Date().toISOString().split("T")[0] }
  ];
  res.json(mockUPI);
});

server.listen(PORT, () => {
  console.log(`✅ Unified Backend running on http://localhost:${PORT}`);
});
