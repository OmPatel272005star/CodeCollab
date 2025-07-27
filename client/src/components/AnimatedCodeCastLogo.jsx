import React, { useState, useEffect } from 'react';

const AnimatedCodeCastLogo = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState([]);
  const [codeText, setCodeText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  const fullCodeText = 'console.log("Hello World");';

  useEffect(() => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);

    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < fullCodeText.length) {
        setCodeText(fullCodeText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setCodeText('');
          index = 0;
        }, 3000);
      }
    }, 100);

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <div className="text-center mb-8 relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animation: `float ${3 + particle.delay}s ease-in-out infinite alternate`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Main logo container */}
      <div
        className="relative inline-block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Outer glow ring */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-500 ${
            isHovered
              ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-spin'
              : 'bg-gradient-to-r from-green-400 to-blue-500'
          }`}
          style={{
            padding: '3px',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {/* Inner logo circle */}
          <div
            className={`w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-500 ${
              isHovered ? 'bg-gray-800' : 'bg-gray-900'
            }`}
          >
            {/* Animated code brackets */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`text-3xl font-mono font-bold text-cyan-400 transition-all duration-300 ${
                  isHovered ? 'scale-110 text-cyan-300' : ''
                }`}
              >
                {'{ }'}
              </div>
            </div>

            {/* Center CC text */}
            <div
              className={`text-2xl font-bold text-white z-10 transition-all duration-300 ${
                isHovered ? 'scale-110 text-green-400' : ''
              }`}
            >
              CC
            </div>

            {/* Rotating code symbols */}
            <div
              className={`absolute inset-0 transition-transform duration-1000 ${
                isHovered ? 'rotate-180' : 'rotate-0'
              }`}
            >
              {['<', '>', '/', '*'].map((symbol, index) => (
                <div
                  key={symbol}
                  className="absolute text-blue-400 text-xs font-mono opacity-60"
                  style={{
                    top: `${20 + Math.sin((index * Math.PI) / 2) * 25}%`,
                    left: `${50 + Math.cos((index * Math.PI) / 2) * 30}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {symbol}
                </div>
              ))}
            </div>

            {/* Pulse effect */}
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-20 ${
                isHovered ? 'animate-ping' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* Title with typewriter effect */}
      <div className="mt-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
          CodeCast
        </h1>

        {/* Typing animation */}
        <div className="text-gray-400 font-mono text-sm mb-2 h-6">
          <span className="text-green-400">{codeText}</span>
          <span className={`text-white ${showCursor ? 'opacity-100' : 'opacity-0'}`}>|</span>
        </div>

        <p className="text-gray-400 text-lg">Collaborative Code Editor</p>

        {/* Status indicators */}
        <div className="flex justify-center items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Live</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
              style={{ animationDelay: '0.5s' }}
            ></div>
            <span className="text-xs text-gray-500">Sync</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
              style={{ animationDelay: '1s' }}
            ></div>
            <span className="text-xs text-gray-500">Cast</span>
          </div>
        </div>
      </div>

      {/* Inject custom animation keyframes */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes float {
              0% {
                transform: translateY(0px) rotate(0deg);
              }
              100% {
                transform: translateY(-10px) rotate(180deg);
              }
            }
          `
        }}
      />
    </div>
  );
};

export default AnimatedCodeCastLogo;
