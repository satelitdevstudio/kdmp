import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import {
  countOrdersInDateRange,
  downloadSalesReport,
  getDefaultReportDateRange,
  isValidDateRange,
  type SalesReportDateRange,
  type SalesReportFormat,
  type SalesReportOptions,
} from '../lib/salesReport';
import type { Order } from '../types';

interface Props {
  orders: Order[];
  reportTitle: string;
  reportOptions?: Omit<SalesReportOptions, 'reportTitle' | 'dateRange' | 'format'>;
}

export default function SalesReportDownload({ orders, reportTitle, reportOptions = {} }: Props) {
  const [dateRange, setDateRange] = useState<SalesReportDateRange>(getDefaultReportDateRange);
  const [format, setFormat] = useState<SalesReportFormat>('xlsx');

  const validRange = isValidDateRange(dateRange);
  const ordersInRange = useMemo(
    () => (validRange ? countOrdersInDateRange(orders, dateRange) : 0),
    [orders, dateRange, validRange]
  );

  const handleDownload = () => {
    if (!validRange || ordersInRange === 0) return;

    downloadSalesReport(orders, {
      ...reportOptions,
      reportTitle,
      dateRange,
      format,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-gray-800">Download Laporan Penjualan</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Pilih periode tanggal dan format file laporan.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-xs text-gray-600 min-w-[140px]">
          Dari tanggal
          <input
            type="date"
            value={dateRange.startDate}
            max={dateRange.endDate}
            onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-gray-600 min-w-[140px]">
          Sampai tanggal
          <input
            type="date"
            value={dateRange.endDate}
            min={dateRange.startDate}
            onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-gray-600 min-w-[140px]">
          Format file
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as SalesReportFormat)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white"
          >
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="csv">CSV (.csv)</option>
          </select>
        </label>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-gray-500">
          {!validRange
            ? 'Tanggal mulai harus sebelum atau sama dengan tanggal akhir.'
            : ordersInRange === 0
              ? 'Tidak ada pesanan pada periode yang dipilih.'
              : `${ordersInRange} pesanan siap diekspor.`}
        </p>

        <button
          type="button"
          onClick={handleDownload}
          disabled={!validRange || ordersInRange === 0}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          Download Laporan
        </button>
      </div>
    </div>
  );
}
