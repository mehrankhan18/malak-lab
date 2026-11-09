import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleProceedToCheckout = () => {
    onClose();
    navigate('/book-test');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Selected Medical Tests ({cart.length})
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingBag className="w-16 h-16 text-slate-200 mb-4 stroke-1" />
                <h4 className="text-base font-bold text-slate-700">Your Test Cart is Empty</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Browse available tests or health packages and add selections to request a quote.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center text-xs text-slate-500 px-1">
                  <span>Items</span>
                  <button onClick={clearCart} className="text-rose-500 hover:underline">
                    Clear All
                  </button>
                </div>

                <div className="space-y-3">
                  {cart.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-700">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {item.type === 'package' ? 'Health Package' : 'Laboratory Test'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 mt-1 truncate">
                          {item.name}
                        </h4>
                        <span className="text-xs text-slate-400 block font-mono">
                          {item.sampleType}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-700 block">
                          {item.price !== null && item.price !== undefined && item.price !== '' && Number.isFinite(Number(item.price))
                            ? `PKR ${Number(item.price).toLocaleString('en-PK')}`
                            : 'Price pending confirmation'}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-slate-300 hover:text-rose-500 transition-colors mt-1"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </>
            )}
          </div>

          {/* Footer Summary & Checkout Button */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
              <p className="text-xs text-slate-600">
              Only laboratory-confirmed catalogue prices are displayed. Confirm home-collection availability and any fee with the lab.
              </p>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 text-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>Request a Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                No payment is taken through this quote request
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
