import * as XLSX from 'xlsx';
import {
  ORDER_ITEM_TYPE_LABELS,
  ORDER_STATUS_LABELS,
  type Order,
  type OrderItemRecord,
} from '../types';

export type SalesReportDateRange = {
  startDate: string;
  endDate: string;
};

export type SalesReportFormat = 'xlsx' | 'csv';

export type SalesReportOptions = {
  sellerNameById?: Record<string, string>;
  itemToSellerId?: Record<string, string>;
  buyerNameById?: Record<string, string>;
  sellerId?: string;
  sellerItemIds?: Set<string>;
  reportTitle?: string;
  dateRange?: SalesReportDateRange;
  format?: SalesReportFormat;
};

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultReportDateRange(): SalesReportDateRange {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1);
  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
}

export function isValidDateRange(range: SalesReportDateRange): boolean {
  return Boolean(range.startDate && range.endDate && range.startDate <= range.endDate);
}

export function formatDateRangeLabel(range: SalesReportDateRange): string {
  const format = (value: string) =>
    new Date(`${value}T12:00:00`).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  return `${format(range.startDate)} – ${format(range.endDate)}`;
}

export function filterOrdersByDateRange(
  orders: Order[],
  range: SalesReportDateRange
): Order[] {
  const start = new Date(`${range.startDate}T00:00:00`);
  const end = new Date(`${range.endDate}T23:59:59.999`);

  return orders.filter((order) => {
    const created = new Date(order.created_at);
    return created >= start && created <= end;
  });
}

function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function getItemSellerId(
  item: OrderItemRecord,
  itemToSellerId?: Record<string, string>
): string | undefined {
  return itemToSellerId?.[`${item.item_type}:${item.product_id}`];
}

function getOrderStatusLabel(order: Order, sellerId?: string): string {
  if (sellerId && order.seller_confirmations?.length) {
    const confirmation = order.seller_confirmations.find((c) => c.seller_id === sellerId);
    if (confirmation) return ORDER_STATUS_LABELS[confirmation.status];
  }
  return ORDER_STATUS_LABELS[order.status];
}

function itemBelongsToSeller(item: OrderItemRecord, options: SalesReportOptions): boolean {
  if (options.sellerItemIds) {
    return options.sellerItemIds.has(item.product_id);
  }
  if (options.sellerId && options.itemToSellerId) {
    return getItemSellerId(item, options.itemToSellerId) === options.sellerId;
  }
  return true;
}

export function buildSalesReportRows(
  orders: Order[],
  options: SalesReportOptions = {}
): (string | number)[][] {
  const headers = [
    'No Pesanan',
    'Tanggal',
    'Status',
    'Pembeli',
    'Alamat Pengiriman',
    'Penjual',
    'Tipe Item',
    'Nama Item',
    'Qty',
    'Harga Satuan (Rp)',
    'Subtotal (Rp)',
    'Total Pesanan (Rp)',
  ];

  const rows: (string | number)[][] = [];

  if (options.reportTitle) {
    rows.push([options.reportTitle]);
  }
  if (options.dateRange) {
    rows.push([`Periode: ${formatDateRangeLabel(options.dateRange)}`]);
  }
  rows.push([`Diekspor: ${new Date().toLocaleString('id-ID')}`]);
  rows.push([]);

  rows.push(headers);

  let totalSales = 0;
  let itemCount = 0;
  let orderCount = 0;

  for (const order of orders) {
    const relevantItems = order.items.filter((item) => itemBelongsToSeller(item, options));
    if (relevantItems.length === 0) continue;

    orderCount += 1;
    const buyerName =
      options.buyerNameById?.[order.buyer_id] ?? `ID ${order.buyer_id.slice(0, 8)}`;
    const dateStr = new Date(order.created_at).toLocaleString('id-ID');
    const statusLabel = getOrderStatusLabel(order, options.sellerId);

    for (const item of relevantItems) {
      const sellerId = getItemSellerId(item, options.itemToSellerId);
      const sellerName = sellerId
        ? options.sellerNameById?.[sellerId] ?? `ID ${sellerId.slice(0, 8)}`
        : 'Koperasi';
      const subtotal = item.price * item.quantity;

      totalSales += subtotal;
      itemCount += item.quantity;

      rows.push([
        order.id.slice(0, 8),
        dateStr,
        statusLabel,
        buyerName,
        order.shipping_address,
        sellerName,
        ORDER_ITEM_TYPE_LABELS[item.item_type],
        item.product_name,
        item.quantity,
        item.price,
        subtotal,
        order.total,
      ]);
    }
  }

  rows.push([]);
  rows.push(['Ringkasan']);
  rows.push(['Jumlah Pesanan', orderCount]);
  rows.push(['Jumlah Item Terjual', itemCount]);
  rows.push(['Total Penjualan (Rp)', totalSales]);

  return rows;
}

export function rowsToCsv(rows: (string | number)[][]): string {
  return rows.map((row) => row.map(escapeCsvField).join(',')).join('\r\n');
}

function buildReportFilename(options: SalesReportOptions, range: SalesReportDateRange): string {
  const prefix = options.sellerId ? 'laporan-penjualan-penjual' : 'laporan-penjualan';
  return `${prefix}_${range.startDate}_${range.endDate}`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv(content: string, filename: string): void {
  downloadBlob(new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' }), filename);
}

export function downloadExcel(rows: (string | number)[][], filename: string): void {
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 20 },
    { wch: 18 },
    { wch: 20 },
    { wch: 32 },
    { wch: 20 },
    { wch: 12 },
    { wch: 28 },
    { wch: 6 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Penjualan');
  XLSX.writeFile(workbook, filename);
}

export function downloadSalesReport(orders: Order[], options: SalesReportOptions = {}): void {
  const range = options.dateRange ?? getDefaultReportDateRange();
  const filteredOrders = filterOrdersByDateRange(orders, range);
  const format = options.format ?? 'xlsx';
  const rows = buildSalesReportRows(filteredOrders, { ...options, dateRange: range });
  const filename = buildReportFilename(options, range);

  if (format === 'csv') {
    downloadCsv(rowsToCsv(rows), `${filename}.csv`);
    return;
  }

  downloadExcel(rows, `${filename}.xlsx`);
}

export function countOrdersInDateRange(
  orders: Order[],
  range: SalesReportDateRange
): number {
  return filterOrdersByDateRange(orders, range).length;
}
