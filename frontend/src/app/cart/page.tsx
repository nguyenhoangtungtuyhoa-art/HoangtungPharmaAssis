'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, ShoppingCart, Trash2, Plus, Minus, Check, 
  MapPin, Phone, CreditCard, DollarSign, Truck, Sparkles, X, Heart
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Medicine {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  isAvailable: boolean;
  activeIngredient: string;
  dosageForm: string;
  description: string;
  usage: string;
  sideEffects: string;
  imageUrl?: string;
}

// Fallback seed list corresponding to MOCK_MEDICINES
const MOCK_MEDICINES: Medicine[] = [
  {
    id: "MED001",
    name: "Paracetamol 500mg",
    category: "Giảm đau - hạ sốt",
    price: 1500,
    unit: "viên",
    isAvailable: true,
    activeIngredient: "Paracetamol 500mg",
    dosageForm: "Viên nén",
    description: "Thuốc giảm đau nhanh và hạ sốt hiệu quả.",
    usage: "Uống 1-2 viên mỗi 4-6 giờ khi cần.",
    sideEffects: "Tổn thương gan nếu dùng quá liều."
  },
  {
    id: "MED002",
    name: "Ibuprofen 400mg",
    category: "Giảm đau - hạ sốt",
    price: 3000,
    unit: "viên",
    isAvailable: true,
    activeIngredient: "Ibuprofen 400mg",
    dosageForm: "Viên nén bao phim",
    description: "Thuốc kháng viêm không steroid (NSAID).",
    usage: "Uống 1 viên sau ăn, ngày 2-3 lần.",
    sideEffects: "Rối loạn tiêu hóa, đau dạ dày."
  },
  {
    id: "MED003",
    name: "Vitamin C 500mg",
    category: "Vitamin & khoáng chất",
    price: 2000,
    unit: "viên",
    isAvailable: true,
    activeIngredient: "Acid Ascorbic 500mg",
    dosageForm: "Viên sủi",
    description: "Bổ sung Vitamin C giúp tăng cường sức đề kháng.",
    usage: "Hòa tan 1 viên trong nước, uống buổi sáng.",
    sideEffects: "Gây kích ứng dạ dày nhẹ nếu đói."
  },
  {
    id: "MED004",
    name: "Omeprazole 20mg",
    category: "Tiêu hóa",
    price: 3500,
    unit: "viên",
    isAvailable: true,
    activeIngredient: "Omeprazole 20mg",
    dosageForm: "Viên nang tan trong ruột",
    description: "Điều trị loét dạ dày và trào ngược dạ dày thực quản.",
    usage: "Uống 1 viên trước ăn sáng 30 phút.",
    sideEffects: "Buồn nôn, tiêu chảy nhẹ."
  },
  {
    id: "MED005",
    name: "Loratadine 10mg",
    category: "Cảm cúm - ho",
    price: 2500,
    unit: "viên",
    isAvailable: false,
    activeIngredient: "Loratadine 10mg",
    dosageForm: "Viên nén",
    description: "Thuốc kháng dị ứng thế hệ 2.",
    usage: "Uống 1 viên/ngày.",
    sideEffects: "Mệt mỏi, khô miệng."
  },
  {
    id: "MED006",
    name: "Telfast 180mg",
    category: "Cảm cúm - ho",
    price: 9000,
    unit: "viên",
    isAvailable: true,
    activeIngredient: "Fexofenadine hydrochloride 180mg",
    dosageForm: "Viên nén bao phim",
    description: "Thuốc kháng dị ứng thế hệ mới hiệu quả cao.",
    usage: "Uống 1 viên/ngày.",
    sideEffects: "Buồn ngủ nhẹ, mệt mỏi."
  },
  {
    id: "MED007",
    name: "Dung dịch sát khuẩn tay",
    category: "Sản phẩm khác",
    price: 25000,
    unit: "chai",
    isAvailable: true,
    activeIngredient: "Ethanol 70%, Glycerin, Aloe Vera",
    dosageForm: "Dung dịch xịt tay khô",
    description: "Nước rửa tay nhanh giúp diệt khuẩn 99.9% tức thì.",
    usage: "Xịt trực tiếp vào tay, xoa đều.",
    sideEffects: "Tránh tiếp xúc với mắt."
  },
  {
    id: "MED008",
    name: "Nhiệt kế điện tử hồng ngoại",
    category: "Thiết bị y tế",
    price: 150000,
    unit: "cái",
    isAvailable: true,
    activeIngredient: "Cảm biến nhiệt hồng ngoại",
    dosageForm: "Thiết bị điện tử cầm tay",
    description: "Đo nhiệt độ trán không tiếp xúc trong 1 giây.",
    usage: "Nhấn nút đo ở khoảng cách 1-3cm.",
    sideEffects: "N/A"
  }
];

