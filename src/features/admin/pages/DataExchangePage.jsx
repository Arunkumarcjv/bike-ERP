import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  UploadCloud, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Layers, 
  Check, 
  FileText
} from 'lucide-react';
import { useAppStore } from '../../../store';
import { toast } from 'sonner';

const ENTITY_CONFIGS = [
  {
    id: 'CUSTOMERS',
    name: 'Customer Dossiers',
    fields: ['Name', 'Phone', 'Email', 'City', 'GSTIN'],
    sampleData: 'Name,Phone,Email,City,GSTIN\nArjun Das,9845012345,arjun@example.com,Bangalore,\nMeenakshi S,9844055112,meena@example.com,Bangalore,29AABCS8891H1Z9',
  },
  {
    id: 'VEHICLES',
    name: 'Vehicle Stock & VIN Inventory',
    fields: ['ChassisNumber', 'EngineNumber', 'ModelName', 'Color', 'Status', 'FactoryCostPaise'],
    sampleData: 'ChassisNumber,EngineNumber,ModelName,Color,Status,FactoryCostPaise\nME3J350C7P1049281,J350E1049281,Hunter 350,Dapper White,IN_STOCK,15120000',
  },
  {
    id: 'PARTS',
    name: 'Spare Parts & Inventory Catalogue',
    fields: ['PartNumber', 'Description', 'Category', 'StockQty', 'ReorderLevel', 'MrpPaise', 'BinLocation'],
    sampleData: 'PartNumber,Description,Category,StockQty,ReorderLevel,MrpPaise,BinLocation\nRE-SP-001,Spark Plug Champion,Fast Moving,14,25,24500,A-12-04',
  },
  {
    id: 'OPENING_BALANCES',
    name: 'Opening Accounting Balances',
    fields: ['AccountCode', 'AccountName', 'DebitPaise', 'CreditPaise'],
    sampleData: 'AccountCode,AccountName,DebitPaise,CreditPaise\n1010,Cash In Hand,1000000,0\n1020,ICICI Current Account,184500000,0',
  }
];

export function DataExchangePage() {
  const [selectedEntity, setSelectedEntity] = useState(ENTITY_CONFIGS[0]);
  const [importStep, setImportStep] = useState(1); // 1: Download, 2: Upload, 3: Validation, 4: Commit
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);

  const handleDownloadTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + selectedEntity.sampleData;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedEntity.id}_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded template for ${selectedEntity.name}`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    // Simulate validation
    const mockValidation = [
      { row: 1, data: 'Arjun Das | 9845012345 | Bangalore', valid: true, error: null },
      { row: 2, data: 'Meenakshi | 9844055112 | Bangalore', valid: true, error: null },
      { row: 3, data: 'Invalid Mobile | 12345 | Bangalore', valid: false, error: 'Phone must be 10 digits' },
    ];
    setPreviewRows(mockValidation);
    setImportStep(3);
    toast.info('File parsed! 2 rows valid, 1 row flagged with errors.');
  };

  const handleDownloadErrorFile = () => {
    const errorsOnly = 'Row,Data,Error\n3,Invalid Mobile | 12345 | Bangalore,Phone must be 10 digits';
    const encoded = encodeURI('data:text/csv;charset=utf-8,' + errorsOnly);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `${selectedEntity.id}_Errors.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded error rows file.');
  };

  const handleCommitImport = () => {
    toast.success(`Successfully committed 2 valid ${selectedEntity.name} records into store!`);
    setImportStep(1);
    setUploadedFile(null);
    setPreviewRows([]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowUpDown className="w-6 h-6 text-blue-600" />
            Import / Export Data Exchange Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Bulk migration for Customers, Vehicle Stock, Spare Parts and Accounting Balances with error scrubbing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {ENTITY_CONFIGS.map(c => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedEntity(c);
                setImportStep(1);
                setPreviewRows([]);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                selectedEntity.id === c.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* 5-Step Wizard Progress */}
      <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Active Workflow</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Bulk Import: {selectedEntity.name}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500">
            <span>Step {importStep} of 4</span>
          </div>
        </div>

        {/* Step 1: Download Template */}
        {importStep === 1 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-xs text-blue-950 dark:text-blue-200 space-y-1.5">
              <p className="font-bold">Step 1: Download Sample CSV Template</p>
              <p>Download the pre-formatted schema template containing expected headers and data types.</p>
              <div className="font-mono text-[11px] pt-1">
                Mandatory Fields: {selectedEntity.fields.join(' • ')}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-xs"
              >
                <Download className="w-4 h-4" />
                Download CSV Template
              </button>

              <button
                onClick={() => setImportStep(2)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
              >
                Next: Upload File &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Upload CSV / Excel */}
        {importStep === 2 && (
          <div className="space-y-4 text-center">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 space-y-3 bg-slate-50 dark:bg-slate-900">
              <UploadCloud className="w-12 h-12 text-blue-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Drag and Drop {selectedEntity.name} CSV / Excel File
              </h3>
              <p className="text-xs text-slate-500">
                Supports .csv, .xlsx, .xls up to 10MB per batch upload.
              </p>

              <label className="inline-block px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs cursor-pointer hover:bg-blue-700 shadow">
                Choose File from Computer
                <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <button
              onClick={() => setImportStep(1)}
              className="text-xs text-slate-400 hover:underline"
            >
              &larr; Back to Template
            </button>
          </div>
        )}

        {/* Step 3: Validation Preview & Error Scrubbing */}
        {importStep === 3 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Row-by-Row Integrity Validation ({previewRows.length} Rows Parsed)
              </h3>

              {previewRows.some(r => !r.valid) && (
                <button
                  onClick={handleDownloadErrorFile}
                  className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-bold hover:bg-red-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Failed Rows Only (Error File)
                </button>
              )}
            </div>

            <div className="border rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-500 text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Row #</th>
                    <th className="p-3">Parsed Content</th>
                    <th className="p-3">Integrity Check</th>
                    <th className="p-3">Validation Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {previewRows.map(r => (
                    <tr key={r.row} className={r.valid ? 'bg-emerald-50/20' : 'bg-red-50/20'}>
                      <td className="p-3 font-mono font-bold">{r.row}</td>
                      <td className="p-3 font-mono">{r.data}</td>
                      <td className="p-3 font-bold">
                        {r.valid ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Error
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-[11px] text-slate-500 font-semibold">
                        {r.error || 'Clean record, ready to import'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setImportStep(2)}
                className="px-3 py-1.5 text-xs border rounded-lg hover:bg-slate-50"
              >
                Re-upload File
              </button>

              <button
                onClick={handleCommitImport}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow"
              >
                Commit 2 Valid Rows to Store
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataExchangePage;
