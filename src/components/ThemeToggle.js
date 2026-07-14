import { Sun, Moon } from 'lucide-react';
import { jsx as _jsx } from "react/jsx-runtime";
export default function ThemeToggle({
  darkMode,
  onToggle
}) {
  return /*#__PURE__*/_jsx("button", {
    id: "theme-toggle",
    onClick: onToggle,
    className: "btn-press p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-center",
    "aria-label": "V\xE4xla f\xE4rgtema",
    title: "V\xE4xla f\xE4rgtema",
    children: darkMode ? /*#__PURE__*/_jsx(Sun, {
      className: "h-5 w-5 text-amber-500"
    }) : /*#__PURE__*/_jsx(Moon, {
      className: "h-5 w-5 text-indigo-600"
    })
  });
}