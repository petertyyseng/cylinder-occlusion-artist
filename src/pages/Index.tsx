import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImageProcessor from '@/components/ImageProcessor';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Header />
        <ImageProcessor />
        <Footer />
      </div>
    </div>
  );
};

export default Index;