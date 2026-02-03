import React from 'react';
import { Accordion } from '@mantine/core';
import { AiOutlinePlus } from 'react-icons/ai';

const firstColumnFaqs = [
  {
    label: "How can I use Vento?",
    content:
      "Vento works on Chrome or Edge; it also works on laptops like Chromebooks, Macbooks or desktop computers! You can use our Chrome extension for easy access or record straight from our website.",
  },
  {
    label: "What's the difference between Vento and other screen recorders?",
    content:
      "With other screen recorders, you have to constantly restart everytime you fumble a word or your dog barks. With Vento, you can simply pause, rewind a few seconds, and re-record over the mistake and keep going!",
  },
  {
    label: "What resolution are these videos being recorded at?",
    content:
      "All videos are recorded at 720p. Check out our premium version for higher resolutions!",
  },
  {
    label: "Can I download and delete my recordings?",
    content:
      "Absolutely. After finishing your video and creating an account, you can download it and delete it so there's no trace on it on our end. Recordings made while logged out will be deleted regularly regardless.",
  },
];

const secondColumnFaqs = [
  {
    label: "Are you able to record computer audio?",
    content:
      "Yes, however there are some limitations to consider! We can capture Browser Tab Audio on Windows, Mac OS and Linux. However, Full System Audio is only available on Windows and Chrome OS.",
  },
  {
    label: "Can Vento record my face?",
    content:
      "Yes, you can record your face by turning on the video camera, and sharing your entire screen. Make sure to share the entire screen, otherwise your face won't appear in the final recording!",
  },
  {
    label: "Are we real humans or chatGPT?",
    content: "Definitely chatGPT. No humans here.",
  },
  {
    label: "What laptops do you work on?",
    content:
      "We work on any laptop where you can use Chrome or Edge, like a Chromebook or a Macbook for instance.",
  },
];

function FaqAccordians() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Accordion multiple variant="separated" chevron={<AiOutlinePlus />}>
        {firstColumnFaqs.map((faq, i) => (
          <Accordion.Item key={i} value={faq.label}>
            <Accordion.Control>{faq.label}</Accordion.Control>
            <Accordion.Panel>{faq.content}</Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      <Accordion multiple variant="separated" chevron={<AiOutlinePlus />}>
        {secondColumnFaqs.map((faq, i) => (
          <Accordion.Item key={i} value={faq.label}>
            <Accordion.Control>{faq.label}</Accordion.Control>
            <Accordion.Panel>{faq.content}</Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
}

export default FaqAccordians;
