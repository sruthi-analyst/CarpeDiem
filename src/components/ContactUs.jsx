export default function ContactUs() {
  return (
    <section className="bg-[#fdf6f0] py-16 px-6 lg:px-20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-[#4b2e23]">📬 Contact Us</h2>
        <p className="mt-3 text-gray-700">
          Have questions, feedback, or partnership ideas? We’d love to hear from you!
        </p>
      </div>

      <form className="mt-10 max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg space-y-6">
        {/* Name */}
        <div>
          <label className="block text-left font-semibold text-gray-800">Your Name</label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4a373] outline-none"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-left font-semibold text-gray-800">Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4a373] outline-none"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-left font-semibold text-gray-800">Message</label>
          <textarea
            placeholder="Write your message here..."
            rows="4"
            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4a373] outline-none"
            required
          ></textarea>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-[#4b2e23] hover:bg-[#3a231a] text-white py-3 rounded-lg text-lg font-semibold transition-all duration-300"
        >
          Send Message
        </button>
      </form>
    </section>
  );
}
