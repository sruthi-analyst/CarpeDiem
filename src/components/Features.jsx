import { useNavigate } from "react-router-dom";
import {
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ShieldCheckIcon // Insurance icon
} from "@heroicons/react/24/solid";

export default function Features() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Tax & Reminders",
      desc: "Stay on top of your tax deadlines with timely alerts and due date notifications.",
      icon: <CalendarDaysIcon className="w-6 h-6 text-white" />,
      color: "from-yellow-500 to-orange-500",
      link: "/tax",
    },
    {
      title: "Diversifying Savings",
      desc: "Get smart suggestions to spread your savings across safe and growth-oriented options.",
      icon: <CurrencyDollarIcon className="w-6 h-6 text-white" />,
      color: "from-green-500 to-emerald-500",
      link: "/saving",
    },
    {
      title: "Expanse Tracker",
      desc: "Ask anything about finance, investments, or budgeting and get instant AI-powered answers.",
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />,
      color: "from-blue-500 to-cyan-500",
      link: "/pricing",
    },
    {
      title: "Stock Analyser",
      desc: "Track live stock prices, trends, and key market metrics for smarter investing.",
      icon: <ChartBarIcon className="w-6 h-6 text-white" />,
      color: "from-[#4b2e23] to-[#d4a373]",
      link: "/stock",
    },
    {
      title: "Policy & Insurance",
      desc: "Compare insurance plans, understand policy benefits, and make informed protection choices.",
      icon: <ShieldCheckIcon className="w-6 h-6 text-white" />,
      color: "from-purple-500 to-pink-500",
      link: "/policy",
    },
    {
      title: "Stock Trend Predictor",
      desc: "Utilize ML-based linear regression models to predict near-future stock prices.",
      icon: <ChartBarIcon className="w-6 h-6 text-white" />,
      color: "from-indigo-500 to-violet-500",
      link: "/stock-predictor",
    },
    {
      title: "Stock News",
      desc: "Stay updated with the latest market and company news.",
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />,
      color: "from-teal-500 to-emerald-500",
      link: "/stock-news",
    },
  ];

  return (
    <section className="bg-white py-16 px-6 lg:px-20">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900">Powerful Finance Features</h2>
        <p className="mt-3 text-gray-600">
          Your one-stop AI assistant for smarter money management.
        </p>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {features.map((feature, idx) => (
          <div
            key={idx}
            onClick={() => navigate(feature.link)}
            className="relative bg-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden cursor-pointer"
          >
            {/* Progress bar */}
            <span className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-pink-500 to-purple-500 group-hover:w-full transition-all duration-500"></span>

            {/* Gradient overlay on hover */}
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${feature.color} transition-all duration-300`}
            ></div>

            {/* Icon Avatar */}
            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
            >
              {feature.icon}
            </div>

            <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
            <p className="mt-2 text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
