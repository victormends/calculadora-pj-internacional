import { Spinner } from './Icons';

interface ExportButtonsProps {
  pdfLoading: boolean;
  csvLoading: boolean;
  handleExportPdf: () => void;
  handleExportCsv: () => void;
  exportError: string | null;
}

export function ExportButtons({
  pdfLoading,
  csvLoading,
  handleExportPdf,
  handleExportCsv,
  exportError,
}: ExportButtonsProps) {
  return (
    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-col items-center">
      <div className="flex justify-center space-x-4 w-full">
        <button 
          onClick={handleExportPdf} 
          disabled={pdfLoading || csvLoading}
          className="flex-1 flex justify-center items-center py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
        >
          {pdfLoading ? <Spinner size={16} className="mr-2" /> : <span className="mr-2">📄</span>}
          Exportar PDF
        </button>
        <button 
          onClick={handleExportCsv} 
          disabled={csvLoading || pdfLoading}
          className="flex-1 flex justify-center items-center py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
        >
          {csvLoading ? <Spinner size={16} className="mr-2" /> : <span className="mr-2">📊</span>}
          Exportar CSV
        </button>
      </div>
      {exportError && <p className="text-red-500 text-sm mt-3">{exportError}</p>}
    </div>
  );
}
