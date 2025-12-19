"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileIcon, X, UploadIcon, FileTextIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  className?: string;
  onFilesChange?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  disabled?: boolean;
  description?: string;
}

export function FileUpload({
  className,
  onFilesChange,
  accept = ".csv",
  multiple = false,
  maxSize = 5, // Default 5MB
  maxFiles = 1,
  disabled = false,
  description = "Drop your file here or click to browse",
}: FileUploadProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    setError(null);
    const fileArray = Array.from(selectedFiles);
    
    // Check max files
    if (multiple && fileArray.length + files.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files`);
      return;
    }
    
    // Check file size
    const oversizedFiles = fileArray.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed the ${maxSize}MB limit`);
      return;
    }
    
    // Set files
    const newFiles = multiple ? [...files, ...fileArray] : fileArray;
    setFiles(newFiles);
    if (onFilesChange) {
      onFilesChange(newFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!disabled) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    if (onFilesChange) {
      onFilesChange(newFiles);
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 transition-all flex flex-col items-center justify-center cursor-pointer",
          isDragging ? "border-whatsapp bg-whatsapp/5" : "border-muted-foreground/25",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-muted-foreground/50",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={{ 
            scale: isDragging ? 1.05 : 1,
            y: isDragging ? -5 : 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="flex flex-col items-center justify-center gap-4"
        >
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <UploadIcon className="h-6 w-6 text-primary" />
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium">{description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {accept === ".csv" 
                ? "CSV files only" 
                : `Supported formats: ${accept.replace(/\./g, "").toUpperCase()}`}
            </p>
            <p className="text-xs text-muted-foreground">
              Max size: {maxSize}MB
            </p>
          </div>
        </motion.div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileChange(e.target.files)}
          disabled={disabled}
          className="hidden"
        />
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-destructive flex items-center gap-1"
        >
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </motion.div>
      )}
      
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <AnimatePresence>
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between bg-card rounded-md p-3 border text-sm"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {file.name.endsWith('.csv') ? (
                    <FileTextIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <FileIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  )}
                  <div className="truncate">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <Button
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
