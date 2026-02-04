import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/landing/Footer';
import RecordCTA from '../../components/landing/RecordCTA';
import DemoVideoPlayer from '../../components/landing/DemoVideoPlayer';
import FaqAccordians from '../../components/landing/FaqAccordians';
import styles from './Landing.module.css';

function Home() {
  const features = [
    {
      title: 'Fumbled a word? No problem.',
      description: `With other screen recorders, you'll have to restart the entire recording or use some complicated post-production software to edit out the mistake.

      With Vento just pause, rewind a few seconds, and re-record over it!`,
      image: '/assets/home/fumble.png',
      alt: 'video editor for recording screen, audio, showing a face using Chromebook'
    },
    {
      title: 'Do multiple takes',
      description: `You can do many takes really quickly by jumping to the last rewind point and re-recording again and again. Need to get that feeling right for a pitch or a demo? Now you can do it without restarting the whole video from scratch.`,
      image: '/assets/home/multiple-takes.png',
      alt: 'video navigation bar after recording screen and audio on Chromebook'
    },
    {
      title: 'Create chapter headings',
      description: `Make it easier for your viewers to quickly skip to points of interest in your recording!`,
      image: '/assets/home/chapter-headings.png',
      alt: 'video editor showing chapter headings after recording screen using extension on Chromebook'
    },
    {
      title: 'Add author annotations',
      description: `Forgot to mention something? Go back afterwards and add an author annotation that viewers will have to acknowledge before continuing to watch the video recording!`,
      image: '/assets/home/author-annotation.png',
      alt: 'recorded face and audio with transcript using Chromebook'
    }
  ];

  return (
    <main className="flex flex-col min-h-screen">
      {/* Background curves image */}
      <img
        src="/assets/background-curves.svg"
        alt="background"
        className={`absolute top-0 left-0 w-full h-auto pointer-events-none z-0 ${styles.backgroundImage}`}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />

      <Header startRecording={false}/>

      <div className="relative z-10 max-w-content mx-auto w-full px-6 py-8 md:py-16 flex flex-col items-center flex-wrap">
        {/* Hero Section */}
        <div className="w-full flex flex-col md:flex-row items-center gap-8 mb-16">
          <div className="w-full md:w-[55%] flex flex-col">
            <h1 className="mb-4 font-kreon font-bold text-[48px] leading-[40px]">
              Stress-Free Screen Recording
            </h1>
            <p className="text-xl text-[#9A989C] mb-6 leading-relaxed">
              Constantly restarting your screen recordings? With Vento, just pause, rewind, and carry on instead - keeping calm helps too :)
              <br />
              Works on desktop Chrome & Edge - Chromebook (ChromeOS), MacOS and Windows supported!
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <RecordCTA />
            </div>
          </div>
          <img
            className="hidden md:block absolute top-[-100px] right-0 w-[50%] object-cover pointer-events-none"
            src="/assets/hero-photo.svg"
            alt="man sits in front of Chromebook or Macbook computer recording face and audio with screen using Chrome extension"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Demo Video Section */}
        <div className="w-full md:w-[90%] flex flex-col gap-8 md:gap-16 mb-10 mt-[10%]">
          <h3 className="text-2xl font-normal relative pb-4 after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[3.5px] after:bg-black">
            "To record great videos, one must first rewind." - Lincoln, probably.
          </h3>
          <DemoVideoPlayer
            src="https://storage.googleapis.com/vento-assets/assets/demo.mp4"
            poster="https://storage.googleapis.com/vento-assets/assets/thumbnail.png"
            className="w-full md:w-[95%] mx-auto"
            autoPlay
            playsInline
            muted
            loop
          />
        </div>

        {/* Features Section */}
        <ul className="w-full mt-4 space-y-20 list-none">
          {features.map((feature, index) => (
            <li
              key={index}
              className={`flex flex-wrap items-center gap-8 min-h-[15rem] ${index % 2 === 1 ? 'flex-row-reverse' : ''
                }`}
            >
              <div className="flex-1 min-w-[20rem] flex flex-col">
                <h3 className="text-4xl  font-kreon font-bold leading-tight mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#9A989C] whitespace-pre-line">
                  {feature.description}
                </p>
              </div>
              <img
                src={feature.image}
                alt={feature.alt}
                className="w-full md:w-[30rem] rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </li>
          ))}
        </ul>

        {/* FAQ Section */}
        <section className="w-full mt-8" id="faq">
          <h2 className="text-3xl font-bold mb-4">FAQs</h2>
          <p className="mb-6 text-black">
            Vento is a fantastic screen recorder for Chromebook, Windows and Mac. No download required. Vento supports recording the screen, internal/external audio, and webcam with free audio transcription. Here's more information on Vento:
          </p>
          <FaqAccordians />
        </section>
      </div>

      <Footer />
    </main>
  );
}

export default Home;
