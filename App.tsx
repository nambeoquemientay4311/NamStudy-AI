
import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ChatPanel } from './components/ChatPanel';
import { LearningMode, ChatMessage, TestContent } from './types';
import { generateTutorResponse, generateTest } from './services/geminiService';

const App: React.FC = () => {
  const [knowledgeBase, setKnowledgeBase] = useState<string>('');
  const [learningMode, setLearningMode] = useState<LearningMode>(LearningMode.TEXTBOOK);
  const [subject, setSubject] = useState<string>('Toán học');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là gia sư AI của bạn. Hãy cung cấp kiến thức sách giáo khoa, chọn một chủ đề và chế độ học tập ở bảng điều khiển bên trái để bắt đầu. Hoặc bạn có thể hỏi tôi bất cứ điều gì!',
    },
  ]);
  const [testContent, setTestContent] = useState<TestContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setTestContent(null);

    try {
      const responseText = await generateTutorResponse(knowledgeBase, messageText, subject, learningMode);
      const aiMessage: ChatMessage = { sender: 'ai', text: responseText };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: ChatMessage = { sender: 'ai', text: 'Rất tiếc, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, knowledgeBase, subject, learningMode]);

  const handleGenerateTest = useCallback(async (numQuestions: number) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setTestContent(null);
    const thinkingMessage: ChatMessage = { sender: 'ai', text: `Đang tạo đề thi ${numQuestions} câu hỏi về ${subject}...` };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const generatedTest = await generateTest(knowledgeBase, subject, numQuestions);
      setTestContent(generatedTest);
      const successMessage: ChatMessage = { sender: 'ai', text: `Đề thi của bạn đã sẵn sàng! Chúc bạn làm bài tốt.` };
       setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = successMessage;
        return newMessages;
       });
    } catch (error) {
       console.error("Error generating test:", error);
       const errorMessage: ChatMessage = { sender: 'ai', text: 'Rất tiếc, tôi không thể tạo đề thi vào lúc này. Vui lòng đảm bảo bạn đã cung cấp đủ kiến thức nền.' };
        setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = errorMessage;
        return newMessages;
       });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, knowledgeBase, subject]);


  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-emerald-400">
            AI Gia Sư Thông Minh
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Người bạn đồng hành học tập cá nhân của bạn
          </p>
        </header>
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ControlPanel
              knowledgeBase={knowledgeBase}
              onKnowledgeBaseChange={setKnowledgeBase}
              learningMode={learningMode}
              onLearningModeChange={setLearningMode}
              subject={subject}
              onSubjectChange={setSubject}
              onGenerateTest={handleGenerateTest}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-2">
            <ChatPanel
              messages={messages}
              testContent={testContent}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
