import { useState } from 'react';
import { FileText, Loader } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TextVerificationProps {
  onVerify: (text: string) => Promise<void>;
  isLoading: boolean;
}

export const TextVerification = ({ onVerify, isLoading }: TextVerificationProps) => {
  const [text, setText] = useState('');
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      await onVerify(text.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('textPlaceholder')}
          className="w-full h-48 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
          disabled={isLoading}
        />
        <FileText className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
      </div>

      <button
        type="submit"
        disabled={!text.trim() || isLoading}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>{t('verifying')}</span>
          </>
        ) : (
          <span>{t('verifyButton')}</span>
        )}
      </button>
    </form>
  );
};
