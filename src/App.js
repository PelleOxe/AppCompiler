import { useState, useEffect } from 'react';
import { FileArchive, AlertTriangle, CheckCircle, Download, RotateCcw, Share2, Info, Layers, Sparkles, Github } from 'lucide-react';
import ZipUploader from './components/ZipUploader.js';
import ThemeToggle from './components/ThemeToggle.js';
import ShareModal from './components/ShareModal.js';
import { compileZip } from './compiler.js';
import { APP_COMPILER_VERSION } from './version.js';
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [compilationResult, setCompilationResult] = useState(null);
  const [compiledBlob, setCompiledBlob] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // App version state: Starts at 1.0.01 and increments
  const appVersion = APP_COMPILER_VERSION;

  // Handle dark mode effect on <html> tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle compile action
  const handleCompile = async () => {
    if (!selectedFile) return;
    setIsCompiling(true);
    setCompilationResult(null);
    setCompiledBlob(null);
    try {
      const {
        outputZip,
        result
      } = await compileZip(selectedFile, status => {
        setProgressStatus(status);
      });
      setCompiledBlob(outputZip);
      setCompilationResult(result);

      // Auto-download the compiled ZIP for frictionless UX
      const url = URL.createObjectURL(outputZip);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setCompilationResult({
        fileName: '',
        fileCount: 0,
        success: false,
        error: err.message || 'Ett oväntat fel uppstod under kompileringen.',
        warnings: [],
        durationMs: 0
      });
    } finally {
      setIsCompiling(false);
    }
  };
  const handleReset = () => {
    setSelectedFile(null);
    setCompilationResult(null);
    setCompiledBlob(null);
    setProgressStatus('');
  };

  // Trigger download again manually
  const triggerDownload = () => {
    if (!compiledBlob || !compilationResult) return;
    const url = URL.createObjectURL(compiledBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = compilationResult.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return /*#__PURE__*/_jsxs("div", {
    className: "min-h-screen bg-slate-50 dark:bg-elegant-bg text-slate-800 dark:text-slate-300 flex flex-col transition-colors duration-200",
    children: [/*#__PURE__*/_jsxs("header", {
      className: "border-b border-slate-200/60 dark:border-elegant-border bg-white/70 dark:bg-elegant-header backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "flex items-center gap-3",
        children: [/*#__PURE__*/_jsx("div", {
          className: "h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/20 text-white font-bold text-lg",
          children: "AC"
        }), /*#__PURE__*/_jsxs("div", {
          children: [/*#__PURE__*/_jsx("h1", {
            className: "text-base font-semibold text-slate-800 dark:text-white tracking-tight leading-none",
            children: "AppCompiler"
          }), /*#__PURE__*/_jsxs("span", {
            className: "text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest block mt-1",
            children: ["Version ", appVersion]
          })]
        })]
      }), /*#__PURE__*/_jsxs("div", {
        className: "flex items-center gap-2",
        children: [/*#__PURE__*/_jsxs("button", {
          id: "share-btn",
          onClick: () => setIsShareOpen(true),
          className: "btn-press p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-center gap-1.5",
          title: "Dela appen",
          children: [/*#__PURE__*/_jsx(Share2, {
            className: "h-5 w-5 text-indigo-400"
          }), /*#__PURE__*/_jsx("span", {
            className: "hidden sm:inline text-xs font-semibold",
            children: "Dela"
          })]
        }), /*#__PURE__*/_jsx(ThemeToggle, {
          darkMode: darkMode,
          onToggle: () => setDarkMode(!darkMode)
        })]
      })]
    }), /*#__PURE__*/_jsxs("main", {
      className: "flex-1 max-w-4xl w-full mx-auto px-4 md:px-8 py-8 flex flex-col gap-6",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "bg-white dark:bg-elegant-header border border-slate-200/60 dark:border-elegant-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-5 items-start md:items-center relative overflow-hidden",
        children: [/*#__PURE__*/_jsx("div", {
          className: "absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none"
        }), /*#__PURE__*/_jsx("div", {
          className: "p-3.5 rounded-2.5xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0",
          children: /*#__PURE__*/_jsx(Sparkles, {
            className: "h-6 w-6"
          })
        }), /*#__PURE__*/_jsxs("div", {
          className: "space-y-1",
          children: [/*#__PURE__*/_jsx("h2", {
            className: "text-base font-bold text-slate-800 dark:text-slate-100",
            children: "Kompilera AI Studio-projekt till k\xF6rbara PWA-sidor"
          }), /*#__PURE__*/_jsxs("p", {
            className: "text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl",
            children: ["Importera ZIP-paketet som laddats ner fr\xE5n Google AI Studio. Kompilatorn transformerar TypeScript (.tsx/.ts) till webbl\xE4sarkompatibel JavaScript, injicerar Import Maps f\xF6r externa bibliotek, installerar en robust Service Worker samt bygger ett modernt PWA-manifest \u2014 helt redo att publiceras direkt p\xE5 ", /*#__PURE__*/_jsx("strong", {
              children: "GitHub Pages"
            }), "."]
          })]
        })]
      }), /*#__PURE__*/_jsxs("div", {
        className: "grid grid-cols-1 gap-6",
        children: [!compilationResult && !isCompiling && /*#__PURE__*/_jsxs("div", {
          className: "space-y-4",
          children: [/*#__PURE__*/_jsx(ZipUploader, {
            onFileSelect: setSelectedFile,
            selectedFile: selectedFile
          }), selectedFile && /*#__PURE__*/_jsxs("button", {
            id: "compile-btn",
            onClick: handleCompile,
            className: "btn-press w-full py-4 px-6 rounded-3.5xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40 transition-all duration-150 cursor-pointer",
            children: [/*#__PURE__*/_jsx(FileArchive, {
              className: "h-5 w-5"
            }), "Kompilera till Produktionsklar PWA"]
          })]
        }), isCompiling && /*#__PURE__*/_jsxs("div", {
          className: "bg-white dark:bg-elegant-header border border-slate-200/60 dark:border-elegant-border rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-md animate-pulse",
          children: [/*#__PURE__*/_jsxs("div", {
            className: "relative mb-5",
            children: [/*#__PURE__*/_jsx("div", {
              className: "h-14 w-14 rounded-full border-4 border-slate-100 dark:border-white/10 border-t-indigo-500 animate-spin"
            }), /*#__PURE__*/_jsx(Layers, {
              className: "h-6 w-6 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            })]
          }), /*#__PURE__*/_jsx("h3", {
            className: "text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5",
            children: "Kompilerar applikation..."
          }), /*#__PURE__*/_jsx("p", {
            className: "text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-[#050608] px-4 py-2 rounded-xl border border-slate-100 dark:border-[#232933] shadow-inner",
            children: progressStatus
          })]
        }), compilationResult && /*#__PURE__*/_jsxs("div", {
          className: "space-y-5 animate-fade-in",
          children: [/*#__PURE__*/_jsxs("div", {
            className: "bg-white dark:bg-elegant-header border border-slate-200/60 dark:border-elegant-border rounded-3xl p-6 shadow-sm",
            children: [/*#__PURE__*/_jsxs("div", {
              className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5 mb-5",
              children: [/*#__PURE__*/_jsxs("div", {
                className: "flex items-center gap-3",
                children: [compilationResult.success ? /*#__PURE__*/_jsx("div", {
                  className: "p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400 rounded-2xl shadow-sm",
                  children: /*#__PURE__*/_jsx(CheckCircle, {
                    className: "h-6 w-6"
                  })
                }) : /*#__PURE__*/_jsx("div", {
                  className: "p-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 rounded-2xl shadow-sm",
                  children: /*#__PURE__*/_jsx(AlertTriangle, {
                    className: "h-6 w-6"
                  })
                }), /*#__PURE__*/_jsxs("div", {
                  children: [/*#__PURE__*/_jsx("h3", {
                    className: "text-sm font-bold text-slate-800 dark:text-slate-100",
                    children: compilationResult.success ? 'Kompileringen lyckades!' : 'Kompileringen misslyckades'
                  }), /*#__PURE__*/_jsx("p", {
                    className: "text-xs text-slate-500 dark:text-slate-400",
                    children: compilationResult.success ? `Färdigställd på ${compilationResult.durationMs}ms` : 'Se felmeddelande nedan för detaljer'
                  })]
                })]
              }), /*#__PURE__*/_jsxs("div", {
                className: "flex items-center gap-2",
                children: [/*#__PURE__*/_jsxs("button", {
                  onClick: handleReset,
                  className: "btn-press px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200",
                  children: [/*#__PURE__*/_jsx(RotateCcw, {
                    className: "h-4 w-4"
                  }), "Kompilera en till"]
                }), compilationResult.success && /*#__PURE__*/_jsxs("button", {
                  onClick: triggerDownload,
                  className: "btn-press px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm",
                  children: [/*#__PURE__*/_jsx(Download, {
                    className: "h-4 w-4"
                  }), "Ladda ner igen"]
                })]
              })]
            }), compilationResult.success ? /*#__PURE__*/_jsxs("div", {
              className: "space-y-5",
              children: [/*#__PURE__*/_jsxs("div", {
                className: "grid grid-cols-2 sm:grid-cols-4 gap-4",
                children: [/*#__PURE__*/_jsxs("div", {
                  className: "bg-slate-50 dark:bg-[#050608]/40 p-4 rounded-2xl border border-slate-100 dark:border-[#232933]/50",
                  children: [/*#__PURE__*/_jsx("span", {
                    className: "text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider",
                    children: "Applikation"
                  }), /*#__PURE__*/_jsx("span", {
                    className: "text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-1",
                    children: compilationResult.appTitle
                  })]
                }), /*#__PURE__*/_jsxs("div", {
                  className: "bg-slate-50 dark:bg-[#050608]/40 p-4 rounded-2xl border border-slate-100 dark:border-[#232933]/50",
                  children: [/*#__PURE__*/_jsx("span", {
                    className: "text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider",
                    children: "Version"
                  }), /*#__PURE__*/_jsxs("span", {
                    className: "text-xs font-bold text-slate-800 dark:text-slate-200 block mt-1",
                    children: ["v", compilationResult.appVersion]
                  })]
                }), /*#__PURE__*/_jsxs("div", {
                  className: "bg-slate-50 dark:bg-[#050608]/40 p-4 rounded-2xl border border-slate-100 dark:border-[#232933]/50",
                  children: [/*#__PURE__*/_jsx("span", {
                    className: "text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider",
                    children: "Kompilerade filer"
                  }), /*#__PURE__*/_jsxs("span", {
                    className: "text-xs font-bold text-slate-800 dark:text-slate-200 block mt-1",
                    children: [compilationResult.fileCount, " st"]
                  })]
                }), /*#__PURE__*/_jsxs("div", {
                  className: "bg-slate-50 dark:bg-[#050608]/40 p-4 rounded-2xl border border-slate-100 dark:border-[#232933]/50",
                  children: [/*#__PURE__*/_jsx("span", {
                    className: "text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider",
                    children: "Filnamn"
                  }), /*#__PURE__*/_jsx("span", {
                    className: "text-xs font-bold text-indigo-500 dark:text-indigo-400 truncate block mt-1",
                    title: compilationResult.fileName,
                    children: compilationResult.fileName
                  })]
                })]
              }), /*#__PURE__*/_jsxs("div", {
                className: "bg-slate-50 dark:bg-[#050608]/40 rounded-2.5xl border border-slate-100 dark:border-[#232933]/50 p-5 space-y-3.5",
                children: [/*#__PURE__*/_jsxs("h4", {
                  className: "text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5",
                  children: [/*#__PURE__*/_jsx(CheckCircle, {
                    className: "h-4 w-4 text-emerald-500"
                  }), "Injekterat & Optimerat f\xF6r GitHub Pages:"]
                }), /*#__PURE__*/_jsxs("ul", {
                  className: "grid grid-cols-1 sm:grid-cols-2 gap-3 pl-1",
                  children: [/*#__PURE__*/_jsxs("li", {
                    className: "text-xs text-slate-600 dark:text-slate-200 flex items-start gap-2 leading-relaxed",
                    children: [/*#__PURE__*/_jsx("span", {
                      className: "text-emerald-500 shrink-0 select-none",
                      children: "\u2713"
                    }), /*#__PURE__*/_jsxs("span", {
                      children: [/*#__PURE__*/_jsx("strong", {
                        children: "Transpilerad TSX/TS"
                      }), " till Native ES Module JS (.js)."]
                    })]
                  }), /*#__PURE__*/_jsxs("li", {
                    className: "text-xs text-slate-600 dark:text-slate-200 flex items-start gap-2 leading-relaxed",
                    children: [/*#__PURE__*/_jsx("span", {
                      className: "text-emerald-500 shrink-0 select-none",
                      children: "\u2713"
                    }), /*#__PURE__*/_jsxs("span", {
                      children: [/*#__PURE__*/_jsx("strong", {
                        children: "Import Maps"
                      }), " injicerat i index.html f\xF6r s\xF6ml\xF6s CDN-laddning."]
                    })]
                  }), /*#__PURE__*/_jsxs("li", {
                    className: "text-xs text-slate-600 dark:text-slate-200 flex items-start gap-2 leading-relaxed",
                    children: [/*#__PURE__*/_jsx("span", {
                      className: "text-emerald-500 shrink-0 select-none",
                      children: "\u2713"
                    }), /*#__PURE__*/_jsxs("span", {
                      children: [/*#__PURE__*/_jsx("strong", {
                        children: "PWA Manifest (manifest.json)"
                      }), " skapat f\xF6r hemsk\xE4rms-installation."]
                    })]
                  }), /*#__PURE__*/_jsxs("li", {
                    className: "text-xs text-slate-600 dark:text-slate-200 flex items-start gap-2 leading-relaxed",
                    children: [/*#__PURE__*/_jsx("span", {
                      className: "text-emerald-500 shrink-0 select-none",
                      children: "\u2713"
                    }), /*#__PURE__*/_jsxs("span", {
                      children: [/*#__PURE__*/_jsx("strong", {
                        children: "Service Worker (sw.js)"
                      }), " aktiverad f\xF6r offline-kapabilitet."]
                    })]
                  }), /*#__PURE__*/_jsxs("li", {
                    className: "text-xs text-slate-600 dark:text-slate-200 flex items-start gap-2 leading-relaxed",
                    children: [/*#__PURE__*/_jsx("span", {
                      className: "text-emerald-500 shrink-0 select-none",
                      children: "\u2713"
                    }), /*#__PURE__*/_jsxs("span", {
                      children: [/*#__PURE__*/_jsx("strong", {
                        children: "Relativa s\xF6kv\xE4gar"
                      }), " till\xE4mpade i index.html f\xF6r subfolders support."]
                    })]
                  }), /*#__PURE__*/_jsxs("li", {
                    className: "text-xs text-slate-600 dark:text-slate-200 flex items-start gap-2 leading-relaxed",
                    children: [/*#__PURE__*/_jsx("span", {
                      className: "text-emerald-500 shrink-0 select-none",
                      children: "\u2713"
                    }), /*#__PURE__*/_jsxs("span", {
                      children: [/*#__PURE__*/_jsx("strong", {
                        children: "Tailwind CSS Play CDN"
                      }), " injicerat f\xF6r problemfri grafik-kompilering."]
                    })]
                  })]
                })]
              }), compilationResult.warnings.length > 0 && /*#__PURE__*/_jsxs("div", {
                className: "bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2.5xl p-4 space-y-2",
                children: [/*#__PURE__*/_jsxs("h4", {
                  className: "text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5",
                  children: [/*#__PURE__*/_jsx(AlertTriangle, {
                    className: "h-4 w-4 shrink-0"
                  }), "Loggade varningar (", compilationResult.warnings.length, "):"]
                }), /*#__PURE__*/_jsx("div", {
                  className: "max-h-40 overflow-y-auto font-mono text-[11px] text-amber-600 dark:text-amber-500/90 space-y-1.5 divide-y divide-amber-100/30 dark:divide-amber-900/10",
                  children: compilationResult.warnings.map((warn, i) => /*#__PURE__*/_jsx("p", {
                    className: "pt-1.5 first:pt-0 leading-relaxed",
                    children: warn
                  }, i))
                })]
              })]
            }) : /*#__PURE__*/_jsx("div", {
              className: "space-y-4",
              children: /*#__PURE__*/_jsxs("div", {
                className: "p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex gap-2 text-rose-600 dark:text-rose-400",
                children: [/*#__PURE__*/_jsx(AlertTriangle, {
                  className: "h-5 w-5 shrink-0"
                }), /*#__PURE__*/_jsxs("div", {
                  className: "space-y-1",
                  children: [/*#__PURE__*/_jsx("h4", {
                    className: "text-xs font-bold",
                    children: "Kompileringsfel"
                  }), /*#__PURE__*/_jsx("p", {
                    className: "text-xs font-mono leading-relaxed",
                    children: compilationResult.error
                  })]
                })]
              })
            })]
          }), compilationResult.success && /*#__PURE__*/_jsxs("div", {
            className: "bg-gradient-to-tr from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-[#1A1F26] shadow-md space-y-4 relative overflow-hidden",
            children: [/*#__PURE__*/_jsx("div", {
              className: "absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none"
            }), /*#__PURE__*/_jsxs("div", {
              className: "flex items-center gap-2",
              children: [/*#__PURE__*/_jsx(Github, {
                className: "h-5 w-5 text-indigo-400"
              }), /*#__PURE__*/_jsx("h4", {
                className: "text-xs font-bold uppercase tracking-wider text-indigo-400",
                children: "Guide: Publicera p\xE5 GitHub Pages"
              })]
            }), /*#__PURE__*/_jsxs("div", {
              className: "grid grid-cols-1 md:grid-cols-3 gap-4 font-sans",
              children: [/*#__PURE__*/_jsxs("div", {
                className: "space-y-1",
                children: [/*#__PURE__*/_jsx("span", {
                  className: "inline-flex h-6 w-6 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold items-center justify-center text-indigo-400 mb-1.5",
                  children: "1"
                }), /*#__PURE__*/_jsx("h5", {
                  className: "text-xs font-bold text-white",
                  children: "Extrahera ZIP-filen"
                }), /*#__PURE__*/_jsx("p", {
                  className: "text-[11px] text-slate-400 leading-relaxed",
                  children: "Packa upp din nyligen nedladdade kompilerade ZIP-fil till en lokal mapp p\xE5 din dator."
                })]
              }), /*#__PURE__*/_jsxs("div", {
                className: "space-y-1",
                children: [/*#__PURE__*/_jsx("span", {
                  className: "inline-flex h-6 w-6 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold items-center justify-center text-indigo-400 mb-1.5",
                  children: "2"
                }), /*#__PURE__*/_jsx("h5", {
                  className: "text-xs font-bold text-white",
                  children: "Skapa GitHub Repository"
                }), /*#__PURE__*/_jsx("p", {
                  className: "text-[11px] text-slate-400 leading-relaxed",
                  children: "Skapa ett nytt tomt repository p\xE5 GitHub. Ladda upp alla de extraherade filerna direkt till root-mappen."
                })]
              }), /*#__PURE__*/_jsxs("div", {
                className: "space-y-1",
                children: [/*#__PURE__*/_jsx("span", {
                  className: "inline-flex h-6 w-6 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold items-center justify-center text-indigo-400 mb-1.5",
                  children: "3"
                }), /*#__PURE__*/_jsx("h5", {
                  className: "text-xs font-bold text-white",
                  children: "Aktivera Pages"
                }), /*#__PURE__*/_jsxs("p", {
                  className: "text-[11px] text-slate-400 leading-relaxed",
                  children: ["G\xE5 till Settings > Pages i ditt repo. V\xE4lj ", /*#__PURE__*/_jsx("strong", {
                    children: "Deploy from a branch"
                  }), " och spara. Klart!"]
                })]
              })]
            })]
          })]
        })]
      }), /*#__PURE__*/_jsxs("div", {
        className: "bg-white dark:bg-elegant-header border border-slate-200/60 dark:border-elegant-border rounded-3xl p-5 space-y-3.5 shadow-sm",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold",
          children: [/*#__PURE__*/_jsx(Info, {
            className: "h-4.5 w-4.5 text-indigo-500"
          }), /*#__PURE__*/_jsx("h4", {
            className: "text-xs font-bold uppercase tracking-wider",
            children: "Hur AppCompiler Fungerar"
          })]
        }), /*#__PURE__*/_jsx("p", {
          className: "text-xs text-slate-500 dark:text-slate-300 leading-relaxed",
          children: "I AI Studio bygger du moderna React/Vite-applikationer med TypeScript (.tsx) och Tailwind v4. Traditionellt kr\xE4ver dessa ett Node.js-bygge p\xE5 en server f\xF6r att kunna k\xF6ras. AppCompiler k\xF6r en hel kompileringsmilj\xF6 direkt i din webbl\xE4sare, analyserar dina k\xE4llfiler, och omvandlar dem till ren HTML5, JavaScript (ES6 Modules) och CSS som kan tolkas direkt av webbl\xE4saren utan behov av n\xE5gra byggsteg eller servrar."
        })]
      })]
    }), /*#__PURE__*/_jsxs("footer", {
      className: "border-t border-slate-200/50 dark:border-elegant-border bg-white/30 dark:bg-elegant-header py-4 px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 dark:text-slate-500 font-medium",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "flex items-center gap-4",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "flex items-center gap-1.5",
          children: [/*#__PURE__*/_jsx("div", {
            className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
          }), /*#__PURE__*/_jsx("span", {
            className: "text-[11px] text-slate-400 dark:text-slate-500",
            children: "PWA Ready"
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "flex items-center gap-1.5",
          children: [/*#__PURE__*/_jsx("div", {
            className: "w-2 h-2 rounded-full bg-indigo-500"
          }), /*#__PURE__*/_jsx("span", {
            className: "text-[11px] text-slate-400 dark:text-slate-500",
            children: "Worker Active"
          })]
        })]
      }), /*#__PURE__*/_jsxs("div", {
        className: "flex items-center gap-1.5 font-mono",
        children: [/*#__PURE__*/_jsx("span", {
          children: "Hemsk\xE4rms-kompatibel (PWA)"
        }), /*#__PURE__*/_jsx("span", {
          children: "\u2022"
        }), /*#__PURE__*/_jsxs("span", {
          children: ["Version ", appVersion]
        })]
      })]
    }), /*#__PURE__*/_jsx(ShareModal, {
      isOpen: isShareOpen,
      onClose: () => setIsShareOpen(false),
      appUrl: window.location.href
    })]
  });
}