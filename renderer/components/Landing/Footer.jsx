import React from 'react';

function Footer() {
  return (
    <footer className="bg-[#EDFAE1] mt-auto relative z-10">
      <div className="max-w-content mx-auto px-6 py-12">
        <h1 className="text-3xl font-normal text-black mb-4"             
        style={{ fontFamily: "'Shrikhand', '__Shrikhand_Fallback_8fa858', cursive" }}
        >vento</h1>
        <div className="flex flex-wrap justify-between gap-4 pt-4">
          <div className="flex flex-col">
            <p className="text-[#9A989C] mb-2">© 2023 Vento. All rights reserved.</p>
            <div className="flex gap-4">
              <a
                href="/policy?content=privacy-policy"
                target="_blank"
                className="text-[#9A989C] underline underline-offset-2 hover:text-white"
              >
                Privacy Policy
              </a>
              <a
                href="/policy?content=terms-of-service"
                target="_blank"
                className="text-[#9A989C] underline underline-offset-2 hover:text-white"
              >
                Terms of Service
              </a>
            </div>
          </div>
          <div className="text-[#9A989C]">
            Say hello! We don't bite. Well, maybe one of us does.{' '}
            <a
              href="mailto:hello@vento.so"
              className="text-[#9A989C] underline underline-offset-2 hover:text-white ml-1"
            >
              hello@vento.so
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
