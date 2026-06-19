import { useState, useEffect, useRef } from 'react';
import { calcDeductions, calcEquivalentCLT } from './utils/taxCalc';
import { useExchangeRate } from './hooks/useExchangeRate';
import { useUrlState } from './hooks/useUrlState';
import { useDarkMode } from './hooks/useDarkMode';

import { Header } from './components/Header';
import { RegimeAlert } from './components/RegimeAlert';
import { InputForm } from './components/InputForm';
import { ResultsPanel } from './components/ResultsPanel';
import { ExportButtons } from './components/ExportButtons';

export default function App() {
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { rate: liveRate, loading: rateLoading, lastUpdated, refresh: refreshRate } = useExchangeRate();

  const [formState, setFormState] = useUrlState({
    usdSalary: 2500,
    exchangeRate: 5.50,
    remittanceFeePercent: 2.0, // 2% Payoneer
    dasTaxPercent: 3.05, // 3.05% a 4%
    accountingFee: 250,
    livingCost: 4000,
  });

  const { 
    usdSalary, exchangeRate, remittanceFeePercent: remittanceFee, 
    dasTaxPercent: dasTax, accountingFee, livingCost
  } = formState;

  // Always sync live rate on load, ignoring any cached/bookmarked URL rates
  const hasSyncedLiveRate = useRef(false);
  useEffect(() => {
    if (!rateLoading && liveRate && !hasSyncedLiveRate.current) {
       setFormState(s => ({ ...s, exchangeRate: liveRate }));
       hasSyncedLiveRate.current = true;
    }
  }, [liveRate, rateLoading, setFormState]);

  const [copied, setCopied] = useState(false);
  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Clipboard API not available');
    }
  };

  // Lógica de Cálculo
  const result = calcDeductions({
    usdSalary,
    exchangeRate,
    remittanceFeePercent: remittanceFee,
    dasTaxPercent: dasTax,
    accountingFee
  });

  const {
    grossBrl, annualGrossBrl, companyType,
    remittanceCost, dasCost, proLabore,
    inssCost, irrfCost,
    netIncomeBrl, effectiveTaxRate
  } = result;

  // Lógica de Segurança (Reserva de Emergência no 1º Ano)
  const isMEI = companyType === 'MEI';
  const actualLivingCost = livingCost > 0 ? livingCost : 4000;
  const targetReserve = actualLivingCost * 6; // Alvo de 6 meses de segurança
  const monthlyReserveCost = targetReserve / 12; // Dividido nos 12 meses do 1º ano
  const safeNetIncome = Math.max(0, netIncomeBrl - monthlyReserveCost); // Líquido Disponível após investir na segurança

  const equivalentCLT = calcEquivalentCLT(safeNetIncome);

  // Export handlers
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleExportPdf() {
    setPdfLoading(true);
    setExportError(null);
    try {
      const { exportPdf } = await import('./utils/exportPdf');
      await exportPdf(result);
    } catch {
      setExportError('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleExportCsv() {
    setCsvLoading(true);
    setExportError(null);
    try {
      const { exportCsv } = await import('./utils/exportCsv');
      await exportCsv(result);
    } catch {
      setExportError('Erro ao exportar CSV. Tente novamente.');
    } finally {
      setCsvLoading(false);
    }
  }

  const isUsingLiveRate = liveRate ? Math.abs(exchangeRate - liveRate) < 0.001 : false;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-2 md:p-4 font-sans text-slate-800 dark:text-slate-200 transition-colors flex flex-col justify-center">
      <div className="max-w-6xl mx-auto w-full space-y-3">
        
        <Header 
          isDark={isDark}
          toggleDark={toggleDark}
          isUsingLiveRate={isUsingLiveRate}
          lastUpdated={lastUpdated}
          refreshRate={refreshRate}
          rateLoading={rateLoading}
        />

        <RegimeAlert companyType={companyType} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Coluna Esquerda - Inputs */}
          <div className="space-y-4">
            <InputForm 
              formState={formState}
              setFormState={setFormState}
              handleCopyLink={handleCopyLink}
              copied={copied}
              isUsingLiveRate={isUsingLiveRate}
              liveRate={liveRate}
              isMEI={isMEI}
            />
          </div>

          {/* Coluna Direita - Resultados */}
          <div className="space-y-4">
            <ResultsPanel 
              grossBrl={grossBrl}
              annualGrossBrl={annualGrossBrl}
              effectiveTaxRate={effectiveTaxRate}
              remittanceCost={remittanceCost}
              remittanceFee={remittanceFee}
              dasCost={dasCost}
              dasTax={dasTax}
              accountingFee={accountingFee}
              isMEI={isMEI}
              proLabore={proLabore}
              inssCost={inssCost}
              irrfCost={irrfCost}
              netIncomeBrl={netIncomeBrl}
              monthlyReserveCost={monthlyReserveCost}
              safeNetIncome={safeNetIncome}
              equivalentCLT={equivalentCLT}
            />

            <ExportButtons 
              pdfLoading={pdfLoading}
              csvLoading={csvLoading}
              handleExportPdf={handleExportPdf}
              handleExportCsv={handleExportCsv}
              exportError={exportError}
            />
          </div>
        </div>

      </div>
    </div>
  );
}