import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? parsed.filter((item) => item && item.price !== null && item.price !== undefined && item.price !== '' && Number.isFinite(Number(item.price)))
        : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [collectionType, setCollectionType] = useState('home_collection'); // or 'branch_visit'
  const [selectedBranch, setSelectedBranch] = useState(null);

  useEffect(() => {
    localStorage.setItem('apex_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, type = 'test') => {
    const price = item.discountedPrice ?? item.packagePrice ?? item.price;
    if (price === null || price === undefined || price === '' || !Number.isFinite(Number(price))) return false;
    if (type === 'test' && (
      item.isActive === false
      || ['pending_verification', 'unavailable'].includes(item.availabilityStatus)
    )) return false;

    const exists = cart.find(i => i.id === item._id);
    if (!exists) {
      setCart(prev => [
        ...prev,
        {
          id: item._id,
          name: item.name,
          code: item.code,
          price: Number(price),
          type,
          sampleType: item.sampleType || (item.sampleTypes ? item.sampleTypes.join(', ') : 'Not confirmed'),
          fastingRequired: item.fastingRequired ?? null,
        }
      ]);
      return true;
    }
    return false;
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Pricing calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const homeCollectionFee = collectionType === 'home_collection' ? (subtotal >= 75 || subtotal === 0 ? 0 : 15) : 0;
  
  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = appliedCoupon.discountAmount || 0;
  }
  const totalAmount = Math.max(0, subtotal + homeCollectionFee - discountAmount);

  const applyCouponCode = async (code) => {
    try {
      const res = await api.post('/billing/coupons/apply', { code, amount: subtotal });
      setAppliedCoupon(res.data.coupon);
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid coupon code',
      };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        subtotal,
        homeCollectionFee,
        discountAmount,
        totalAmount,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        collectionType,
        setCollectionType,
        selectedBranch,
        setSelectedBranch,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
