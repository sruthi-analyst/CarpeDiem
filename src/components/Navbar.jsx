import Logo from '../assets/logo1.jpg';
import { Link } from 'react-router-dom';

export default function Navbar({ onFeaturesClick, onAboutClick, onContactClick }) {
  return (
    <nav className="bg-[#fdf6f0] flex items-center justify-between px-8 py-6">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-md font-bold">
          <img className="rounded-3xl" src={Logo} alt="logo" />
        </div>
        <span className="font-bold text-xl">Carpe Diem</span>
      </Link>

      <div className="flex items-center gap-6">
        <button
          onClick={onFeaturesClick}
          className="px-4 py-1 rounded-full bg-white text-md hover:bg-gray-100"
        >
          Features
        </button>
        <button
          onClick={onAboutClick}
          className="px-4 py-1 rounded-full bg-white text-md hover:bg-gray-100"
        >
          About
        </button>
        <button
          onClick={onContactClick}
          className="px-4 py-1 rounded-full bg-white text-md hover:bg-gray-100"
        >
          Contact
        </button>
      </div>

      <button className="bg-[#4b2e23] text-white px-5 py-2 rounded-full">
        Get Started
      </button>
    </nav>
  );
}
