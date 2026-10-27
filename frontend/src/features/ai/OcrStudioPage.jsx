import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { aiClient } from '../../services/ai/aiClient';
import {
  ScanLine,
  FileText,
  Upload,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Copy,
  UserCheck,
  Bike,
} from 'lucide-react';
import { toast } from 'sonner';

export default function OcrStudioPage() {
  const [docType, setDocType] = useState('rc'); // 'rc', 'dl', 'invoice'
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleScanPreset = async (type, preset = null) => {
    setIsScanning(true);
    setDocType(type);
    try {
      const res = await aiClient.extractDocument(type, preset);
      setExtractedData(res);
      toast.success(`${res.docType} successfully scanned and parsed!`);
    } catch (err) {
      toast.error('OCR Processing error: ' + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-indigo-600" />
            AI OCR Document Studio & Extraction Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated optical character recognition for Vehicle RC Books, Driving Licences, and Vendor GST Invoices.
          </p>
        </div>

        {/* DPDP Safety Compliance Pill */}
        <div className="flex items-center gap-2 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>DPDP Act 2023 Compliant: Aadhaar Numbers Strictly Prohibited & Redacted</span>
        </div>
      </div>

      {/* Preset Action Strip */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase">Quick Test Presets:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            handleScanPreset('rc', {
              reg: 'KA-01-MJ-4589',
              name: 'Rohan Mehta',
              vin: 'ME3J350ERKA108922',
              engine: 'J350E108922',
            })
          }
          className="text-xs"
        >
          <Bike className="w-3.5 h-3.5 mr-1 text-blue-600" />
          Scan Rohan Mehta&apos;s RC (Hunter 350)
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            handleScanPreset('dl', {
              name: 'Arjun Das',
            })
          }
          className="text-xs"
        >
          <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          Scan Arjun Das&apos;s Driving Licence
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleScanPreset('invoice')}
          className="text-xs"
        >
          <FileText className="w-3.5 h-3.5 mr-1 text-purple-600" />
          Scan Exide Battery GST Invoice
        </Button>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Document Upload Dropzone & Mock Scanner (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">
              Document Input Source
            </h3>

            {/* Type Switcher */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => setDocType('rc')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                  docType === 'rc'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                RC Book
              </button>
              <button
                onClick={() => setDocType('dl')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                  docType === 'dl'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Driving Licence
              </button>
              <button
                onClick={() => setDocType('invoice')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                  docType === 'invoice'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Tax Invoice
              </button>
            </div>

            {/* Upload Mock Box */}
            <div
              onClick={() => handleScanPreset(docType)}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all relative overflow-hidden"
            >
              {isScanning ? (
                <div className="py-6 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Running OCR Neural Model...
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Extracting key-value pairs & confidence scores</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Click to simulate scan or drop document
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Supports high-res PNG, JPG, PDF</p>
                </div>
              )}
            </div>

            {/* Statutory Compliance Warning */}
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <strong>Statutory Notice:</strong> In compliance with UIDAI regulations and the Digital Personal Data Protection (DPDP) Act 2023, Aadhaar cards are blocked from scanning. Only Driving Licences and RC books are accepted.
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Extracted Key-Value Inspector (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Extracted Fields & Confidence Ratings
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {extractedData
                    ? extractedData.docType
                    : 'Select a document and run scan to inspect structured fields.'}
                </p>
              </div>

              {extractedData && (
                <div className="flex items-center gap-2">
                  <StatusBadge status="Confirmed" label={`Overall ${Math.round(extractedData.confidence * 100)}% Match`} />
                </div>
              )}
            </div>

            {extractedData ? (
              <div className="mt-4 space-y-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-600 dark:text-slate-400 font-mono">
                  {extractedData.dpdpNotice}
                </div>

                <div className="space-y-2.5">
                  {extractedData.fields.map((f, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs text-slate-500 font-medium">{f.key}</div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
                          {f.value}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-600">
                            {Math.round(f.confidence * 100)}%
                          </span>
                          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-0.5">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.round(f.confidence * 100)}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(f.value);
                            toast.success(`Copied ${f.key} to clipboard!`);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                          title="Copy field value"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(extractedData.fields, null, 2));
                      toast.success('JSON data copied to clipboard!');
                    }}
                  >
                    Copy JSON
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      toast.success('Fields successfully mapped into Showroom Entity Profile!');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Auto-Fill Profile Record
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Click any of the quick test presets above to simulate document OCR extraction.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