export default function CartPage() {
  const [cartData, setCartData] = useState<{ [key: string]: number }>({});
  const [isMounted, setIsMounted] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>(MOCK_MEDICINES);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [shippingMethod, setShippingMethod] = useState('STANDARD'); // STANDARD (15k), FAST (35k)
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD, BANK_TRANSFER
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderCode, setOrderCode] = useState('');

  // Fetch API featured products on mount to ensure matching data
  useEffect(() => {
    setIsMounted(true);
    
    // Load from localStorage
    const savedCart = localStorage.getItem('retail_cart');
    if (savedCart) {
      try {
        setCartData(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error reading cart", e);
      }
    }

    // Try fetching database featured medicines
    const fetchMeds = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
        const res = await fetch(`${apiBaseUrl}/products/featured`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setMedicines(data);
          }
        }
      } catch (e) {
        console.log("Using local mock medicine catalog for retail cart details.");
      }
    };
    fetchMeds();
  }, []);

  // Sync back to local storage when cart changes
  const saveCart = (newCart: { [key: string]: number }) => {
    setCartData(newCart);
    localStorage.setItem('retail_cart', JSON.stringify(newCart));
  };

  const handleUpdateQty = (id: string, delta: number) => {
    const current = cartData[id] || 0;
    const next = current + delta;
    const newCart = { ...cartData };
    
    if (next <= 0) {
      delete newCart[id];
    } else {
      newCart[id] = next;
    }
    saveCart(newCart);
  };

  const handleRemoveItem = (id: string) => {
    const newCart = { ...cartData };
    delete newCart[id];
    saveCart(newCart);
  };

  const handleClearCart = () => {
    saveCart({});
  };

  // Map local storage cart IDs to full medicine details
  const cartItems = useMemo(() => {
    return Object.entries(cartData).map(([id, qty]) => {
      const med = medicines.find(m => m.id === id);
      return {
        medicine: med || ({
          id,
          name: `Sản phẩm ${id}`,
          price: 10000,
          unit: "sản phẩm",
          category: "Chưa rõ",
          activeIngredient: "N/A",
          dosageForm: "N/A",
          description: "",
          usage: "",
          sideEffects: "",
          imageUrl: "",
          isAvailable: true
        } as Medicine),
        quantity: qty
      };
    }).filter(item => item.quantity > 0);
  }, [cartData, medicines]);

  // Totals calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0);
  }, [cartItems]);

  const vatAmount = useMemo(() => {
    return Math.round(subtotal * 0.08); // 8% VAT
  }, [subtotal]);

  const shippingFee = useMemo(() => {
    if (subtotal === 0) return 0;
    return shippingMethod === 'FAST' ? 35000 : 15000;
  }, [subtotal, shippingMethod]);

  const totalAmount = useMemo(() => {
    return subtotal + vatAmount + shippingFee;
  }, [subtotal, vatAmount, shippingFee]);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!name || !phone || !address) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }

    const code = `OD-${Date.now().toString().slice(-8)}`;
    setOrderCode(code);
    setIsSubmitted(true);
    // Clear cart in local state and localStorage
    saveCart({});
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-cloud font-sans text-ink">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-hairline shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary text-white p-2 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-md font-bold tracking-tight text-ink">
                Pharma<span className="text-primary">Assist</span>
              </span>
              <span className="block text-[8px] text-graphite tracking-widest uppercase -mt-0.5">
                AI Intelligence
              </span>
            </div>
          </Link>

          <Link 
            href="/" 
            className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
          >
            <ArrowLeft size={14} /> Quay lại trang chủ
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        
        {isSubmitted ? (
          /* SUCCESS SCREEN */
          <div className="max-w-xl mx-auto bg-white border border-hairline rounded-3xl p-8 shadow-md text-center space-y-6 animate-fadeIn">
            <div className="inline-flex items-center justify-center bg-emerald-100 text-emerald-600 h-16 w-16 rounded-full shadow-inner">
              <Check size={32} className="stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-ink">Đặt hàng thành công!</h2>
              <p className="text-xs text-graphite leading-relaxed">
                Cảm ơn bạn đã tin tưởng PharmaAssist. Mã đơn hàng của bạn là <strong className="text-primary font-mono">{orderCode}</strong>.
                Chúng tôi sẽ liên hệ xác nhận đơn hàng qua số điện thoại sớm nhất.
              </p>
            </div>

            <div className="border border-hairline rounded-2xl p-4 bg-cloud/50 text-left space-y-3 text-xs text-charcoal">
              <div className="font-bold text-ink border-b border-hairline pb-1.5 uppercase tracking-wider text-[10px]">
                Thông tin nhận hàng
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-graphite">Người nhận:</span>
                <span className="col-span-2 font-bold text-ink-soft">{name}</span>
                <span className="text-graphite">Số điện thoại:</span>
                <span className="col-span-2 font-bold text-ink-soft">{phone}</span>
                <span className="text-graphite">Địa chỉ giao:</span>
                <span className="col-span-2 font-bold text-ink-soft">{address}</span>
                <span className="text-graphite">Thanh toán:</span>
                <span className="col-span-2 font-bold text-ink-soft">
                  {paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link 
                href="/" 
                className="flex-1 bg-primary hover:bg-primary-deep text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all uppercase tracking-wider text-center"
              >
                Tiếp tục mua thuốc
              </Link>
            </div>
          </div>
        ) : (
          /* CART & CHECKOUT PAGE */
          <div className="grid grid-cols-12 gap-8 items-start">
            
            {/* LEFT SIDE: CART ITEMS (col-span-7) */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
              <div className="bg-white border border-hairline rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-hairline flex items-center justify-between bg-cloud/30">
                  <h1 className="text-base font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" /> Giỏ hàng mua lẻ
                  </h1>
                  {cartItems.length > 0 && (
                    <button 
                      onClick={handleClearCart} 
                      className="text-xs text-rose-500 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Xóa tất cả
                    </button>
                  )}
                </div>

                {cartItems.length === 0 ? (
                  <div className="p-16 text-center text-graphite space-y-4">
                    <span className="text-5xl block">🛒</span>
                    <div>
                      <h3 className="font-bold text-ink text-sm">Giỏ hàng của bạn đang trống</h3>
                      <p className="text-xs text-graphite mt-1 max-w-sm mx-auto">
                        Hãy quay lại trang chủ, tra cứu thuốc và thêm vào giỏ để tiến hành thanh toán trực tuyến.
                      </p>
                    </div>
                    <Link 
                      href="/" 
                      className="inline-block bg-primary hover:bg-primary-deep text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all uppercase tracking-wider"
                    >
                      Quay lại chọn thuốc
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-hairline">
                    {cartItems.map(item => (
                      <div key={item.medicine.id} className="p-6 flex gap-4 items-start">
                        {/* Image Fallback */}
                        <div className="bg-cloud h-16 w-16 rounded-2xl flex items-center justify-center border border-hairline shrink-0 overflow-hidden relative">
                          {item.medicine.imageUrl ? (
                            <img src={item.medicine.imageUrl} alt={item.medicine.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Sparkles className="h-6 w-6 text-primary/30" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <span className="text-[9px] uppercase font-bold text-graphite tracking-wide bg-cloud px-1.5 py-0.5 rounded border border-hairline">
                            {item.medicine.category}
                          </span>
                          <h3 className="font-bold text-xs text-ink truncate leading-tight mt-1">{item.medicine.name}</h3>
                          <p className="text-[10px] text-graphite">
                            Hoạt chất: <span className="font-semibold text-ink-soft">{item.medicine.activeIngredient}</span>
                          </p>
                        </div>

                        {/* Quantity editor */}
                        <div className="flex items-center border border-steel rounded-xl h-8 overflow-hidden bg-white shrink-0">
                          <button 
                            onClick={() => handleUpdateQty(item.medicine.id, -1)}
                            className="px-2.5 hover:bg-cloud h-full text-graphite"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-ink">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => handleUpdateQty(item.medicine.id, 1)}
                            className="px-2.5 hover:bg-cloud h-full text-graphite"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div className="text-right min-w-[90px] shrink-0">
                          <div className="text-sm font-bold text-primary">
                            {(item.medicine.price * item.quantity).toLocaleString("vi-VN")}đ
                          </div>
                          <div className="text-[10px] text-graphite">
                            {item.medicine.price.toLocaleString("vi-VN")}đ/{item.medicine.unit}
                          </div>
                        </div>

                        <button 
                          onClick={() => handleRemoveItem(item.medicine.id)}
                          className="text-graphite hover:text-rose-500 p-1 shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: CUSTOMER INFO & PAYMENT (col-span-5) */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              
              {/* Delivery Form */}
              <Card className="bg-white border border-hairline rounded-3xl shadow-sm">
                <CardHeader className="p-6 border-b border-hairline bg-cloud/30 rounded-t-3xl">
                  <CardTitle className="text-xs font-bold uppercase text-graphite tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-4.5 w-4.5 text-primary" /> Thông tin nhận hàng & Thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleCheckout} className="space-y-4">
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-charcoal">Họ và tên người nhận *</label>
                      <Input
                        type="text"
                        required
                        placeholder="Nhập họ và tên đầy đủ..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-10 border-steel rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-charcoal">Số điện thoại liên hệ *</label>
                      <Input
                        type="tel"
                        required
                        placeholder="Nhập số điện thoại..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-10 border-steel rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-charcoal">Địa chỉ giao hàng đầy đủ *</label>
                      <textarea
                        required
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, thành phố..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full min-h-[70px] border border-steel rounded-xl p-3 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>

                    {/* Delivery Method */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-bold text-charcoal flex items-center gap-1">
                        <Truck size={14} className="text-primary" /> Phương thức vận chuyển
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          onClick={() => setShippingMethod('STANDARD')}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            shippingMethod === 'STANDARD'
                              ? "bg-primary-soft/30 border-primary text-primary-deep"
                              : "border-hairline hover:bg-cloud"
                          }`}
                        >
                          <div className="font-bold text-xs">Tiêu chuẩn (2-3 ngày)</div>
                          <div className="text-[10px] text-graphite mt-0.5">Phí: 15.000đ</div>
                        </div>

                        <div
                          onClick={() => setShippingMethod('FAST')}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            shippingMethod === 'FAST'
                              ? "bg-primary-soft/30 border-primary text-primary-deep"
                              : "border-hairline hover:bg-cloud"
                          }`}
                        >
                          <div className="font-bold text-xs">Hỏa tốc (Trong ngày)</div>
                          <div className="text-[10px] text-graphite mt-0.5">Phí: 35.000đ</div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-bold text-charcoal flex items-center gap-1">
                        <CreditCard size={14} className="text-primary" /> Phương thức thanh toán
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          onClick={() => setPaymentMethod('COD')}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                            paymentMethod === 'COD'
                              ? "bg-primary-soft/30 border-primary text-primary-deep"
                              : "border-hairline hover:bg-cloud"
                          }`}
                        >
                          <DollarSign size={16} className="text-emerald-600 shrink-0" />
                          <div className="font-bold text-xs">COD (Tiền mặt)</div>
                        </div>

                        <div
                          onClick={() => setPaymentMethod('BANK_TRANSFER')}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                            paymentMethod === 'BANK_TRANSFER'
                              ? "bg-primary-soft/30 border-primary text-primary-deep"
                              : "border-hairline hover:bg-cloud"
                          }`}
                        >
                          <CreditCard size={16} className="text-blue-600 shrink-0" />
                          <div className="font-bold text-xs">Chuyển khoản</div>
                        </div>
                      </div>
                    </div>

                    {/* Receipt Calculation */}
                    <div className="border-t border-hairline pt-3 space-y-2 text-xs text-charcoal">
                      <div className="flex justify-between">
                        <span>Tạm tính (chưa VAT):</span>
                        <span className="font-bold text-ink">{subtotal.toLocaleString("vi-VN")}đ</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thuế VAT (8%):</span>
                        <span className="font-bold text-ink">+{vatAmount.toLocaleString("vi-VN")}đ</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phí vận chuyển:</span>
                        <span className="font-bold text-ink">+{shippingFee.toLocaleString("vi-VN")}đ</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-t border-hairline-strong pt-2">
                        <span className="text-xs font-bold text-ink uppercase">Tổng cộng:</span>
                        <span className="text-base font-black text-primary">
                          {totalAmount.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={cartItems.length === 0}
                      className="w-full h-11 bg-primary hover:bg-primary-deep text-white text-xs font-bold uppercase rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 disabled:bg-steel disabled:cursor-not-allowed"
                    >
                      <Check size={16} /> Xác nhận đặt đơn hàng
                    </button>
                  </form>
                </CardContent>
              </Card>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
