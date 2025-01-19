import { Upload } from 'lucide-react'

interface UploadAreaProps {
  isDragging: boolean;
  isUploading: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadArea({
  isDragging,
  isUploading,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect
}: UploadAreaProps) {
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 text-center mb-8 relative ${
        isDragging ? 'border-primary bg-primary/10' : 'border-border'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".pdf"
        multiple
        onChange={onFileSelect}
      />
      <label
        htmlFor="file-upload"
        className="mx-auto w-fit block cursor-pointer"
      >
        <Upload className={`h-12 w-12 mx-auto mb-4 ${isUploading ? 'animate-bounce' : ''} ${
          isDragging ? 'text-primary' : 'text-muted-foreground'
        }`} />
        <h3 className="text-lg font-medium mb-1">
          {isUploading ? 'Uploading...' : 'Drag & Drop your PDF files here'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isUploading ? 'Please wait...' : 'Or click to upload'}
        </p>
      </label>
    </div>
  )
}
