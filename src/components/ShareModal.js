import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
export default function ShareModal({
  isOpen,
  onClose,
  appUrl
}) {
  const [shareLink, setShareLink] = useState(appUrl);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);
  useEffect(() => {
    setShareLink(appUrl);
  }, [appUrl]);
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const generateQRCode = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Generate QR code raw data with high error correction (needed for central image overlay)
        const qrData = await QRCode.toCanvas(canvas, shareLink, {
          width: 320,
          margin: 2,
          errorCorrectionLevel: 'H',
          // High error correction (30% recovery)
          color: {
            dark: '#1e293b',
            // Deep slate slate-800
            light: '#ffffff'
          }
        });
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Load favicon
        const img = new Image();
        img.src = './favicon.svg';
        img.onload = () => {
          const size = canvas.width;
          const logoSize = size * 0.22; // 22% of QR size
          const logoPos = (size - logoSize) / 2;

          // Draw rounded white background for the logo
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize / 2 + 6, 0, Math.PI * 2);
          ctx.fill();

          // Draw circular clip path for the logo
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize / 2, 0, Math.PI * 2);
          ctx.clip();

          // Draw the loaded favicon image in the center
          ctx.drawImage(img, logoPos, logoPos, logoSize, logoSize);
          ctx.restore();
        };
      } catch (err) {
        console.error('Kunde inte generera QR-kod:', err);
      }
    };
    generateQRCode();
  }, [isOpen, shareLink]);
  if (!isOpen) return null;
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kunde inte kopiera länk:', err);
    }
  };
  return /*#__PURE__*/_jsx("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in",
    children: /*#__PURE__*/_jsxs("div", {
      className: "w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "flex items-center justify-between mb-5",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "flex items-center gap-2",
          children: [/*#__PURE__*/_jsx(Share2, {
            className: "h-5 w-5 text-blue-500"
          }), /*#__PURE__*/_jsx("h3", {
            className: "text-lg font-semibold text-slate-800 dark:text-slate-100",
            children: "Dela AppCompiler"
          })]
        }), /*#__PURE__*/_jsx("button", {
          onClick: onClose,
          className: "btn-press p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors",
          children: /*#__PURE__*/_jsx(X, {
            className: "h-5 w-5"
          })
        })]
      }), /*#__PURE__*/_jsx("p", {
        className: "text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed",
        children: "Skanna QR-koden nedan med din mobil f\xF6r att \xF6ppna och installera den senaste versionen av appen direkt p\xE5 din hemsk\xE4rm."
      }), /*#__PURE__*/_jsxs("div", {
        className: "flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800 mb-5 shadow-inner",
        children: [/*#__PURE__*/_jsx("canvas", {
          ref: canvasRef,
          className: "max-w-full rounded-lg shadow-sm"
        }), /*#__PURE__*/_jsx("span", {
          className: "text-[11px] font-mono mt-2 text-slate-400 dark:text-slate-500",
          children: "QR med Favicon-Overlay (Error Correction Level H)"
        })]
      }), /*#__PURE__*/_jsxs("div", {
        className: "space-y-2",
        children: [/*#__PURE__*/_jsx("label", {
          className: "text-xs font-semibold text-slate-700 dark:text-slate-300",
          children: "L\xE4nk att dela / generera QR f\xF6r:"
        }), /*#__PURE__*/_jsxs("div", {
          className: "flex gap-2",
          children: [/*#__PURE__*/_jsx("input", {
            type: "text",
            value: shareLink,
            onChange: e => setShareLink(e.target.value),
            placeholder: "Skriv in l\xE4nk h\xE4r...",
            className: "flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          }), /*#__PURE__*/_jsx("button", {
            onClick: handleCopy,
            className: "btn-press px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer",
            children: copied ? /*#__PURE__*/_jsxs(_Fragment, {
              children: [/*#__PURE__*/_jsx(Check, {
                className: "h-4 w-4"
              }), "Kopierad!"]
            }) : /*#__PURE__*/_jsxs(_Fragment, {
              children: [/*#__PURE__*/_jsx(Copy, {
                className: "h-4 w-4"
              }), "Kopiera"]
            })
          })]
        })]
      })]
    })
  });
}