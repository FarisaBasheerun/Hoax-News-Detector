import { Shield, Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {t('appTitle')}
              </h1>
              <p className="text-xs text-gray-500">{t('tagline')}</p>
            </div>
          </div>

          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            aria-label="Toggle language"
          >
            <Languages className="h-5 w-5 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">
              {language === 'en' ? 'தமிழ்' : 'English'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
