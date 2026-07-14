import { useState, useRef } from 'react';
import { Upload, FileArchive, X, AlertCircle } from 'lucide-react';
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
export default function ZipUploader({
  onFileSelect,
  selectedFile
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const processFile = file => {
    if (file.type !== 'application/zip' && !file.name.endsWith('.zip')) {
      setError('Bara ZIP-filer (.zip) är tillåtna.');
      onFileSelect(null);
      return;
    }
    setError(null);
    onFileSelect(file);
  };
  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };
  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };
  const handleChange = e => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };
  const onButtonClick = () => {
    fileInputRef.current?.click();
  };
  const clearFile = () => {
    onFileSelect(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Human readable file size
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  return /*#__PURE__*/_jsxs("div", {
    className: "w-full",
    children: [/*#__PURE__*/_jsx("input", {
      ref: fileInputRef,
      type: "file",
      className: "hidden",
      accept: ".zip,application/zip",
      onChange: handleChange
    }), !selectedFile ? /*#__PURE__*/_jsxs("div", {
      onDragEnter: handleDrag,
      onDragOver: handleDrag,
      onDragLeave: handleDrag,
      onDrop: handleDrop,
      onClick: onButtonClick,
      className: `w-full py-10 px-6 rounded-3.5xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group ${isDragActive ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 scale-[0.99]' : 'border-slate-200 dark:border-elegant-border bg-white dark:bg-elegant-header hover:border-indigo-400 dark:hover:border-indigo-500/70 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`,
      children: [/*#__PURE__*/_jsx("div", {
        className: "p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-200 shadow-sm",
        children: /*#__PURE__*/_jsx(Upload, {
          className: "h-6 w-6"
        })
      }), /*#__PURE__*/_jsx("h4", {
        className: "text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1",
        children: "Dra och sl\xE4pp ditt ZIP-paket h\xE4r"
      }), /*#__PURE__*/_jsx("p", {
        className: "text-xs text-slate-500 dark:text-slate-400 mb-3 max-w-xs leading-relaxed",
        children: "eller klicka f\xF6r att bl\xE4ddra bland dina filer. Ladda upp din AI Studio export (.zip)"
      }), /*#__PURE__*/_jsx("span", {
        className: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-white/10",
        children: "Bara ZIP-format st\xF6ds"
      })]
    }) : /*#__PURE__*/_jsxs("div", {
      className: "w-full p-5 bg-white dark:bg-elegant-header border border-slate-200 dark:border-elegant-border rounded-3xl flex items-center justify-between shadow-sm",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "flex items-center gap-3.5 min-w-0",
        children: [/*#__PURE__*/_jsx("div", {
          className: "p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-2xl shadow-sm",
          children: /*#__PURE__*/_jsx(FileArchive, {
            className: "h-6 w-6"
          })
        }), /*#__PURE__*/_jsxs("div", {
          className: "min-w-0",
          children: [/*#__PURE__*/_jsx("h4", {
            className: "text-xs font-semibold text-slate-800 dark:text-slate-100 truncate pr-4",
            children: selectedFile.name
          }), /*#__PURE__*/_jsxs("p", {
            className: "text-[11px] text-slate-500 dark:text-slate-400 font-medium",
            children: [formatBytes(selectedFile.size), " \u2022 ZIP-fil"]
          })]
        })]
      }), /*#__PURE__*/_jsx("button", {
        onClick: clearFile,
        className: "btn-press p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer",
        title: "Ta bort fil",
        children: /*#__PURE__*/_jsx(X, {
          className: "h-4 w-4"
        })
      })]
    }), error && /*#__PURE__*/_jsxs("div", {
      className: "mt-3 flex items-start gap-2 text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-3 rounded-2xl",
      children: [/*#__PURE__*/_jsx(AlertCircle, {
        className: "h-4 w-4 shrink-0 mt-0.5"
      }), /*#__PURE__*/_jsx("p", {
        className: "text-xs font-medium",
        children: error
      })]
    })]
  });
}