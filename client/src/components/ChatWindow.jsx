import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

import API_BASE_URL from '../config/api';

const socket = io(API_BASE_URL || window.location.origin);

const ChatWindow = ({ courseId, courseName }) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('userInfo'));
        setUserInfo(user);

        if (courseId) {
            socket.emit('join_room', courseId);
        }

        socket.on('receive_message', (data) => {
            setChatHistory((prev) => [...prev, data]);
        });

        socket.on('user_joined', (data) => {
            setChatHistory((prev) => [...prev, { ...data, type: 'system' }]);
        });

        return () => {
            socket.off('receive_message');
            socket.off('user_joined');
        };
    }, [courseId]);

    useEffect(() => {
        // Auto-scroll to bottom
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (message.trim() === '') return;

        const messageData = {
            room: courseId,
            author: userInfo?.name || 'Anonymous',
            authorId: userInfo?._id,
            message: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'user'
        };

        await socket.emit('send_message', messageData);
        setChatHistory((prev) => [...prev, messageData]);
        setMessage('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-[600px] bg-white/80 dark:bg-[#0f1014]/60 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/5 overflow-hidden ring-1 ring-black/5 dark:ring-white/5"
        >
            {/* Glass Header */}
            <div className="relative p-6 flex items-center justify-between border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl shadow-inner border border-indigo-500/20">
                        <ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 dark:text-white text-lg tracking-tight">Course Hub</h3>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{courseName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                    Live
                </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide relative">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                <AnimatePresence>
                    {chatHistory.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="relative z-10"
                        >
                            {msg.type === 'system' ? (
                                <div className="flex justify-center my-4">
                                    <span className="flex items-center gap-2 text-[10px] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/5 font-bold uppercase tracking-wider backdrop-blur-md">
                                        <SparklesIcon className="w-3 h-3 text-yellow-500" />
                                        {msg.message}
                                    </span>
                                </div>
                            ) : (
                                <div className={`flex items-end gap-3 ${msg.authorId === userInfo?._id ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shadow-lg border-2 border-white dark:border-[#0f1014] flex-shrink-0
                                        ${msg.authorId === userInfo?._id
                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30'
                                            : 'bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-700 dark:to-gray-600'}`}>
                                        {msg.author[0]}
                                    </div>
                                    <div className={`max-w-[75%] p-4 rounded-3xl shadow-sm text-sm border backdrop-blur-md ${msg.authorId === userInfo?._id
                                        ? 'bg-indigo-600 dark:bg-indigo-600/90 text-white rounded-br-none border-indigo-400/30 shadow-indigo-500/20'
                                        : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-100 rounded-bl-none border-gray-100 dark:border-white/5'
                                        }`}>
                                        <div className="flex justify-between items-baseline gap-4 mb-1">
                                            <p className={`font-bold text-[10px] uppercase tracking-wider ${msg.authorId === userInfo?._id ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'}`}>
                                                {msg.author}
                                            </p>
                                        </div>
                                        <p className="leading-relaxed font-medium">{msg.message}</p>
                                        <span className={`text-[10px] block text-right mt-2 font-mono ${msg.authorId === userInfo?._id ? 'text-indigo-300' : 'text-gray-400'}`}>
                                            {msg.time}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={scrollRef}></div>
            </div>

            {/* Floating Input Area */}
            <div className="p-6 pt-2 bg-gradient-to-t from-white dark:from-[#0f1014] to-transparent">
                <form onSubmit={sendMessage} className="relative group">
                    <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-2xl blur-xl group-focus-within:bg-indigo-500/30 transition-all duration-500"></div>
                    <div className="relative flex items-center gap-2 bg-white dark:bg-[#1a1b20] p-2 pr-2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-transparent border-0 px-4 py-3 text-sm focus:ring-0 outline-none text-gray-800 dark:text-white placeholder:text-gray-400 font-medium"
                        />
                        <button
                            type="submit"
                            disabled={!message.trim()}
                            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            <PaperAirplaneIcon className="w-5 h-5 -rotate-45 translate-x-0.5 -translate-y-0.5" />
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default ChatWindow;
