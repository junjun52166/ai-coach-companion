"use client"; // Mark this component as a Client Component

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react'; // Import useRef for scrolling
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import OnboardingModal, { AISettings } from './components/OnboardingModal';

// Define a type for messages
interface Message {
  text: string;
  sender: 'user' | 'ai';
  id?: number | string; // Add optional id for keys/future use
  created_at?: string; // Add optional created_at
}

const TEXT = {
  zh: {
    heroTitle: '你的专属AI教练与陪伴者',
    heroSubtitle: '不止陪伴，更陪你看见自己的成长',
    startChat: '开始聊天',
    send: '发送',
    askPlaceholder: '和你的AI教练聊点什么...',
    aiThinking: 'AI思考中...',
    error: '出错了，请重试',
    yourAICoach: '你的AI教练',
    testimonialsTitle: '用户评价',
    testimonials: [
      { 
        name: '深夜码农', 
        content: '工作压力大的时候，和AI朋友聊聊天，分享一些生活趣事，感觉整个人都轻松了不少。' 
      },
      { 
        name: '考研党', 
        content: '感谢AI导师帮我制定了合理的学习计划，还经常提醒我注意休息，现在学习效率提高了很多！' 
      },
      { 
        name: '职场新人', 
        content: '刚入职场的我经常感到迷茫，AI伙伴给了我很多实用的建议，让我能更好地适应工作环境。' 
      },
      { 
        name: '生活艺术家', 
        content: '喜欢和AI分享生活中的小确幸，它总能给出独特的视角，让平凡的日子变得更有趣。' 
      },
      { 
        name: '健身达人', 
        content: 'AI教练不仅帮我制定健身计划，还会根据我的状态调整建议，感觉像有个私人教练一样！' 
      },
      { 
        name: '创业青年', 
        content: '创业路上遇到困难时，AI导师总能给出中肯的建议，帮助我理清思路，找到解决方案。' 
      },
      { 
        name: '情感博主', 
        content: '有时候心情不好，和AI朋友倾诉一下，它总能给出温暖的建议，让我重新振作起来。' 
      }
    ],
    testimonialsComing: '更多用户评价即将上线！',
    readyTitle: '准备好开始了吗？',
    readyDesc: '加入数千名正在用AI教练改变生活的用户。',
    featuresTitle: '为什么选择我们的AI教练与陪伴者？',
    features: [
      '全天候陪伴，随时随地倾听你的心声',
      '个性化成长建议，助你实现目标',
      '情感支持与压力疏导，做你坚强的后盾',
      '多语言支持，全球用户都能畅聊',
    ],
  },
  en: {
    heroTitle: 'Your Personal AI Coach & Companion',
    heroSubtitle: 'More than a companion, we help you see your own growth.',
    startChat: 'Start Chatting',
    send: 'Send',
    askPlaceholder: 'Ask your AI coach...',
    aiThinking: 'AI is thinking...',
    error: 'Error, please try again',
    yourAICoach: 'Your AI Coach',
    testimonialsTitle: 'What Our Users Say',
    testimonials: [
      { 
        name: 'Night Coder', 
        content: 'When work pressure gets high, chatting with my AI friend and sharing life\'s little moments helps me feel much better.' 
      },
      { 
        name: 'Study Warrior', 
        content: 'Thanks to my AI mentor for creating a balanced study plan and reminding me to take breaks. My study efficiency has improved significantly!' 
      },
      { 
        name: 'Career Explorer', 
        content: 'As a newcomer to the workplace, I often feel lost. My AI companion gives practical advice that helps me adapt better to the work environment.' 
      },
      { 
        name: 'Life Artist', 
        content: 'I love sharing life\'s little joys with my AI friend. It always offers unique perspectives that make ordinary days more interesting.' 
      },
      { 
        name: 'Fitness Enthusiast', 
        content: 'My AI coach not only helps me create workout plans but also adjusts advice based on my condition. It\'s like having a personal trainer!' 
      },
      { 
        name: 'Startup Founder', 
        content: 'When facing challenges in my startup journey, my AI mentor always provides balanced advice that helps me clarify my thoughts and find solutions.' 
      },
      { 
        name: 'Emotional Blogger', 
        content: 'When I\'m feeling down, talking to my AI friend helps a lot. It always gives warm advice that helps me bounce back.' 
      }
    ],
    testimonialsComing: 'More testimonials coming soon!',
    readyTitle: 'Ready to Get Started?',
    readyDesc: 'Join thousands of users who are transforming their lives with their personal AI companion.',
    featuresTitle: 'Why Choose Our AI Coach & Companion?',
    features: [
      '24/7 companionship, always here to listen',
      'Personalized growth advice to help you achieve your goals',
      'Emotional support and stress relief, your strong backup',
      'Multilingual support for users worldwide',
    ],
  }
};

