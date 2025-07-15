import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileImage, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  currentImageUrl?: string;
  className?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export function ImageUpload({
  onFileSelect,
  onFileRemove,
  currentImageUrl,
  className,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}: ImageUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File troppo grande. Massimo ${maxSize}MB consentito.`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Formato file non supportato. Utilizza JPG, PNG, GIF o WebP.');
      } else {
        setError('Errore nel caricamento del file.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Simulate upload progress
      setIsUploading(true);
      setUploadProgress(0);
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsUploading(false);
            onFileSelect(file);
            return 100;
          }
          return prev + 10;
        });
      }, 50);
    }
  }, [onFileSelect, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const handleRemove = () => {
    setError(null);
    setUploadProgress(0);
    onFileRemove();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {currentImageUrl && !isUploading ? (
          <motion.div
            key="current-image"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-0">
                <div className="relative group">
                  <img
                    src={currentImageUrl}
                    alt="Current image"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemove}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Rimuovi
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="upload-area"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              className={`relative overflow-hidden transition-all duration-200 ${
                dragActive || isDragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <CardContent className="p-6">
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  
                  {isUploading ? (
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Caricamento in corso...
                      </p>
                      <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {uploadProgress}% completato
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${
                        dragActive || isDragActive 
                          ? 'bg-blue-100 dark:bg-blue-900' 
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <FileImage className={`w-8 h-8 ${
                          dragActive || isDragActive 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-400'
                        }`} />
                      </div>
                      
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {dragActive || isDragActive 
                          ? 'Rilascia qui il file' 
                          : 'Clicca per caricare o trascina qui'
                        }
                      </p>
                      
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          Massimo {maxSize}MB
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          JPG, PNG, GIF, WebP
                        </Badge>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="pointer-events-none"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Seleziona File
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-2"
          >
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}