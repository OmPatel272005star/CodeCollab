import React, { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import AnimatedCodeCastLogo from "./AnimatedCodeCastLogo";
function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success('Room ID is Generated');
  };

  const joinRoom = () => {
    if (!roomId) {
      toast.error("Fill the room ID");
      return;
    }
    if (!username) {
      toast.error("Enter the username");
      return;
    }

    // Navigate to editor
    navigate(`/editor/${roomId}`, {
      state: { username }
    });
    toast.success("Room is joined");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      joinRoom();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-2xl p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">CC</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CodeCast</h1>
          <p className="text-gray-400">Collaborative Code Editor</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            placeholder="ROOM ID"
            style={{ backgroundColor: '#374151', color: 'white', border: '1px solid #4b5563' }}
          />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyPress}
            className="mt-3 w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            placeholder="USERNAME"
            style={{ backgroundColor: '#374151', color: 'white', border: '1px solid #4b5563' }}
          />
          <button 
            className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105"
            style={{ backgroundColor: '#059669', color: 'white', borderRadius: '5px' }}
            onClick={joinRoom}
          >
            JOIN ROOM
          </button>
        </div>

        <p className="mt-6 py-3 text-center text-gray-300">
          Don't have a room ID?{" "}
          <span 
            className="text-green-400 hover:text-green-300 cursor-pointer transition-colors underline"
            onClick={generateRoomId}
          >
            Create New Room
          </span>
        </p>
      </div>
    </div>
  );
}

export default Home;