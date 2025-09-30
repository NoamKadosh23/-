
import React from 'react';
import type { PayslipData } from '../types';

interface PayslipAnalysisProps {
  data: PayslipData;
}

const InfoCard: React.FC<{ title: string; value: string; className?: string }> = ({ title, value, className }) => (
  <div className={`p-4 rounded-lg shadow-inner ${className}`}>
    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const PayslipAnalysis: React.FC<PayslipAnalysisProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-semibold">{data.employerName}</h3>
        <p className="text-md text-gray-500 dark:text-gray-400">תלוש שכר עבור {data.employeeName} ({data.employeeId})</p>
        <p className="text-md text-gray-500 dark:text-gray-400">תקופה: {data.payPeriod}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard title="שכר ברוטו" value={`${data.grossSalary.toLocaleString()} ₪`} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200" />
        <InfoCard title="סך ניכויים" value={`${data.totalDeductions.toLocaleString()} ₪`} className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200" />
        <InfoCard title="שכר נטו" value={`${data.netSalary.toLocaleString()} ₪`} className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200" />
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
         <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
           <h4 className="font-semibold text-lg mb-2">פירוט תשלומים</h4>
           <ul className="space-y-1 text-sm">
             {data.payments.map((p, i) => (
               <li key={i} className="flex justify-between">
                 <span>{p.description}</span>
                 <span className="font-mono">{p.amount.toLocaleString()} ₪</span>
               </li>
             ))}
           </ul>
         </div>
         <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
           <h4 className="font-semibold text-lg mb-2">פירוט ניכויים</h4>
            <ul className="space-y-1 text-sm">
             {data.deductions.map((d, i) => (
               <li key={i} className="flex justify-between">
                 <span>{d.description}</span>
                 <span className="font-mono">{d.amount.toLocaleString()} ₪</span>
               </li>
             ))}
           </ul>
         </div>
       </div>
    </div>
  );
};

export default PayslipAnalysis;
