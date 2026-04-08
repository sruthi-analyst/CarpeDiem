import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Saving from "./pages/Saving";
import PricingPage from "./pages/Pricing";
import TaxAndReminder from "./pages/TaxAndReminder";
import ChatbotSidebar from "./components/ChatbotSidebar";
import { ScrollToTop } from "./components/ScrollToTop";
import StockAnalysis from "./pages/StockAnalysis";
import ShowPolicy from "./pages/ShowPolicy";

function AppContent() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      {/* Show Navbar only if NOT on home page */}
      {location.pathname !== "/" && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/saving" element={<Saving />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/tax" element={<TaxAndReminder />} />
        <Route path="/stock" element={<StockAnalysis />} />
        <Route path="/policy" element={<ShowPolicy />} />
      </Routes>

      <ChatbotSidebar />
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
