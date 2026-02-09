import React from 'react';
import Header from '../../components/Header';
import RecordInitMenu from '../../components/record/RecordInitMenu';

function RecordPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header pricing={false} startRecording={false} />
      <RecordInitMenu />
    </main>
  );
}

export default RecordPage;

