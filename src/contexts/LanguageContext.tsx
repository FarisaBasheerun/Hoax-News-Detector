import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    appTitle: 'Fake News Detector',
    tagline: 'Verify authenticity of news content instantly',
    textTab: 'Text',
    imageTab: 'Image',
    videoTab: 'Video',
    textPlaceholder: 'Paste news text here to verify...',
    verifyButton: 'Verify Content',
    uploadImage: 'Click to upload image or drag and drop',
    uploadVideo: 'Click to upload video or drag and drop',
    imageSupport: 'PNG, JPG, WEBP up to 10MB',
    videoSupport: 'MP4, WEBM up to 50MB',
    verifying: 'Verifying...',
    resultTitle: 'Verification Result',
    authentic: 'Authentic News',
    fake: 'Fake News Detected',
    uncertain: 'Uncertain',
    classification: 'Classification',
    manMade: 'Man-Made False News',
    aiGenerated: 'AI-Generated Content',
    authenticContent: 'Authentic Content',
    uncertainContent: 'Uncertain Classification',
    confidence: 'Confidence',
    details: 'Details',
    originalSource: 'Original Source',
    publishedDate: 'Published Date',
    verifiedBy: 'Verified By',
    noMatch: 'No matching verified content found in our database',
    analysis: 'Analysis',
    sources: 'Trusted Sources',
    viewSource: 'View Source',
  },
  ta: {
    appTitle: 'போலி செய்தி கண்டறிதல்',
    tagline: 'செய்தி உள்ளடக்கத்தின் உண்மைத்தன்மையை உடனடியாக சரிபார்க்கவும்',
    textTab: 'உரை',
    imageTab: 'படம்',
    videoTab: 'வீடியோ',
    textPlaceholder: 'சரிபார்க்க செய்தி உரையை இங்கே ஒட்டவும்...',
    verifyButton: 'உள்ளடக்கத்தை சரிபார்க்கவும்',
    uploadImage: 'பதிவேற்ற படத்தை கிளிக் செய்யவும் அல்லது இழுத்து விடவும்',
    uploadVideo: 'பதிவேற்ற வீடியோவை கிளிக் செய்யவும் அல்லது இழுத்து விடவும்',
    imageSupport: '10MB வரை PNG, JPG, WEBP',
    videoSupport: '50MB வரை MP4, WEBM',
    verifying: 'சரிபார்க்கப்படுகிறது...',
    resultTitle: 'சரிபார்ப்பு முடிவு',
    authentic: 'உண்மையான செய்தி',
    fake: 'போலி செய்தி கண்டறியப்பட்டது',
    uncertain: 'நிச்சயமற்றது',
    classification: 'வகைப்பாடு',
    manMade: 'மனிதனால் உருவாக்கப்பட்ட தவறான செய்தி',
    aiGenerated: 'செயற்கை நுண்ணறிவால் உருவாக்கப்பட்டது',
    authenticContent: 'உண்மையான உள்ளடக்கம்',
    uncertainContent: 'நிச்சயமற்ற வகைப்பாடு',
    confidence: 'நம்பிக்கை',
    details: 'விவரங்கள்',
    originalSource: 'அசல் ஆதாரம்',
    publishedDate: 'வெளியிடப்பட்ட தேதி',
    verifiedBy: 'சரிபார்க்கப்பட்டது',
    noMatch: 'எங்கள் தரவுத்தளத்தில் பொருத்தமான சரிபார்க்கப்பட்ட உள்ளடக்கம் கிடைக்கவில்லை',
    analysis: 'பகுப்பாய்வு',
    sources: 'நம்பகமான ஆதாரங்கள்',
    viewSource: 'ஆதாரத்தைப் பார்க்கவும்',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ta' : 'en'));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
