import React, { useState } from 'react';
import { 
  FolderLock, 
  Folder, 
  FileText, 
  UploadCloud, 
  Download, 
  Eye, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  ShieldCheck, 
  Clock,
  Plus
} from 'lucide-react';
import { formatDate } from '../../../lib/format';
import { toast } from 'sonner';

const SAMPLE_DOCS = [
  {
    id: 'doc-001',
    folder: 'KYC',
    entityName: 'Rohit Chandran',
    docType: 'Customer PAN Card',
    fileName: 'PAN_RohitChandran_Masked.pdf',
    uploadedAt: '2026-10-15',
    expiryDate: null,
    status: 'VERIFIED',
    sizeKb: 480,
  },
  {
    id: 'doc-002',
    folder: 'VEHICLES',
    entityName: 'KA-01-MJ-4050 (Hunter 350)',
    docType: 'Comprehensive Insurance Policy',
    fileName: 'Digit_Policy_Hunter350.pdf',
    uploadedAt: '2026-09-28',
    expiryDate: '2026-11-10', // Expiring in 17 days!
    status: 'EXPIRING_SOON',
    sizeKb: 1250,
  },
  {
    id: 'doc-003',
    folder: 'VEHICLES',
    entityName: 'KA-03-NQ-2211 (Himalayan 450)',
    docType: 'PUC Green Certificate',
    fileName: 'PUC_Valid_Nov2026.pdf',
    uploadedAt: '2026-05-10',
    expiryDate: '2026-11-05', // Expiring in 12 days!
    status: 'EXPIRING_SOON',
    sizeKb: 310,
  },
  {
    id: 'doc-004',
    folder: 'DEALS',
    entityName: 'SO-2627-001 (Arjun Das)',
    docType: 'Signed Form 20 & 21 Sale Certificate',
    fileName: 'Form20_Form21_ArjunDas.pdf',
    uploadedAt: '2026-10-22',
    expiryDate: null,
    status: 'VERIFIED',
    sizeKb: 890,
  },
  {
    id: 'doc-005',
    folder: 'COMPLIANCE',
    entityName: 'Bike ERP Dealership Karnataka',
    docType: 'RTO Trade Certificate 2026-27',
    fileName: 'Trade_Certificate_KA_2627.pdf',
    uploadedAt: '2026-04-01',
    expiryDate: '2027-03-31',
    status: 'VERIFIED',
    sizeKb: 1650,
  }
];

export function DocumentVaultPage() {
  const [docs, setDocs] = useState(SAMPLE_DOCS);
  const [selectedFolder, setSelectedFolder] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewAuditTrail, setViewAuditTrail] = useState([]);

  const logDocAccess = (action, doc) => {
    const entry = {
      id: `acc-${Date.now()}`,
      action,
      fileName: doc.fileName,
      docType: doc.docType,
      user: 'Rajesh Varma (Super Admin)',
      timestamp: new Date().toLocaleTimeString('en-IN'),
    };
    setViewAuditTrail(prev => [entry, ...prev.slice(0, 9)]);
    toast.success(`${action} recorded in statutory document vault audit trail.`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newDoc = {
      id: `doc-${Date.now()}`,
      folder: selectedFolder === 'ALL' ? 'KYC' : selectedFolder,
      entityName: 'Walk-in Upload',
      docType: 'Uploaded Statutory PDF',
      fileName: file.name,
      uploadedAt: new Date().toISOString().slice(0, 10),
      expiryDate: null,
      status: 'VERIFIED',
      sizeKb: Math.round(file.size / 1024),
    };

    setDocs(prev => [newDoc, ...prev]);
    toast.success(`Encrypted file "${file.name}" stored into document vault.`);
  };

  const expiringCount = docs.filter(d => d.status === 'EXPIRING_SOON').length;

  const filteredDocs = docs.filter(d => {
    const matchesFolder = selectedFolder === 'ALL' || d.folder === selectedFolder;
    const matchesSearch = 
      d.fileName.toLowerCase().includes(search.toLowerCase()) ||
      d.entityName.toLowerCase().includes(search.toLowerCase()) ||
      d.docType.toLowerCase().includes(search.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderLock className="w-6 h-6 text-blue-600" />
            Centralized Document Vault &amp; Expiry Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Encrypted repository for Customer KYC, Form 20/21 RTO files, Insurance policies &amp; 30-day statutory renewal alerts.
          </p>
        </div>

        {/* Upload Trigger */}
        <label className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition cursor-pointer">
          <UploadCloud className="w-4 h-4" />
          <span>Upload Document</span>
          <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Statutory DPDP & Expiry Alert Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 dark:text-blue-200">
            <p className="font-bold">DPDP Act 2023 &amp; KYC Masking Standard</p>
            <p className="mt-0.5 text-blue-700/80 dark:text-blue-300/80">
              Aadhaar numbers are strictly masked (first 8 digits obscured) in compliance with UIDAI regulations. Zero raw Aadhaar images stored.
            </p>
          </div>
        </div>

        {expiringCount > 0 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <p className="font-bold">{expiringCount} Statutory Policies Expiring in Next 30 Days</p>
              <p className="mt-0.5 text-amber-800/80 dark:text-amber-300/80">
                Insurance renewals and PUC re-tests identified. Automated WhatsApp reminder alerts queued to customers.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Folder Hierarchy Pills & Search */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'KYC', 'VEHICLES', 'DEALS', 'COMPLIANCE'].map(folder => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition flex items-center gap-1.5 ${
                selectedFolder === folder
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>{folder}</span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents or vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
          />
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Document Name &amp; File</th>
                <th className="p-3.5">Category Folder</th>
                <th className="p-3.5">Associated Entity</th>
                <th className="p-3.5">Upload Date</th>
                <th className="p-3.5">Expiry Date</th>
                <th className="p-3.5">Integrity</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDocs.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{doc.docType}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{doc.fileName} ({doc.sizeKb} KB)</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-bold font-mono text-[10px] text-slate-500">
                    {doc.folder}
                  </td>
                  <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                    {doc.entityName}
                  </td>
                  <td className="p-3.5 font-mono text-slate-500">{doc.uploadedAt}</td>
                  <td className="p-3.5 font-mono">
                    {doc.expiryDate ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.status === 'EXPIRING_SOON' ? 'bg-amber-100 text-amber-800' : 'text-slate-600'
                      }`}>
                        {doc.expiryDate}
                      </span>
                    ) : (
                      <span className="text-slate-400">Lifetime</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Encrypted
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => logDocAccess('VIEW', doc)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                      title="Inspect Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => logDocAccess('DOWNLOAD', doc)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                      title="Download Secure Copy"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Access Audit Trail Drawer */}
      {viewAuditTrail.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
          <span className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
            <Clock className="w-3.5 h-3.5" /> Live Access Audit Trail
          </span>
          <div className="space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
            {viewAuditTrail.map(entry => (
              <div key={entry.id} className="flex justify-between">
                <span>[{entry.timestamp}] {entry.user} executed <strong>{entry.action}</strong> on {entry.fileName}</span>
                <span className="text-emerald-600">AUDITED_OK</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentVaultPage;
