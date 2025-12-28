import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ResumeChatProps {
  resumeData: Resume;
  feedback: Feedback;
  onSendMessage: (message: string, context: string) => Promise<string>;
}

const ResumeChat: React.FC<ResumeChatProps> = ({ 
  resumeData, 
  feedback, 
  onSendMessage 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your AI assistant. You can ask me anything about your CV, for example:\n\n• "Why is my ATS score low?"\n• "How can I improve my Summary section?"\n• "What skills should I learn?"\n• "Analyze my work experience section"',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const buildContext = (): string => {
    return `
Resume Analysis Context:
- Overall Score: ${feedback.overallScore}/100
- ATS Score: ${feedback.ATS.score}/100
- Company: ${resumeData.companyName || 'N/A'}
- Job Title: ${resumeData.jobTitle || 'N/A'}

Key Strengths:
${feedback.ATS.tips.filter(t => t.type === 'good').map(t => `- ${t.tip}`).join('\n')}

Areas for Improvement:
${feedback.ATS.tips.filter(t => t.type === 'improve').map(t => `- ${t.tip}`).join('\n')}

Skills Analysis:
${feedback.skills.tips.map(t => `- [${t.type}] ${t.tip}: ${t.explanation}`).join('\n')}

Content Analysis:
${feedback.content.tips.map(t => `- [${t.type}] ${t.tip}: ${t.explanation}`).join('\n')}
    `.trim();
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSending(true);

    try {
      const context = buildContext();
      const response = await onSendMessage(inputMessage, context);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ Sorry, an error occurred. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "Why is my ATS score low?",
    "How to improve my Summary?",
    "What skills should I learn?",
    "Analyze my experience section"
  ];

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 flex items-center gap-3 group"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="hidden group-hover:inline-block font-semibold text-sm">
            Chat with CV
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-bold text-lg">CV Assistant</h3>
                <p className="text-xs text-white/80">Resume Analysis Helper</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-lg p-2 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2 font-medium">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputMessage(question);
                    }}
                    className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-100 transition"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your CV..."
                rows={2}
                disabled={isSending}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!inputMessage.trim() || isSending}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed self-end"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResumeChat;
