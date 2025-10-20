import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Settings2, Play } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export type AnalysisMethod = 'anova' | 'pca';

export interface AnalysisParams {
  method: AnalysisMethod;
  fdrThreshold: number;
  designLabel: string;
  plotOption: number;
  numPCs: number;
  scalingMethod: string;
}

interface AnalysisConfigProps {
  onRunAnalysis: (params: AnalysisParams) => void;
  disabled?: boolean;
}

export const AnalysisConfig = ({ onRunAnalysis, disabled }: AnalysisConfigProps) => {
  const { t } = useLanguage();
  const [method, setMethod] = useState<AnalysisMethod>('anova');
  const [fdrThreshold, setFdrThreshold] = useState(0.05);
  const [designLabel, setDesignLabel] = useState("Treatment");
  const [plotOption, setPlotOption] = useState(3);
  const [numPCs, setNumPCs] = useState(3);
  const [scalingMethod, setScalingMethod] = useState("auto");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRunAnalysis({ method, fdrThreshold, designLabel, plotOption, numPCs, scalingMethod });
  };

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" />
          <CardTitle>{t('config.title')}</CardTitle>
        </div>
        <CardDescription>
          {method === 'anova' ? 'One-Way ANOVA' : 'PCA Analysis'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="method">{t('config.method')}</Label>
            <Select value={method} onValueChange={(value) => setMethod(value as AnalysisMethod)}>
              <SelectTrigger id="method" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anova">{t('config.method.anova')}</SelectItem>
                <SelectItem value="pca">{t('config.method.pca')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {method === 'anova' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fdr">{t('config.fdrThreshold')}</Label>
                <Input
                  id="fdr"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={fdrThreshold}
                  onChange={(e) => setFdrThreshold(parseFloat(e.target.value))}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="design">{t('config.designLabel')}</Label>
                <Input
                  id="design"
                  type="text"
                  value={designLabel}
                  onChange={(e) => setDesignLabel(e.target.value)}
                  placeholder="Treatment"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plot">{t('config.plotOption')}</Label>
                <Select value={plotOption.toString()} onValueChange={(v) => setPlotOption(parseInt(v))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {method === 'pca' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="pcs">{t('config.pcs')}</Label>
                <Input
                  id="pcs"
                  type="number"
                  min="2"
                  max="10"
                  value={numPCs}
                  onChange={(e) => setNumPCs(parseInt(e.target.value))}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scaling">{t('config.scaling')}</Label>
                <Select value={scalingMethod} onValueChange={setScalingMethod}>
                  <SelectTrigger id="scaling" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">{t('config.scaling.auto')}</SelectItem>
                    <SelectItem value="mean">{t('config.scaling.mean')}</SelectItem>
                    <SelectItem value="pareto">{t('config.scaling.pareto')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="design">{t('config.designLabel')}</Label>
                <Input
                  id="design"
                  type="text"
                  value={designLabel}
                  onChange={(e) => setDesignLabel(e.target.value)}
                  placeholder="Treatment"
                  className="bg-background"
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={disabled}
            className="w-full bg-primary hover:bg-primary-glow transition-all duration-300"
          >
            <Play className="w-4 h-4 mr-2" />
            {t('config.runAnalysis')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
