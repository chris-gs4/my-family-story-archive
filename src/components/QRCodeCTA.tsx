'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeCTAProps {
  url: string;
  label?: string;
  size?: number;
}

export default function QRCodeCTA({
  url,
  label = 'Scan to try Mabel',
  size = 120
}: QRCodeCTAProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="p-4 rounded-2xl bg-white"
        style={{
          boxShadow: '0 4px 16px rgba(17, 24, 39, 0.1)',
          border: '1px solid rgba(47, 111, 94, 0.15)'
        }}
      >
        <QRCodeSVG
          value={url}
          size={size}
          level="M"
          fgColor="#2F6F5E"
          bgColor="#ffffff"
        />
      </div>
      <p
        className="text-sm font-medium"
        style={{ color: '#2F6F5E' }}
      >
        {label}
      </p>
    </div>
  );
}
