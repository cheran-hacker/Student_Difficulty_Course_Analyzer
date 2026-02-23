import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    SparklesIcon,
    PaperAirplaneIcon,
    XMarkIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { getApiUrl } from '../config/api';

const FacultyAIWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'ai', text: "Hello! I'm your Faculty Assistant. Ask me about your course performance, student engagement, or recent feedback." }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Real AI Logic via Backend
        try {
            const user = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            const { data } = await axios.post(getApiUrl('/api/faculty/ai-chat'), { message: userMsg.text }, config);

            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: data.response }]);
            setIsTyping(false);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'ai',
                text: "I'm having trouble connecting to my neural network right now. Please try again in a moment. 🛠️"
            }]);
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-[#0a0a0a] border border-indigo-500/50 shadow-2xl shadow-indigo-500/20 flex items-center justify-center text-white group"
            >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 group-hover:opacity-40 transition-opacity blur-md"></div>
                {isOpen ? (
                    <XMarkIcon className="w-8 h-8 relative z-10" />
                ) : (
                    <SparklesIcon className="w-8 h-8 relative z-10 text-indigo-400 group-hover:text-white transition-colors" />
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-28 right-8 z-50 w-[90vw] md:w-[400px] h-[500px] bg-[#0f1115]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <SparklesIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Faculty Assistant</h3>
                                <p className="text-xs text-indigo-300">Powered by StudentAnalyzer AI</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.type === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-black/20">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask anything..."
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                                >
                                    <PaperAirplaneIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FacultyAIWidget;
