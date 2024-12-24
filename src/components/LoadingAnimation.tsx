import React from 'react';

export const LoadingAnimation: React.FC = () => (
  <div className="flex justify-center items-center py-12">
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"></div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);