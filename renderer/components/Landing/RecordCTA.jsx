import React from 'react';
import { CgRecord } from 'react-icons/cg';

function RecordCTA() {
  const handleClick = () => {
    console.log('Start recording clicked');
  };

  return (
    <a
      href="/record/new"
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-6 py-3 bg-[#68E997] text-black rounded-lg font-medium"
    >
      Start Recording
      <CgRecord size={20} />
    </a>
  );
}

export default RecordCTA;
