"use client";

import { useState } from "react";
import { ExternalLink, Copy, Check, QrCode, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enghub.com.br";

export function ProfileLinkBar({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const profileUrl = `${SITE_URL}/pt/${slug}`;

  function handleCopy() {
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        <a
          href={`/pt/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ExternalLink size={14} />
          Ver perfil público
        </a>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          {copied ? "Copiado!" : "Copiar link"}
        </button>
        <button
          onClick={() => setQrOpen(true)}
          title="QR Code do perfil"
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <QrCode size={14} />
          QR Code
        </button>
      </div>

      {/* Modal QR Code */}
      {qrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xs overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-zinc-800">
              <p className="font-semibold text-gray-900 dark:text-zinc-100">QR Code do perfil</p>
              <button onClick={() => setQrOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800">
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col items-center gap-4 p-6">
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-700">
                <QRCodeSVG value={profileUrl} size={180} />
              </div>
              <p className="text-center text-xs text-gray-500 dark:text-zinc-400 break-all">{profileUrl}</p>
              <p className="text-center text-xs text-gray-400">Escaneie para acessar o perfil. Use em cartão de visita, apresentações ou redes sociais.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
