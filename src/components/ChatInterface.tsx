
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePowerdrill } from "@/contexts/PowerdrillContext";
import { Message as MessageType } from "@/contexts/PowerdrillContext";
import { Send, Upload, X, FileIcon } from "lucide-react";
import { toast } from "sonner";

interface ChatInterfaceProps {
  onFileUpload: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onFileUpload }) => {
  const { messages, askQuestion, explorationQuestions } = usePowerdrill();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    askQuestion(input)
      .catch(error => {
        console.error('Error asking question:', error);
        toast.error('Failed to send message');
      });
      
    setInput('');
  };
  
  const handleQuestionClick = (question: string) => {
    askQuestion(question)
      .catch(error => {
        console.error('Error asking question:', error);
        toast.error('Failed to send message');
      });
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome to PowerDrill AI Analyzer</h2>
            <p className="text-gray-600 mb-6">
              Upload your data files to start analyzing with AI
            </p>
            <Button
              className="flex items-center gap-2"
              onClick={onFileUpload}
            >
              <Upload size={16} />
              Upload Files
            </Button>
          </div>
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} onQuestionClick={handleQuestionClick} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onFileUpload}
            title="Upload files"
          >
            <Upload size={16} />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something about your data..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
};

interface MessageProps {
  message: MessageType;
  onQuestionClick: (question: string) => void;
}

const Message: React.FC<MessageProps> = ({ message, onQuestionClick }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';
  
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`rounded-lg p-3 max-w-[80%] ${
          isUser
            ? 'bg-blue-500 text-white'
            : isAssistant
            ? 'bg-gray-100'
            : 'bg-gray-200'
        } ${message.loading ? 'animate-pulse' : ''}`}
      >
        {message.type === 'file-upload' && message.files && (
          <div className="mb-2">
            <p className="font-medium mb-1">Uploaded files:</p>
            <ul className="space-y-1">
              {message.files.map((file, index) => (
                <li key={index} className="flex items-center gap-1 text-sm">
                  <FileIcon size={14} />
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <p>{message.content}</p>
        
        {message.type === 'questions' && message.questions && (
          <div className="mt-2 space-y-1">
            {message.questions.map((question, index) => (
              <button
                key={index}
                className="block text-left text-sm px-3 py-1.5 bg-white rounded-full border border-gray-200 hover:bg-gray-50 w-full overflow-hidden text-ellipsis"
                onClick={() => onQuestionClick(question)}
              >
                {question}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
