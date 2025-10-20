import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export interface AnovaResult {
  variable: string;
  pValue: number;
  fdr: number;
  bonferroni: number;
  benjamini: boolean;
}

interface ResultsTableProps {
  results: AnovaResult[];
}

export const ResultsTable = ({ results }: ResultsTableProps) => {
  const { t } = useLanguage();

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader>
        <CardTitle>{t('results.title')}</CardTitle>
        <CardDescription>
          ANOVA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-muted">
                <TableRow>
                  <TableHead className="font-semibold">{t('results.variable')}</TableHead>
                  <TableHead className="font-semibold">{t('results.pValue')}</TableHead>
                  <TableHead className="font-semibold">{t('results.fdr')}</TableHead>
                  <TableHead className="font-semibold">{t('results.bonferroni')}</TableHead>
                  <TableHead className="font-semibold text-center">{t('results.significant')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{result.variable}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {result.pValue.toExponential(3)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {result.fdr.toExponential(3)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {result.bonferroni.toExponential(3)}
                    </TableCell>
                    <TableCell className="text-center">
                      {result.benjamini ? (
                        <Badge variant="default" className="bg-success hover:bg-success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {t('results.significant')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="w-3 h-3 mr-1" />
                          {t('results.significant')}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
