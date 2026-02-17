import React, { useState, useCallback } from 'react';
import { FileUp, FileType, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { extractPdfText } from './utils/pdfProcessor';
import { generateEpub } from './utils/epubGenerator';

type ConversionStatus = 'idle' | 'processing' | 'completed' | 'error';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [epubBlob, setEpubBlob] = useState<Blob | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setStatus('error');
        setErrorMessage('Please select a valid PDF file.');
        return;
      }
      setFile(selectedFile);
      setStatus('idle');
      setProgress(0);
      setEpubBlob(null);
    }
  };

  const startConversion = async () => {
    if (!file) return;

    try {
      setStatus('processing');
      setProgress(5);

      const pages = await extractPdfText(file, (p) => {
        // Offset progress to account for EPUB generation step
        setProgress(Math.round(5 + (p * 0.85)));
      });

      const title = file.name.replace(/\.[^/.]+$/, "");
      const blob = await generateEpub(title, pages);
      
      setEpubBlob(blob);
      setProgress(100);
      setStatus('completed');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const downloadEpub = () => {
    if (!epubBlob || !file) return;
    const url = URL.createObjectURL(epubBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/\.[^/.]+$/, "")}.epub`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-100 p-4 rounded-full">
              <FileType className="w-12 h-12 text-indigo-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            PDF to EPUB
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Convert your documents for better mobile reading experience.
          </p>

          <div className="space-y-6">
            {/* File Input Area */}
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-indigo-400 transition-colors group">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center pointer-events-none">
                <FileUp className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 mb-2" />
                <span className="text-sm font-medium text-gray-600">
                  {file ? file.name : "Click or drag PDF here"}
                </span>
                <span className="text-xs text-gray-400 mt-1">PDF up to 50MB</span>
              </div>
            </div>

            {/* Error Message */}
            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            )}

            {/* Progress Bar */}
            {status === 'processing' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing pages...
                  </span>
                  <span className="font-semibold text-indigo-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Completed Message */}
            {status === 'completed' && (
              <div className="flex flex-col items-center gap-2 text-green-700 bg-green-50 p-6 rounded-xl border border-green-100">
                <CheckCircle2 className="w-10 h-10 mb-2" />
                <p className="font-bold">Conversion Successful!</p>
                <p className="text-sm text-green-600 opacity-80 mb-4">Your EPUB is ready for download.</p>
                <button
                  onClick={downloadEpub}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md"
                >
                  <Download className="w-5 h-5" />
                  Download EPUB
                </button>
              </div>
            )}

            {/* Main Action Button */}
            {status !== 'completed' && (
              <button
                onClick={startConversion}
                disabled={!file || status === 'processing'}
                className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                  ${!file || status === 'processing' 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transform active:scale-[0.98]'
                  }`}
              >
                {status === 'processing' ? 'Converting...' : 'Start Conversion'}
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 border-t border-gray-100">
          <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-semibold leading-relaxed">
            All processing happens in your browser<br/>Files are never uploaded to a server
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
