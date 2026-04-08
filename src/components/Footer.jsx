import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#fdfaf6] text-center py-10">
      {/* Logo */}
      <div className="inline-block bg-[#4b2a25] text-white font-semibold px-5 py-2 rounded-full">
        Carpe Diem
      </div>

      {/* Navigation Links */}
      <nav className="mt-4 flex justify-center gap-8 text-[#4b2a25] text-sm font-medium">
        <a href="#features" className="hover:underline">Features</a>
        <a href="#about" className="hover:underline">About</a>
        <a href="#contact" className="hover:underline">Contact</a>
      </nav>

      {/* Copyright */}
      <p className="mt-4 text-sm text-[#4b2a25]">
        © 2025 Carpe Diem. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
