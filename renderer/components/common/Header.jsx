import React from 'react';
import styles from '../../styles/modules/Header.module.scss';

function Header({ pricing = true, startRecording = true, login = true, signup = true }) {
  return (
    <nav className="relative z-10 mt-4">
      <div className="max-w-content mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 -ml-4">
          <div className="flex items-start">
            <img
              src="/assets/green-logo.png"
              alt="vento logo"
              className="w-8 h-8"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <a
              href="#/"
              className={`text-[24px] leading-[33px] text-[#413245] ${styles.logoText}`}
            >
              ento
            </a>
          </div>
          {pricing && (
            <a
              href="#/pricing"
              className="text-gray-700 hover:text-gray-900 no-underline ml-4 transition-colors"
            >
              Pricing
            </a>
          )}
        </div>
        <div className="flex items-center gap-4 -mr-4">
          {startRecording && (
            <a
              href="#/record"
              className="flex items-center px-4 py-3 rounded-lg bg-[#68E996] text-black"
            >
              Start Recording
            </a>
          )}
          {login && (
            <a
              href="#/login"
              className="text-[#68E996]"
            >
              Login
            </a>
          )}
          {signup && (
            <a
              href="#/signup"
              className="px-4 py-2 text-black rounded-lg bg-[#EDFAE1]"
            >
              Sign up
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
