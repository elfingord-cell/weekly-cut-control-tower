'use client';

import { useState } from 'react';

export function CopyCard({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Copy/paste report</h3>
        <button
          type="button"
          onClick={handleCopy}
          className="bg-slate-800 px-3 py-1 rounded-md border border-slate-700 text-sm hover:bg-slate-700"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-slate-900/60 p-3 rounded-md border border-slate-800 overflow-auto">
        {text}
      </pre>
    </div>
  );
}
