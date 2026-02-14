import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface UploadSectionProps {
  onFileUpload: (file: File) => void;
}

export const UploadSection = ({ onFileUpload }: UploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && isValidFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      setSelectedFile(file);
    }
  };

  const isValidFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-8">
        <motion.div
          className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <i className="ri-file-upload-line text-2xl text-white" />
        </motion.div>
        <motion.h2
          className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Upload Your Resume
        </motion.h2>
        <motion.p
          className="text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Get instant AI-powered analysis and recommendations
        </motion.p>
      </div>

      {!selectedFile ? (
        <motion.div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className="mb-6"
            animate={{ y: isDragging ? -5 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <i className="ri-cloud-upload-line text-6xl text-gray-400 dark:text-gray-500 mb-4 block" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {isDragging ? 'Drop your resume here' : 'Drag & drop your resume'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              or click to browse files
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <i className="ri-file-pdf-line" />
                PDF
              </span>
              <span className="flex items-center gap-1">
                <i className="ri-file-word-line" />
                DOCX
              </span>
              <span className="flex items-center gap-1">
                <i className="ri-file-text-line" />
                TXT
              </span>
            </div>
          </motion.div>

          <motion.button
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Choose File
          </motion.button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>
      ) : (
        <motion.div
          className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <i className="ri-file-text-line text-xl text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {selectedFile.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <i className="ri-close-line text-xl" />
            </button>
          </div>

          <motion.button
            onClick={handleUpload}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <i className="ri-ai-generate text-xl" />
            Analyze Resume
          </motion.button>
        </motion.div>
      )}

      <motion.div
        className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-start gap-3">
          <i className="ri-information-line text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-1">What we analyze:</p>
            <ul className="space-y-1 text-blue-700 dark:text-blue-400">
              <li>• Content structure and formatting</li>
              <li>• Keyword optimization and ATS compatibility</li>
              <li>• Language quality and clarity</li>
              <li>• Missing sections and improvement opportunities</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};