import React from 'react';
import { ShieldAlert, KeyRound, QrCode, Smartphone, PhoneCall, ExternalLink, ShieldCheck } from 'lucide-react';

export const SecurityGuidelines: React.FC = () => {
  const rules = [
    {
      icon: KeyRound,
      title: 'UPI PIN is ONLY for Sending Money',
      desc: 'You never need to enter your UPI PIN or scan a QR code to receive money or cashback. Entering your PIN always deducts money from your account.',
    },
    {
      icon: QrCode,
      title: 'QR Code Scanning Always Debits Funds',
      desc: 'Fraudsters on OLX or Facebook Marketplace claim "scan this QR to accept payment". Scanning a QR code only pays out.',
    },
    {
      icon: ShieldAlert,
      title: 'Beware of "Collect Requests"',
      desc: 'Never approve unexpected UPI collect notifications in Google Pay, PhonePe, or Paytm from unverified VPA handles.',
    },
    {
      icon: Smartphone,
      title: 'Never Install Remote Access Screen Apps',
      desc: 'Scammers posing as bank officials ask you to download apps like AnyDesk, TeamViewer, or RustDesk to capture OTPs and banking credentials.',
    },
  ];

  return (
    <section id="guidelines" className="space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider font-semibold text-cyan-400">
            NPCI & RBI Security Standards
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Essential UPI Protection Guidelines
          </h2>
        </div>
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap"
        >
          <span>National Cyber Crime Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule, idx) => {
          const Icon = rule.icon;
          return (
            <div
              key={idx}
              className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2.5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">{rule.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pl-11">
                {rule.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Cybercrime Helpline Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-900/90 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/80 flex items-center justify-center shrink-0 text-rose-400">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">Been a victim of UPI fraud?</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-xs text-rose-300 font-medium">Act within 2 hours</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Call the Ministry of Home Affairs National Cyber Crime Helpline at <strong className="text-white font-mono">1930</strong> immediately to freeze transferred funds.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:1930"
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-rose-900/30"
          >
            Dial 1930 Helpline
          </a>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            File Cyber Crime Complaint
          </a>
        </div>
      </div>
    </section>
  );
};
