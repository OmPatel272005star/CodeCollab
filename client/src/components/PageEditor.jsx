import React, { useState, useRef, useEffect } from "react";
import { Play, Copy, LogOut, Code, Terminal, X, Send, Trash2 } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useLocation, useParams } from "react-router-dom";
import initSocket from "../socket";

function PageEditor() {
  const [clients, setClients] = useState([]);
  const [code, setCode] = useState('// Write your code here');
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();

  const handleError = (err) => {
    console.log("Socket error:", err);
    toast.error("Connection failed! Please try again.");
    navigate("/");
  };

  // Redirect if no username provided
  useEffect(() => {
    if (!location.state?.username) {
      navigate("/");
    }
  }, [location.state, navigate]);

  // Socket initialization and event listeners
  useEffect(() => {
    const init = async () => {
      try {
        socketRef.current = await initSocket();
        
        // Connection error handlers
        socketRef.current.on('connect_error', handleError);
        socketRef.current.on('connect_failed', handleError);
        
        // Join room
        socketRef.current.emit('join', {
          roomId,
          username: location.state?.username,
        });

        // Listen for room state (initial sync)
        socketRef.current.on('room_state', (state) => {
          setCode(state.code);
          setSelectedLanguage(state.language);
          setInput(state.input);
        });

        // Listen for new users joining
        socketRef.current.on('joined', ({ clients, username, socketId }) => {
          setClients(clients);
          if (socketId !== socketRef.current.id) {
            toast.success(`${username} joined the room`);
          }
        });

        // Listen for users leaving
        socketRef.current.on('user_left', ({ clients, username }) => {
          setClients(clients);
          toast.error(`${username} left the room`);
        });

        // Listen for code changes from other users
        socketRef.current.on('code_changed', ({ code }) => {
          setCode(code);
        });

        // Listen for language changes from other users
        socketRef.current.on('language_changed', ({ language }) => {
          setSelectedLanguage(language);
        });

        // Listen for input changes from other users
        socketRef.current.on('input_changed', ({ input }) => {
          setInput(input);
        });

        // Listen for code execution start
        socketRef.current.on('execution_started', () => {
          setIsRunning(true);
          setOutput("");
          setError("");
        });

        // Listen for code execution results
        socketRef.current.on('code_executed', ({ output, error, status }) => {
          setIsRunning(false);
          setOutput(output);
          setError(error);
          if (status === 'Accepted') {
            toast.success('Code executed successfully!');
          } else if (error) {
            toast.error('Code execution failed!');
          }
        });

      } catch (err) {
        handleError(err);
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, location.state?.username, navigate]);

  const languages = [
    { value: "cpp", label: "C++", color: "text-blue-400" },
    { value: "javascript", label: "JavaScript", color: "text-yellow-400" },
    { value: "python", label: "Python", color: "text-green-400" },
    { value: "java", label: "Java", color: "text-red-400" },
    { value: "c", label: "C", color: "text-purple-400" },
  ];

  const handleCodeChange = (value) => {
    setCode(value || "");
    if (socketRef.current) {
      socketRef.current.emit('code_change', {
        roomId,
        code: value || ""
      });
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    if (socketRef.current) {
      socketRef.current.emit('language_change', {
        roomId,
        language
      });
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setInput(inputValue);
    if (socketRef.current) {
      socketRef.current.emit('input_change', {
        roomId,
        input: inputValue
      });
    }
  };

  const runCode = () => {
    if (!code.trim()) {
      toast.error("Please write some code first!");
      return;
    }

    if (socketRef.current) {
      socketRef.current.emit('execute_code', {
        roomId,
        code,
        language: selectedLanguage,
        input
      });
    }
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy room ID");
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const clearOutput = () => {
    setOutput("");
    setError("");
  };

  const handleLogOut = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex">
  <Toaster position="top-center" reverseOrder={false} />

  {/* Sidebar */}
  <div className="w-[350px] bg-gray-800 border-r border-gray-700 flex flex-col">
    {/* Logo section */}
    <div className="p-6 border-b ">
      <div className="flex items-center justify-center mb-4">
        <div className="w-18 h-18 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-lg font-bold text-white">CC</span>
        </div>
      </div>
      <h1 className="text-xl font-bold text-white text-center">CodeCast</h1>
    </div>

    {/* Members section */}
    <div className="flex-1 p-4 overflow-auto ">
      <h3 className="text-white text-center font-semibold mb-4 tracking-wide ">
        Member ({clients.length})
      </h3>
      <div className="space-y-3 ">
        {clients.map((client) => (
          <div
            key={client.socketId}
            className="flex items-center space-x-3 hover:bg-gray-950 rounded-lg p-2 transform transition-all duration-200 ease-in-out "
          >
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {client.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-2xl font-bold text-gray-300 text-sm">{client.username}</span>
            {client.socketId === socketRef.current?.id && (
              <span className="text-green-400 text-xs">(You)</span>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* Action buttons */}
    <div className="p-4 border-t border-gray-700 space-y-3 text-white ">
      <div
        className="flex items-center justify-center  bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg transition-all transform hover:scale-105"
        onClick={copyCode}
      >
        <Copy size={18} className="text-white" />
        <button className="w-full  text-white font-semibold " style={{ borderRadius: '8px' }}>
          Copy Code 
        </button>
      </div>
      <div
        className="flex items-center justify-center bg-green-600 hover:bg-green-700  px-4 rounded-lg transition-all transform hover:scale-105"
        onClick={copyRoomId}
      >
        <Copy size={18} className="text-white" />
        <button className="my-2 w-full  text-white font-semibold " style={{ borderRadius: '8px' }}>
          Copy Room ID
        </button>
      </div>
      <div
        className="flex items-center justify-center bg-red-600 hover:bg-red-700 py-2 px-4 rounded-lg transition-all transform hover:scale-105"
        onClick={handleLogOut}
      >
        <LogOut size={18} className="text-white" />
        <button className="w-full  text-white font-semibold " style={{ borderRadius: '8px' }}>
          Leave Room
        </button>
      </div>
    </div>
  </div>

  {/* Editor Area */}
  <div className="flex-1 flex flex-col">
    {/* Editor Header */}
    <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Code size={20} className="text-gray-400" />
        <select
          className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <button
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
        onClick={runCode}
        disabled={isRunning}
      >
        <Play size={16} />
        {isRunning ? 'Running...' : ''}
      </button>
    </div>

    {/* Main Content Area */}
    <div className="flex-1 flex">
      {/* Code Editor */}
      <div className="flex-1 bg-gray-900">
        <Editor
          height="100%"
          defaultLanguage={selectedLanguage}
          language={selectedLanguage}
          value={code}
          theme="vs-dark"
          onChange={handleCodeChange}
          options={{
            fontSize: 20,
            wordWrap: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: 'on',
            folding: true,
            bracketPairColorization: true,
          }}
        />
      </div>

      {/* Input/Output Panel */}
      <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
        {/* Input section */}
        <div className="border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-semibold flex items-center gap-4">
              <Terminal size={16} />
              Input
            </h4>
          </div>

          <textarea
            className="w-full h-24 bg-gray-900 text-white p-2 border border-gray-600 font-mono text-sm rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter input for your program..."
            value={input}
            onChange={handleInputChange}
          />
        </div>

        {/* Output section */}
        <div className="flex flex-col flex-1 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Output</h3>
            <button className="text-gray-400 hover:text-white transition-colors" onClick={clearOutput}>
              <Trash2 size={16} />
            </button>
          </div>

          <div className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 overflow-auto">
            {isRunning && (
              <div className="text-blue-400 font-mono text-sm">
                <div className="animate-pulse">Executing code...</div>
              </div>
            )}

            {output && (
              <div className="text-green-400 font-mono text-sm whitespace-pre-wrap">{output}</div>
            )}

            {error && (
              <div className="text-red-400 font-mono text-sm whitespace-pre-wrap">{error}</div>
            )}

            {!isRunning && !output && !error && (
              <div className="text-gray-500 font-mono text-sm">Output will appear here...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  );
}

export default PageEditor;