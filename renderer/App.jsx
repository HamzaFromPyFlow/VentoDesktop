import React from 'react';
import { MantineProvider } from '@mantine/core';
import Landing from './pages/Landing';

function App() {
  return (
    <MantineProvider>
      <div className="flex flex-col h-screen bg-white overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Landing />
        </main>
      </div>
    </MantineProvider>
  );
}

export default App;
