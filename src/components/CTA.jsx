import hi from '../assets/hi.jpg'
import { LockClosedIcon, CloudIcon, NoSymbolIcon } from "@heroicons/react/24/solid";

const CTA = () => {
  const features = [
    {
      icon: <CloudIcon className="w-6 h-6 text-blue-400" />,
      title: "Local AI processing with Ollama",
      subtitle: "No cloud dependency",
    },
    {
      icon: <LockClosedIcon className="w-6 h-6 text-orange-400" />,
      title: "Bank-grade security encryption",
      subtitle: "Military-level protection",
    },
    {
      icon: <NoSymbolIcon className="w-6 h-6 text-red-400" />,
      title: "Zero data sharing policy",
      subtitle: "Your privacy guaranteed",
    },
  ];

  return (
    <section className="bg-[#4b2a25] text-white py-16 px-6 lg:px-20 flex flex-col lg:flex-row items-center lg:justify-between gap-12">
      {/* Left: Image */}
      <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-700">
        <img
          src={hi}
          alt="Laptop"
          className="w-[400px] h-auto object-cover"
        />
      </div>

      {/* Right: Content */}
      <div className="max-w-xl">
        <span className="inline-block bg-gray-800 text-sm text-blue-300 px-3 py-1 rounded-full mb-4">
          Privacy First Technology
        </span>
        <h2 className="text-4xl font-bold mb-4">
          Your Data Stays <br /> Completely Private
        </h2>
        <p className="text-lg text-gray-300 mb-8">
          Experience the power of advanced AI without compromising your privacy.
          Our local processing ensures your financial data never leaves your device
          while delivering intelligent insights.
        </p>

        {/* Feature Cards */}
        <div className="space-y-4">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 bg-[#5d3a33] rounded-xl p-4 border border-transparent hover:border-blue-400 hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow hover:shadow-lg"
            >
              <div className="p-2 bg-gray-800 rounded-lg">{feature.icon}</div>
              <div>
                <h4 className="font-semibold">{feature.title}</h4>
                <p className="text-gray-300 text-sm">{feature.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-6 text-sm text-green-400">
          ● Trusted by privacy-conscious users worldwide
        </p>
      </div>
    </section>
  );
};

export default CTA;
