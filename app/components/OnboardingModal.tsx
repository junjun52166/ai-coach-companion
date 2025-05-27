'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AISettings {
  userNickname: string;
  aiNickname: string;
  role: string;
  background: string;
  reminder: string;
  language: 'en' | 'zh';
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (settings: AISettings) => void;
  language: 'en' | 'zh';
  setLanguage: (lang: 'en' | 'zh') => void;
}

const TEXT = {
  zh: {
    chooseLanguage: '请选择语言',
    userNickname: '你希望我怎么称呼你？',
    aiNickname: '你希望我叫什么名字？',
    role: '你希望我以什么身份陪伴你？',
    background: '如果你愿意，告诉我一点你的故事',
    reminder: '你希望我提醒你什么？',
    next: '下一步',
    prev: '上一步',
    skip: '跳过',
    finish: '完成',
    placeholderUser: '比如：小明、小主...',
    placeholderAI: '比如：小光、AI教练...',
    placeholderBackground: '你的状态/目标/你想改变的一个点...',
    placeholderReminder: '比如：别再熬夜了！/ 你已经很棒了...',
    roles: [
      '理解你的朋友',
      '推你成长的教练',
      '冷静客观的分析者',
      '温柔地安慰你的人',
    ],
  },
  en: {
    chooseLanguage: 'Please select a language',
    userNickname: 'How should I call you?',
    aiNickname: 'What would you like to call me?',
    role: 'What role do you want me to play?',
    background: 'If you like, tell me a bit about your story',
    reminder: 'What would you like me to remind you?',
    next: 'Next',
    prev: 'Previous',
    skip: 'Skip',
    finish: 'Finish',
    placeholderUser: 'e.g. Mike, Buddy...',
    placeholderAI: 'e.g. Light, AI Coach...',
    placeholderBackground: 'Your status/goal/what you want to change...',
    placeholderReminder: 'e.g. Don\'t stay up late! You are awesome...',
    roles: [
      'Understanding friend',
      'Growth coach',
      'Calm analyst',
      'Gentle comforter',
    ],
  },
};

export default function OnboardingModal({ isOpen, onClose, onComplete, language, setLanguage }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<AISettings>({
    userNickname: '',
    aiNickname: '',
    role: '',
    background: '',
    reminder: '',
    language: language,
  });

  // 语言选择后立即切换
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as 'en' | 'zh');
    setSettings(s => ({ ...s, language: e.target.value as 'en' | 'zh' }));
  };

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      onComplete(settings);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    onComplete(settings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
      >
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {TEXT[language][
                step === 1 ? 'chooseLanguage' :
                step === 2 ? 'userNickname' :
                step === 3 ? 'aiNickname' :
                step === 4 ? 'role' :
                step === 5 ? 'background' :
                'reminder']}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {step === 1 && (
              <div>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                </select>
              </div>
            )}
            {step === 2 && (
              <input
                type="text"
                value={settings.userNickname}
                onChange={e => setSettings({ ...settings, userNickname: e.target.value })}
                placeholder={TEXT[language].placeholderUser}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            )}
            {step === 3 && (
              <input
                type="text"
                value={settings.aiNickname}
                onChange={e => setSettings({ ...settings, aiNickname: e.target.value })}
                placeholder={TEXT[language].placeholderAI}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            )}
            {step === 4 && (
              <div className="space-y-2">
                {TEXT[language].roles.map((role: string) => (
                  <button
                    key={role}
                    onClick={() => setSettings({ ...settings, role })}
                    className={`w-full p-3 text-left rounded-lg transition-colors ${
                      settings.role === role
                        ? 'bg-primary-100 border-2 border-primary-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
            {step === 5 && (
              <textarea
                value={settings.background}
                onChange={e => setSettings({ ...settings, background: e.target.value })}
                placeholder={TEXT[language].placeholderBackground}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-32"
              />
            )}
            {step === 6 && (
              <input
                type="text"
                value={settings.reminder}
                onChange={e => setSettings({ ...settings, reminder: e.target.value })}
                placeholder={TEXT[language].placeholderReminder}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            )}
          </motion.div>
        </AnimatePresence>
        <div className="mt-8 flex justify-between">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {TEXT[language].prev}
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {TEXT[language].skip}
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {step === 6 ? TEXT[language].finish : TEXT[language].next}
          </button>
        </div>
      </motion.div>
    </div>
  );
} 