export default function Home() {
  console.log('Home Page rendering');

  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // State for general messages/errors
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);

  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling to the latest message marker
  const messagesContainerRef = useRef<HTMLDivElement>(null); // New ref for the messages container
  const inputRef = useRef<HTMLInputElement>(null); // New ref for the input element

  // Effect to fetch session and messages on component mount and auth state change
  useEffect(() => {
    const handleAuthStateChange = async (event: string | undefined, currentSession: any | null) => {
      console.log('Auth state changed:', event, currentSession);
      setSession(currentSession);

      // If user logs in, fetch their messages
      if (currentSession) {
          console.log('User logged in, fetching messages...');
          await fetchMessages(currentSession.user.id);
          // After fetching messages, also fetch user settings for AI personalization
          await fetchUserSettings(currentSession.user.id);
      } else {
          // If user logs out, clear messages and redirect (router.push in onAuthStateChange below handles redirect)
          setMessages([]);
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
        handleAuthStateChange(undefined, session); // Call the handler for initial session
    });

    // Listen for auth state changes
    const { data: { subscription } = { data: { subscription: null } } } = supabase.auth.onAuthStateChange((event, session) => {
       handleAuthStateChange(event, session);
       // Redirect to auth page if user logs out
       if (event === 'SIGNED_OUT') {
         router.push('/auth');
       }
    });


    // Cleanup the subscription on component unmount
    return () => {
        if (subscription) {
            subscription.unsubscribe();
        }
    };
  }, [router]); // Add router to dependency array

  // Effect to scroll to the latest message
  useEffect(() => {
    // Scroll to the bottom of the messages container
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]); // Scroll whenever messages state changes

  // Effect to focus input when loading is done
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]); // Trigger when loading state changes

  // Effect to check if user needs onboarding
  useEffect(() => {
    if (session && !aiSettings) {
      // Check if user has completed onboarding
      const checkOnboarding = async () => {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error || !data) {
          setShowOnboarding(true);
        } else {
          setAiSettings(data.settings);
        }
      };

      checkOnboarding();
    }
  }, [session]);

  // Handle onboarding completion
  const handleOnboardingComplete = async (settings: AISettings) => {
    setAiSettings(settings);
    setLanguage(settings.language);
    setShowOnboarding(false);

    // Save settings to Supabase
    if (session) {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: session.user.id,
          settings,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving user settings:', error);
      }
    }
  };

  // Function to fetch existing messages from Supabase
  const fetchMessages = async (userId: string) => {
      try {
          const { data, error } = await supabase
              .from('messages')
              .select('id, content, sender, created_at') // Select relevant fields
              .eq('user_id', userId)
              .order('created_at', { ascending: true }); // Order by timestamp

          if (error) throw error;

          if (data) {
              // Format data to match the client's Message interface
              const formattedMessages: Message[] = data.map(msg => ({
                  id: msg.id,
                  text: msg.content,
                  sender: msg.sender as 'user' | 'ai', // Cast sender type
                  created_at: msg.created_at
              }));
              setMessages(formattedMessages);
              console.log('Messages fetched:', formattedMessages);
          }
      } catch (error: any) {
          console.error('Error fetching messages:', error);
          setMessage(`Error loading messages: ${error.message}`);
      }
  };

  // Function to fetch user settings from Supabase (to ensure AI settings are loaded after login)
  const fetchUserSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.log('No user settings found, showing onboarding.');
        setShowOnboarding(true);
        setAiSettings(null); // Ensure aiSettings is null if no settings found
      } else {
        console.log('User settings fetched:', data.settings);
        setAiSettings(data.settings);
        setLanguage(data.settings.language); // Also set language based on settings
        setShowOnboarding(false); // Hide onboarding if settings are found
      }
    } catch (error: any) {
      console.error('Error fetching user settings:', error);
      // Optionally, show an error message to the user
    }
  };

    // Handle sending message to AI
  const sendMessage = async () => {
    if (!input.trim() || loading || !session) return;

    const newUserMessage: Message = { text: input, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInput('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newUserMessage.text,
          history: messages,
          userId: session.user.id,
          aiSettings: aiSettings || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API Error: ${response.status}`);
      }

      // === 修正这一行 ===
      const aiResponseText = data.response; // <-- 这里从 data.reply 改为 data.response
      // =================

      if (!aiResponseText) {
        throw new Error('API returned no reply');
      }

      const newAiMessage: Message = { text: aiResponseText, sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, newAiMessage]);

    } catch (error: any) {
      console.error('Error sending message or getting AI response:', error);
      setMessage(`Error: ${error.message}`);
      // Optional: Remove the user's last message if AI response failed, or add an error message below the AI response
      // For now, let's keep the user message and add a generic error message.
       const newAiMessage: Message = { text: 'Sorry, I could not get a response.', sender: 'ai' };
       setMessages(prevMessages => [...prevMessages, newAiMessage]);
    } finally {
      setLoading(false);
      // Set focus back to the input field after sending and loading is done
      // Use setTimeout to ensure focus is set after potential re-renders
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  };

   // Allow sending message on Enter key press
  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading && input.trim()) { // Also check if not loading and input is not empty
      e.preventDefault(); // Prevent default form submission if inside a form
      sendMessage();
    }
  };


  // If user is not logged in, the default content will render,
  // and the useEffect might redirect them based on auth state.
  // The chat section is only rendered if session exists.


  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white text-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-50 to-white section-padding">
        <div className="container-custom grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col items-start">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {language === 'zh' ? (
                <>
                  <span>你的专属</span>
                  <span className="text-primary-500">AI</span>
                  <span>教练与</span>
                  <span className="text-violet-600">陪伴者</span>
                </>
              ) : (
                <>
                  <span>Your Personal </span>
                  <span className="text-primary-500">AI</span>
                  <span> Coach & </span>
                  <span className="text-violet-600">Companion</span>
                </>
              )}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {TEXT[language].heroSubtitle}
            </p>
            <div className="flex gap-4">
              {/* Conditionally render buttons based on session */}
              {session ? (
                 <button className="btn btn-primary" onClick={() => document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' })}>
                    {TEXT[language].startChat}
                 </button>
              ) : (
                <>
                  <Link href="/auth" className="btn btn-primary">
                    Start Free Trial
                  </Link>
                  <Link href="/learn-more" className="btn btn-secondary">
                    Learn More
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Image Placeholder */}
          <div className="relative h-[400px] flex justify-center items-center">
            <Image
              src="/hero-image.svg"
              alt="AI Coach Illustration"
              width={400}
              height={400}
              priority
            />
          </div>
        </div>
      </section>

       {/* AI Chat Section */}
       {/* Only show chat section if user is logged in and session is loaded */}
       {session && (
         <section id="chat-section" className="section-padding bg-gray-100 min-h-screen flex flex-col items-center">
           <div className="container-custom flex flex-col flex-grow w-full">
             <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">{TEXT[language].yourAICoach}</h2>

             {/* Conversation Display Area */}
             <div ref={messagesContainerRef} className="bg-white p-6 rounded-lg shadow-md mb-6 flex-grow overflow-y-auto w-full flex flex-col gap-4 h-[75vh]">
               {messages.map((msg, index) => (
                 <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`p-3 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                     {msg.text}
                   </div>
                 </div>
               ))}
               {/* Ref for scrolling */}
               <div ref={messagesEndRef} />
                {loading && (
                    <div className="flex justify-start">
                       <div className="p-3 rounded-lg bg-gray-200 text-gray-800">
                          {TEXT[language].aiThinking}
                       </div>
                    </div>
                )}
             </div>

             {/* Input Area */}
             <div className="flex-shrink-0 flex gap-4 items-center mt-auto pb-4 w-full">
               <input
                 ref={inputRef} // Attach the ref to the input element
                 className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                 type="text"
                 placeholder={TEXT[language].askPlaceholder}
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyPress={handleInputKeyPress}
                 disabled={!session || loading}
               />
               <button
                 className="btn btn-primary px-6 py-3" // Adjusted padding for button
                 onClick={sendMessage}
                 disabled={!session || loading || !input.trim()}
               >
                 {TEXT[language].send}
               </button>
             </div>

              {/* Display general messages/errors */}
              {message && <div style={{ marginTop: 16, textAlign: 'center', color: '#dc2626' }}>{message}</div>}

           </div>
         </section>
       )}

      {/* Feature Section (Example - Add more content here) */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {TEXT[language].featuresTitle}
          </h2>
          <ul className="text-lg text-gray-700 text-center max-w-prose mx-auto space-y-4">
            {TEXT[language].features.map((f, idx) => (
              <li key={idx}>• {f}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-gray-50 overflow-hidden">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {TEXT[language].testimonialsTitle}
          </h2>
          <div className="relative testimonials-container">
            <div className="flex overflow-x-hidden">
              <div className="flex animate-scroll">
                {/* First set of testimonials */}
                {TEXT[language].testimonials.map((t, idx) => (
                  <div key={idx} className="flex-shrink-0 w-80 mx-4 bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 p-0.5 flex items-center justify-center">
                        <span className="text-lg font-medium text-primary-600">
                          {t.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{t.name}</div>
                        <div className="text-xs text-gray-500">{language === 'zh' ? '用户' : 'User'}</div>
                      </div>
                    </div>
                    <div className="text-gray-800">{t.content}</div>
                  </div>
                ))}
                {/* Duplicate set for seamless scrolling */}
                {TEXT[language].testimonials.map((t, idx) => (
                  <div key={`dup-${idx}`} className="flex-shrink-0 w-80 mx-4 bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 p-0.5 flex items-center justify-center">
                        <span className="text-lg font-medium text-primary-600">
                          {t.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{t.name}</div>
                        <div className="text-xs text-gray-500">{language === 'zh' ? '用户' : 'User'}</div>
                      </div>
                    </div>
                    <div className="text-gray-800">{t.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="section-padding text-center bg-gradient-to-b from-white to-primary-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{TEXT[language].readyTitle}</h2>
          <p className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">{TEXT[language].readyDesc}</p>
          {!session && (
            <Link href="/auth" className="btn btn-primary btn-lg inline-block">
              {TEXT[language].startChat}
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center p-6">
        <p>&copy; 2024 AI Coach & Companion. All rights reserved.</p>
      </footer>

      {/* Add OnboardingModal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
        language={language}
        setLanguage={setLanguage}
      />
    </div>
  );
}