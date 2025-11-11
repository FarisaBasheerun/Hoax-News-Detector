import { useState, useRef } from 'react';
import { Upload, X, Loader, Image as ImageIcon, Video } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MediaUploadProps {
  type: 'image' | 'video';
  onVerify: (file: File) => Promise<void>;
  isLoading: boolean;
}

export const MediaUpload = ({ type, onVerify, isLoading }: MediaUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes =
      type === 'image'
        ? ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        : ['video/mp4', 'video/webm'];

    if (!validTypes.includes(file.type)) {
      return;
    }

    setFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      await onVerify(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!file ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={type === 'image' ? 'image/*' : 'video/*'}
            onChange={handleChange}
            disabled={isLoading}
          />

          <div
            className="flex flex-col items-center justify-center space-y-3 cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            {type === 'image' ? (
              <ImageIcon className="h-12 w-12 text-gray-400" />
            ) : (
              <Video className="h-12 w-12 text-gray-400" />
            )}

            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                {type === 'image' ? t('uploadImage') : t('uploadVideo')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {type === 'image' ? t('imageSupport') : t('videoSupport')}
              </p>
            </div>

            <Upload className="h-6 w-6 text-gray-400" />
          </div>
        </div>
      ) : (
        <div className="relative border-2 border-gray-300 rounded-lg p-4">
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>

          {type === 'image' ? (
            <img
              src={preview!}
              alt="Preview"
              className="w-full h-64 object-contain rounded"
            />
          ) : (
            <video
              src={preview!}
              controls
              className="w-full h-64 rounded"
            />
          )}

          <p className="text-sm text-gray-600 mt-2 truncate">{file.name}</p>
        </div>
      )}

      {file && (
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              <span>{t('verifying')}</span>
            </>
          ) : (
            <span>{t('verifyButton')}</span>
          )}
        </button>
      )}
    </form>
  );
};
