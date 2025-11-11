import { useState } from 'react';
import { Header } from './components/Header';
import { TextVerification } from './components/TextVerification';
import { MediaUpload } from './components/MediaUpload';
import { VerificationResult } from './components/VerificationResult';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ContentType, VerificationResponse } from './types';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState<ContentType>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const { t } = useLanguage();

  const verifyContent = async (content: string, type: ContentType) => {
    setIsLoading(true);
    setResult(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/verify-news`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            contentType: type,
            content,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextVerify = async (text: string) => {
    await verifyContent(text, 'text');
  };

  const handleMediaVerify = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await verifyContent(base64, activeTab as 'image' | 'video');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 pb-3 px-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'text'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('textTab')}
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`flex-1 pb-3 px-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'image'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('imageTab')}
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`flex-1 pb-3 px-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'video'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('videoTab')}
            </button>
          </div>

          <div className="mt-6">
            {activeTab === 'text' && (
              <TextVerification onVerify={handleTextVerify} isLoading={isLoading} />
            )}
            {activeTab === 'image' && (
              <MediaUpload type="image" onVerify={handleMediaVerify} isLoading={isLoading} />
            )}
            {activeTab === 'video' && (
              <MediaUpload type="video" onVerify={handleMediaVerify} isLoading={isLoading} />
            )}
          </div>

          {result && <VerificationResult result={result} />}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('sources')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { en: 'BBC News', ta: 'பிபிசி செய்திகள்', url: 'https://www.bbc.com/news' },
              { en: 'Reuters', ta: 'ராய்ட்டர்ஸ்', url: 'https://www.reuters.com' },
              { en: 'The Hindu', ta: 'தி இந்து', url: 'https://www.thehindu.com' },
              { en: 'Dinamalar', ta: 'தினமலர்', url: 'https://www.dinamalar.com' },
            ].map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="text-sm text-gray-700">{source.en}</span>
                <span className="text-xs text-gray-500">{source.ta}</span>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
