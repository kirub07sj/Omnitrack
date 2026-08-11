import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';

interface ReceiptDialogProps {
  sale: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReceiptDialog({ sale, open, onOpenChange }: ReceiptDialogProps) {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const payment = sale.order?.transactions?.[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md print:max-w-none print:w-full print:border-none print:shadow-none print:m-0 print:p-0">
        <DialogHeader className="print:hidden">
          <DialogTitle>Receipt Preview</DialogTitle>
        </DialogHeader>

        <div className="font-mono text-sm mx-auto w-full max-w-sm bg-white text-black p-6 rounded-lg shadow-sm border print:shadow-none print:border-none print:p-0">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold uppercase mb-1">OmniTrack</h2>
            <p className="text-xs">Restaurant Management System</p>
            <p className="text-xs mt-2">Sale #: {sale.id.split('-')[0].toUpperCase()}</p>
            <p className="text-xs">Date: {format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm')}</p>
          </div>

          <div className="border-t border-b border-dashed border-gray-300 py-3 mb-4 space-y-1">
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{sale.cashier?.first_name || 'System'}</span>
            </div>
            <div className="flex justify-between">
              <span>Table:</span>
              <span>{sale.order?.table ? sale.order.table.table_number : 'Walk-in'}</span>
            </div>
            {sale.order?.waiter && (
              <div className="flex justify-between">
                <span>Waiter:</span>
                <span>{sale.order.waiter.first_name}</span>
              </div>
            )}
          </div>

          <table className="w-full mb-4">
            <thead>
              <tr className="border-b border-gray-300 text-left">
                <th className="py-2 font-normal">Item</th>
                <th className="py-2 text-center font-normal">Qty</th>
                <th className="py-2 text-right font-normal">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sale.order?.items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-2 pr-2">{item.product?.name}</td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">{(parseFloat(item.price) * parseFloat(item.quantity)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-gray-300 pt-3 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{parseFloat(sale.subtotal).toFixed(2)}</span>
            </div>
            {parseFloat(sale.tax) > 0 && (
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{parseFloat(sale.tax).toFixed(2)}</span>
              </div>
            )}
            {parseFloat(sale.discount) > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-{parseFloat(sale.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t border-dashed border-gray-300">
              <span>TOTAL:</span>
              <span>{parseFloat(sale.total).toFixed(2)} ETB</span>
            </div>
          </div>

          <div className="border-t border-gray-300 mt-4 pt-3 space-y-1">
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="uppercase">{payment?.method || 'UNKNOWN'}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Received:</span>
              <span>{parseFloat(payment?.amount || sale.total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Change:</span>
              <span>{Math.max(0, parseFloat(payment?.amount || 0) - parseFloat(sale.total)).toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center mt-8 text-xs font-medium">
            <p>Thank you for your visit!</p>
            <p className="mt-1 opacity-70">Powered by OmniTrack</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
