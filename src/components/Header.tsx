import React from 'react';

const Header = () => {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">
        Image to 3D Model Converter
      </h1>
      <p className="text-lg text-gray-600">
        Transform your images into self-occluding 3D models for printing
      </p>
    </div>
  );
};

export default Header;