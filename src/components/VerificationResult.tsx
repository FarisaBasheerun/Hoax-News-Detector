import { CheckCircle, XCircle, AlertCircle, Calendar, ExternalLink, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { VerificationResponse } from '../types';

interface VerificationResultProps {
  result: VerificationResponse;
}

export const VerificationResult = ({ result }: VerificationResultProps) => {
  const { language, t } = useLanguage();

  const getResultIcon = () => {
    switch (result.result) {
      case 'true':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'fake':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <AlertCircle className="h-12 w-12 text-yellow-500" />;
    }
  };

  const getResultColor = () => {
    switch (result.result) {
      case 'true':
        return 'bg-green-50 border-green-200';
      case 'fake':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  const getResultText = () => {
    switch (result.result) {
      case 'true':
        return t('authentic');
      case 'fake':
        return t('fake');
      default:
        return t('uncertain');
    }
  };

  const getClassificationText = () => {
    switch (result.classification) {
      case 'man_made':
        return t('manMade');
      case 'ai_generated':
        return t('aiGenerated');
      case 'authentic':
        return t('authenticContent');
      default:
        return t('uncertainContent');
    }
  };

  const getClassificationColor = () => {
    switch (result.classification) {
      case 'man_made':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'ai_generated':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'authentic':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'ta-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="mt-8 animate-fadeIn">
      <div className={`border-2 rounded-lg p-6 ${getResultColor()}`}>
        <div className="flex items-center space-x-4 mb-4">
          {getResultIcon()}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{getResultText()}</h2>
            <p className="text-sm text-gray-600">{t('resultTitle')}</p>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{t('classification')}:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getClassificationColor()}`}
            >
              {getClassificationText()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{t('confidence')}:</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {Math.round(result.confidence * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {result.details && Object.keys(result.details).length > 0 && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            {t('details')}
          </h3>

          <div className="space-y-4">
            {result.details.title_en && (
              <div>
                <p className="text-sm font-medium text-gray-500">{t('originalSource')}</p>
                <p className="text-base text-gray-900 mt-1">
                  {language === 'en' ? result.details.title_en : result.details.title_ta}
                </p>
              </div>
            )}

            {result.details.source_name_en && (
              <div>
                <p className="text-sm font-medium text-gray-500">{t('verifiedBy')}</p>
                <p className="text-base text-gray-900 mt-1">
                  {language === 'en'
                    ? result.details.source_name_en
                    : result.details.source_name_ta}
                </p>
              </div>
            )}

            {result.details.published_date && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('publishedDate')}</p>
                  <p className="text-base text-gray-900">
                    {formatDate(result.details.published_date)}
                  </p>
                </div>
              </div>
            )}

            {result.details.analysis_en && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">{t('analysis')}</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {language === 'en'
                    ? result.details.analysis_en
                    : result.details.analysis_ta}
                </p>
              </div>
            )}

            {result.details.original_url && (
              <a
                href={result.details.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
              >
                <ExternalLink className="h-4 w-4" />
                <span>{t('viewSource')}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
