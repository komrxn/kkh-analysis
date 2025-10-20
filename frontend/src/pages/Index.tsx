import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { AnalysisConfig, AnalysisParams } from "@/components/AnalysisConfig";
import { ResultsTable, AnovaResult } from "@/components/ResultsTable";
import { InteractiveBoxplot, BoxplotData } from "@/components/InteractiveBoxplot";
import { PCAResults, PCAResult } from "@/components/PCAResults";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, BarChart3, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { config } from "@/config";

const Index = () => {
  const { t, language, setLanguage } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMethod, setAnalysisMethod] = useState<'anova' | 'pca'>('anova');
  const [results, setResults] = useState<AnovaResult[]>([]);
  const [boxplotData, setBoxplotData] = useState<BoxplotData[][]>([]);
  const [pcaResults, setPcaResults] = useState<PCAResult | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResults([]);
    setBoxplotData([]);
    setPcaResults(null);
  };

  const handleRunAnalysis = async (params: AnalysisParams) => {
    if (!selectedFile) {
      toast({
        title: t('error.title'),
        description: t('error.noFile'),
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisMethod(params.method);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      if (params.method === 'anova') {
        // Call ANOVA API
        formData.append('fdr_threshold', params.fdrThreshold.toString());
        formData.append('design_label', params.designLabel);
        formData.append('plot_option', params.plotOption.toString());
        
        const response = await fetch(`${config.apiUrl}/api/analyze/anova`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'ANOVA analysis failed');
        }
        
        const data = await response.json();
        
        setResults(data.results);
        setBoxplotData(data.boxplot_data);
        setPcaResults(null);
        
        toast({
          title: t('results.completed'),
          description: t('results.foundSignificant').replace('{count}', String(data.summary.benjamini_significant)),
        });
      } else {
        // Call PCA API
        formData.append('num_pcs', params.numPCs.toString());
        formData.append('scaling_method', params.scalingMethod);
        formData.append('design_label', params.designLabel);
        
        const response = await fetch(`${config.apiUrl}/api/analyze/pca`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'PCA analysis failed');
        }
        
        const data = await response.json();
        
        setPcaResults(data);
        setResults([]);
        setBoxplotData([]);
        
        toast({
          title: t('results.completed'),
          description: `PCA: ${params.numPCs} ${t('config.pcs').toLowerCase()}, ${data.summary.total_variance_explained.toFixed(1)}% variance`,
        });
      }
    } catch (error) {
      toast({
        title: t('error.title'),
        description: error instanceof Error ? error.message : 'Analysis failed',
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
    toast({
      title: t('error.export'),
      description: t('error.exporting'),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-card/30 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t('app.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('app.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'ru')}>
                <SelectTrigger className="w-[120px]">
                  <Languages className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                </SelectContent>
              </Select>
              {(results.length > 0 || pcaResults) && (
                <Button onClick={handleExport} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  {t('header.export')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <FileUpload onFileSelect={handleFileSelect} />
            {selectedFile && (
              <div className="mt-4 p-4 bg-card/50 backdrop-blur rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">{t('upload.fileLoaded')}</p>
                <p className="text-foreground font-medium">{selectedFile.name}</p>
              </div>
            )}
          </div>

          {/* Config Section */}
          <div>
            <AnalysisConfig 
              onRunAnalysis={handleRunAnalysis}
              disabled={!selectedFile || isAnalyzing}
            />
          </div>
        </div>

        {/* Results Section */}
        {isAnalyzing && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t('results.analyzing')}</p>
            </div>
          </div>
        )}

        {analysisMethod === 'anova' && results.length > 0 && !isAnalyzing && (
          <div className="space-y-6">
            <ResultsTable results={results} />

            {/* Boxplots */}
            <div className="grid md:grid-cols-2 gap-6">
              {boxplotData.slice(0, 4).map((data, idx) => (
                <InteractiveBoxplot
                  key={idx}
                  data={data}
                  variable={results[idx]?.variable || `Variable ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {analysisMethod === 'pca' && pcaResults && !isAnalyzing && (
          <PCAResults results={pcaResults} />
        )}

        {/* Empty State */}
        {!selectedFile && !isAnalyzing && results.length === 0 && !pcaResults && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {t('empty.title')}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('empty.description')}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
