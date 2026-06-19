import { AlertTriangle, Info } from './Icons';

interface RegimeAlertProps {
  companyType: string;
}

export function RegimeAlert({ companyType }: RegimeAlertProps) {
  let regimeTitle = '';
  let regimeDesc = '';
  let styles = { bg: '', border: '', title: '', text: '', icon: '' };

  if (companyType === 'MEI') {
    regimeTitle = 'MEI';
    regimeDesc = 'Faturamento dentro do limite. DAS fixo (~R$75). Isento de IRPF com contabilidade.';
    styles = { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-500', title: 'text-emerald-800 dark:text-emerald-300', text: 'text-emerald-700 dark:text-emerald-400', icon: 'text-emerald-500' };
  } else if (companyType === 'ME') {
    regimeTitle = 'ME (Simples Nacional)';
    regimeDesc = 'Faturamento entre R$ 130k e R$ 360k. Utilizando o Fator R (Pró-labore de 28%) para redução de impostos.';
    styles = { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-500', title: 'text-blue-800 dark:text-blue-300', text: 'text-blue-700 dark:text-blue-400', icon: 'text-blue-500' };
  } else if (companyType === 'EPP') {
    regimeTitle = 'EPP (Simples Nacional)';
    regimeDesc = 'Faturamento entre R$ 360k e R$ 4,8M. Fator R aplicável, atenção ao aumento progressivo do DAS.';
    styles = { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-500', title: 'text-purple-800 dark:text-purple-300', text: 'text-purple-700 dark:text-purple-400', icon: 'text-purple-500' };
  } else {
    regimeTitle = 'Fora do Simples (> R$ 4,8M)';
    regimeDesc = 'Faturamento excede o teto do Simples Nacional. Lucro Presumido ou Real aplicável.';
    styles = { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-500', title: 'text-red-800 dark:text-red-300', text: 'text-red-700 dark:text-red-400', icon: 'text-red-500' };
  }

  return (
    <div className={`border-l-4 p-2.5 rounded-r-lg flex items-center space-x-2 transition-colors ${styles.bg} ${styles.border}`}>
      {companyType === 'OUT' ? (
        <AlertTriangle className={`${styles.icon} shrink-0`} size={16} />
      ) : (
        <Info className={`${styles.icon} shrink-0`} size={16} />
      )}
      <div className="flex flex-col md:flex-row md:items-center text-sm">
        <span className={`font-semibold mr-2 ${styles.title}`}>Regime: {regimeTitle}</span>
        <span className={`text-xs md:text-sm ${styles.text}`}>{regimeDesc}</span>
      </div>
    </div>
  );
}
