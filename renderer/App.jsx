import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import Pricing from './pages/pricing/Pricing';
import Landing from './pages/landing/Landing';

function App() {
  return (
    <MantineProvider>
      <HashRouter>
        <div className="flex flex-col h-screen bg-white overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </MantineProvider>
  );
}

export default App;
