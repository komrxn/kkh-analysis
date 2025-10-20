import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Header
    'app.title': 'ANOVA Analysis Platform',
    'app.subtitle': 'Statistical Analysis and Visualization',
    'header.export': 'Export',
    
    // File Upload
    'upload.title': 'Upload Data File',
    'upload.description': 'Drag and drop or click to upload CSV or Excel files',
    'upload.formats': 'Supported formats: .csv, .xlsx, .xls',
    'upload.fileLoaded': 'File loaded:',
    
    // Analysis Config
    'config.title': 'Analysis Configuration',
    'config.method': 'Analysis Method',
    'config.method.anova': 'One-Way ANOVA',
    'config.method.pca': 'PCA (Principal Component Analysis)',
    'config.fdrThreshold': 'FDR Threshold',
    'config.designLabel': 'Design Label',
    'config.pcs': 'Number of PCs',
    'config.scaling': 'Scaling Method',
    'config.scaling.auto': 'Auto Scaling',
    'config.scaling.mean': 'Mean Centering',
    'config.scaling.pareto': 'Pareto Scaling',
    'config.plotOption': 'Plot Option',
    'config.runAnalysis': 'Run Analysis',
    
    // Results
    'results.title': 'Analysis Results',
    'results.variable': 'Variable',
    'results.pValue': 'P-Value',
    'results.fdr': 'FDR',
    'results.bonferroni': 'Bonferroni',
    'results.significant': 'Significant',
    'results.analyzing': 'Analyzing data...',
    'results.completed': 'Analysis completed',
    'results.foundSignificant': 'Found {count} significant variables',
    
    // PCA Results
    'pca.scoresPlot': 'PCA Scores Plot',
    'pca.screePlot': 'Scree Plot',
    'pca.varianceExplained': 'Explained Variance',
    'pca.cumulativeVariance': 'Cumulative Variance',
    
    // Empty State
    'empty.title': 'Start by uploading data',
    'empty.description': 'Upload a CSV or Excel file with your data to perform statistical analysis',
    
    // Errors
    'error.title': 'Error',
    'error.noFile': 'Please upload a data file',
    'error.export': 'Exporting data',
    'error.exporting': 'Exporting results...',
  },
  ru: {
    // Header
    'app.title': 'Платформа ANOVA Анализа',
    'app.subtitle': 'Статистический анализ и визуализация',
    'header.export': 'Экспорт',
    
    // File Upload
    'upload.title': 'Загрузить файл данных',
    'upload.description': 'Перетащите или нажмите для загрузки CSV или Excel файлов',
    'upload.formats': 'Поддерживаемые форматы: .csv, .xlsx, .xls',
    'upload.fileLoaded': 'Загружен файл:',
    
    // Analysis Config
    'config.title': 'Настройки анализа',
    'config.method': 'Метод анализа',
    'config.method.anova': 'Однофакторный ANOVA',
    'config.method.pca': 'PCA (Метод главных компонент)',
    'config.fdrThreshold': 'Порог FDR',
    'config.designLabel': 'Метка дизайна',
    'config.pcs': 'Количество ГК',
    'config.scaling': 'Метод масштабирования',
    'config.scaling.auto': 'Автомасштабирование',
    'config.scaling.mean': 'Центрирование',
    'config.scaling.pareto': 'Масштабирование Парето',
    'config.plotOption': 'Опции графика',
    'config.runAnalysis': 'Запустить анализ',
    
    // Results
    'results.title': 'Результаты анализа',
    'results.variable': 'Переменная',
    'results.pValue': 'P-значение',
    'results.fdr': 'FDR',
    'results.bonferroni': 'Бонферрони',
    'results.significant': 'Значимая',
    'results.analyzing': 'Выполняется анализ...',
    'results.completed': 'Анализ завершен',
    'results.foundSignificant': 'Найдено {count} значимых переменных',
    
    // PCA Results
    'pca.scoresPlot': 'График счетов PCA',
    'pca.screePlot': 'График каменистой осыпи',
    'pca.varianceExplained': 'Объясненная дисперсия',
    'pca.cumulativeVariance': 'Кумулятивная дисперсия',
    
    // Empty State
    'empty.title': 'Начните с загрузки данных',
    'empty.description': 'Загрузите CSV или Excel файл с вашими данными для выполнения статистического анализа',
    
    // Errors
    'error.title': 'Ошибка',
    'error.noFile': 'Пожалуйста, загрузите файл данных',
    'error.export': 'Экспорт данных',
    'error.exporting': 'Результаты экспортируются...',
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ru');

  const t = (key: string, params?: Record<string, string | number>) => {
    let text = translations[language][key as keyof typeof translations['en']] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, String(value));
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
