import { Upload } from "lucide-react";
import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      
      if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
        toast({
          title: t('error.title'),
          description: t('error.noFile'),
          variant: "destructive",
        });
        return;
      }
      
      onFileSelect(file);
      toast({
        title: t('upload.fileLoaded'),
        description: `${file.name}`,
      });
    }
  };

  return (
    <Card className="border-2 border-dashed border-border hover:border-primary transition-all duration-300 bg-card/50 backdrop-blur">
      <label className="flex flex-col items-center justify-center p-12 cursor-pointer group">
        <Upload className="w-16 h-16 text-muted-foreground group-hover:text-primary transition-colors duration-300 mb-4" />
        <span className="text-lg font-medium text-foreground mb-2">
          {t('upload.title')}
        </span>
        <span className="text-sm text-muted-foreground text-center">
          {t('upload.formats')}
        </span>
        <input
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
        />
      </label>
    </Card>
  );
};
