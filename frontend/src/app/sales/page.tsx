'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Sidebar } from '@/components/sidebar';
import { RouteGuard } from '@/components/route-guard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, Shield, Search, Trash2, Plus, Minus, AlertTriangle, Check, 
  Printer, X, Sparkles, ShoppingCart, UserCheck, CreditCard, DollarSign, 
  Info, AlertCircle, RefreshCw, ChevronRight, FileText, ShieldAlert
} from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  activeIngredient: string;
  dosageForm: string;
  description: string;
  usage: string;
  sideEffects: string;
  imageUrl?: string;
}

interface CartItem {
  medicine: Medicine;
  quantity: number;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
}

interface DrugInteraction {
  medA: string;
  medB: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  recommendation: string;
}

// Mock Medicines for POS
const MOCK_MEDICINES: Medicine[] = [
  {
    id: "MED001",
    name: "Paracetamol 500mg",
    category: "Giảm đau - hạ sốt",
    price: 1500,
    unit: "viên",
    stock: 250,
    activeIngredient: "Paracetamol",
    dosageForm: "Viên nén",
    description: "Thuốc giảm đau nhanh và hạ sốt hiệu quả.",
    usage: "Uống 1-2 viên mỗi 4-6 giờ khi cần.",
    sideEffects: "Tổn thương gan nếu quá liều."
  },
  {
    id: "MED002",
    name: "Ibuprofen 400mg",
    category: "Giảm đau - hạ sốt",
    price: 3000,
    unit: "viên",
    stock: 12, // Low stock for warning demo
    activeIngredient: "Ibuprofen",
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
    stock: 300,
    activeIngredient: "Acid Ascorbic",
    dosageForm: "Viên sủi",
    description: "Bổ sung Vitamin C giúp tăng sức đề kháng.",
    usage: "Hòa tan 1 viên trong nước, uống buổi sáng.",
    sideEffects: "Gây kích ứng dạ dày nhẹ nếu đói."
  },
  {
    id: "MED004",
    name: "Omeprazole 20mg",
    category: "Tiêu hóa",
    price: 3500,
    unit: "viên",
    stock: 180,
    activeIngredient: "Omeprazole",
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
    stock: 90,
    activeIngredient: "Loratadine",
    dosageForm: "Viên nén",
    description: "Thuốc kháng histamin thế hệ 2 dị ứng.",
    usage: "Uống 1 viên/ngày.",
    sideEffects: "Khô miệng, nhức đầu."
  },
  {
    id: "MED006",
    name: "Telfast 180mg",
    category: "Cảm cúm - ho",
    price: 9000,
    unit: "viên",
    stock: 150,
    activeIngredient: "Fexofenadine",
    dosageForm: "Viên nén bao phim",
    description: "Kháng dị ứng thế hệ mới hiệu quả cao.",
    usage: "Uống 1 viên/ngày.",
    sideEffects: "Buồn ngủ nhẹ, mệt mỏi."
  },
  {
    id: "MED007",
    name: "Aspirin 81mg",
    category: "Giảm đau - hạ sốt",
    price: 1800,
    unit: "viên",
    stock: 200,
    activeIngredient: "Aspirin",
    dosageForm: "Viên nén",
    description: "Giảm đau, kháng viêm và ngừa huyết khối.",
    usage: "Uống sau ăn no theo hướng dẫn của bác sĩ.",
    sideEffects: "Loét dạ dày, xuất huyết đường tiêu hóa."
  },
  {
    id: "MED008",
    name: "Maalox Plus",
    category: "Tiêu hóa",
    price: 4000,
    unit: "viên",
    stock: 140,
    activeIngredient: "Al hydroxide & Mg hydroxide",
    dosageForm: "Viên nhai",
    description: "Thuốc kháng acid dạ dày, giảm chướng bụng đầy hơi.",
    usage: "Nhai kỹ 1-2 viên sau ăn hoặc khi đau.",
    sideEffects: "Táo bón hoặc tiêu chảy nhẹ."
  }
];

const MOCK_CUSTOMERS: Customer[] = [
  { id: 1, name: "Nguyễn Hoàng Tùng", phone: "0909123456" },
  { id: 2, name: "Trần Thanh Thảo", phone: "0987654321" },
  { id: 3, name: "Lê Minh Triết", phone: "0912345678" }
];

const DRUG_INTERACTIONS: DrugInteraction[] = [
  {
    medA: "Paracetamol",
    medB: "Ibuprofen",
    severity: "MEDIUM",
    description: "Sử dụng đồng thời Paracetamol và Ibuprofen có thể tăng nguy cơ tác dụng phụ lên dạ dày, thận hoặc gan nếu dùng liều cao kéo dài.",
    recommendation: "Khuyên bệnh nhân dùng cách nhau ít nhất 2 giờ hoặc giảm liều, uống sau ăn no."
  },
  {
    medA: "Loratadine",
    medB: "Fexofenadine",
    severity: "HIGH",
    description: "Dùng chung hai loại thuốc kháng histamin cùng nhóm làm tăng đáng kể nguy cơ quá liều, gây tác dụng phụ buồn ngủ nghiêm trọng, khô miệng kéo dài, và chóng mặt.",
    recommendation: "Tuyệt đối tránh sử dụng đồng thời. Chọn một trong hai hoạt chất để điều trị dị ứng."
  },
  {
    medA: "Aspirin",
    medB: "Ibuprofen",
    severity: "HIGH",
    description: "Ibuprofen có thể làm giảm tác dụng bảo vệ tim mạch của Aspirin liều thấp và tăng nguy cơ xuất huyết tiêu hóa.",
    recommendation: "Uống Ibuprofen ít nhất 8 giờ trước hoặc 30 phút sau khi uống Aspirin. Theo dõi dấu hiệu xuất huyết dạ dày."
  },
  {
    medA: "Omeprazole",
    medB: "Aspirin",
    severity: "LOW",
    description: "Omeprazole làm giảm độ acid dạ dày, có thể làm giảm kích ứng dạ dày của Aspirin nhưng có thể ảnh hưởng nhẹ đến sự hấp thu.",
    recommendation: "Không cần thay đổi đặc biệt, có thể uống cách nhau 1 giờ."
  }
];

export default function SalesPage() {
  const { user } = useAuth();
  
  // App states
  const [medicines, setMedicines] = useState<Medicine[]>(MOCK_MEDICINES);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Customer selection
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Billing states
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(8); // Standard VAT 8%
  const [consultationNote, setConsultationNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [receivedCash, setReceivedCash] = useState(0);
  
  // Checkout/Invoice Modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Categories extraction
  const categories = useMemo(() => {
    const list = new Set(medicines.map(m => m.category));
    return ["All", ...Array.from(list)];
  }, [medicines]);

  // Filtered medicines
  const filteredMedicines = useMemo(() => {
    return medicines.filter(med => {
      const matchesSearch = 
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.activeIngredient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || med.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, medicines]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return [];
    return MOCK_CUSTOMERS.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
    );
  }, [customerSearch]);

  // Cart operations
  const handleAddToCart = (medicine: Medicine) => {
    if (medicine.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.medicine.id === medicine.id);
      if (existing) {
        // Limit to available stock
        const newQty = Math.min(existing.quantity + 1, medicine.stock);
        return prev.map(item => 
          item.medicine.id === medicine.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { medicine, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (medicineId: string, qty: number) => {
    const med = medicines.find(m => m.id === medicineId);
    if (!med) return;
    const finalQty = Math.max(1, Math.min(qty, med.stock));
    
    setCart(prev => prev.map(item => 
      item.medicine.id === medicineId ? { ...item, quantity: finalQty } : item
    ));
  };

  const handleRemoveFromCart = (medicineId: string) => {
    setCart(prev => prev.filter(item => item.medicine.id !== medicineId));
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setConsultationNote("");
    setSelectedCustomer(null);
    setCustomerSearch("");
    setReceivedCash(0);
  };

  // Drug Interaction checker
  const activeInteractions = useMemo(() => {
    if (cart.length < 2) return [];
    const alerts: DrugInteraction[] = [];
    
    // Check all combinations of pairs in the cart
    for (let i = 0; i < cart.length; i++) {
      for (let j = i + 1; j < cart.length; j++) {
        const med1 = cart[i].medicine.activeIngredient;
        const med2 = cart[j].medicine.activeIngredient;
        
        // Find matching interaction rule
        const interaction = DRUG_INTERACTIONS.find(rule => 
          (rule.medA.toLowerCase() === med1.toLowerCase() && rule.medB.toLowerCase() === med2.toLowerCase()) ||
          (rule.medA.toLowerCase() === med2.toLowerCase() && rule.medB.toLowerCase() === med1.toLowerCase())
        );
        
        if (interaction) {
          alerts.push(interaction);
        }
      }
    }
    return alerts;
  }, [cart]);

  // Financial calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return Math.round(subtotal * (discountPercent / 100));
  }, [subtotal, discountPercent]);

  const taxAmount = useMemo(() => {
    return Math.round((subtotal - discountAmount) * (taxPercent / 100));
  }, [subtotal, discountAmount, taxPercent]);

  const totalAmount = useMemo(() => {
    return subtotal - discountAmount + taxAmount;
  }, [subtotal, discountAmount, taxAmount]);

  const changeDue = useMemo(() => {
    if (paymentMethod !== 'CASH') return 0;
    return Math.max(0, receivedCash - totalAmount);
  }, [receivedCash, totalAmount, paymentMethod]);

  // Checkout submission
  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Check for stock errors
    const hasStockError = cart.some(item => item.quantity > item.medicine.stock);
    if (hasStockError) {
      alert("Đơn hàng có thuốc vượt quá tồn kho thực tế. Vui lòng điều chỉnh lại số lượng.");
      return;
    }

    // Simulate database insertion and stock deduction
    const invoiceCode = `HD-${Date.now().toString().slice(-8)}`;
    const orderData = {
      code: invoiceCode,
      customer: selectedCustomer || { name: "Khách vãng lai", phone: "N/A" },
      items: [...cart],
      subtotal,
      discountPercent,
      discountAmount,
      taxPercent,
      taxAmount,
      totalAmount,
      paymentMethod,
      receivedCash: paymentMethod === 'CASH' ? receivedCash : totalAmount,
      changeDue: paymentMethod === 'CASH' ? Math.max(0, receivedCash - totalAmount) : 0,
      consultationNote,
      interactions: [...activeInteractions],
      staffName: user?.fullName || "Dược sĩ PharmaAssist",
      createdAt: new Date().toLocaleString("vi-VN")
    };

    // Deduct local stock
    setMedicines(prevMeds => prevMeds.map(med => {
      const cartItem = cart.find(item => item.medicine.id === med.id);
      if (cartItem) {
        return { ...med, stock: Math.max(0, med.stock - cartItem.quantity) };
      }
      return med;
    }));

    setCompletedOrder(orderData);
    setShowInvoiceModal(true);
  };

  const handleCompleteOrder = () => {
    setShowInvoiceModal(false);
    setCompletedOrder(null);
    handleClearCart();
  };

  const handlePrint = () => {
    window.print();
  };

  const displayRole = user?.roles?.includes('ADMIN') 
    ? 'Quản trị viên' 
    : 'Nhân viên bán hàng';

  return (
    <RouteGuard allowedRoles={['ADMIN', 'STAFF']}>
      <div className="flex min-h-screen bg-cloud font-sans text-ink">
        {/* Dynamic Sidebar */}
        <Sidebar currentPath="/sales" />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 print:hidden">
          <header className="h-16 bg-white border-b border-hairline flex items-center justify-between px-8 z-10 shadow-sm">
            <h1 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" /> Bán hàng tại quầy (POS)
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-xs text-charcoal bg-cloud px-3 py-1.5 rounded-md border border-hairline">
                <User className="h-4 w-4 text-graphite" />
                <span className="font-medium truncate max-w-[150px]">{user?.email}</span>
                <span className="text-gray-300">|</span>
                <Shield className="h-3 w-3 text-primary inline" />
                <span className="font-semibold text-primary">{displayRole}</span>
              </div>
            </div>
          </header>

          <main className="p-6 flex-1 overflow-y-auto grid grid-cols-12 gap-6 max-w-[1600px] w-full mx-auto">
            
            {/* COLUMN 1: MEDICINE LIST & SEARCH (col-span-7) */}
            <div className="col-span-12 xl:col-span-7 flex flex-col space-y-6">
              
              {/* Filter & Search Panel */}
              <Card className="bg-white border border-hairline rounded-2xl shadow-sm">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full">
                    <Input
                      type="text"
                      placeholder="Tìm thuốc theo tên, hoạt chất hoặc nhóm điều trị..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11 border-steel focus-visible:ring-primary rounded-xl"
                    />
                    <Search className="absolute left-3.5 top-3.5 text-graphite h-4.5 w-4.5" />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-3.5 text-graphite hover:text-ink">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Category Tabs */}
                  <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-300 whitespace-nowrap ${
                          selectedCategory === cat
                            ? "bg-primary text-white"
                            : "bg-cloud text-charcoal hover:bg-fog border border-hairline"
                        }`}
                      >
                        {cat === "All" ? "Tất cả" : cat}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Medicine Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMedicines.map(med => {
                  const isOutOfStock = med.stock <= 0;
                  const isLowStock = med.stock > 0 && med.stock <= 20;
                  const isInCart = cart.some(item => item.medicine.id === med.id);
                  
                  return (
                    <Card 
                      key={med.id} 
                      onClick={() => !isOutOfStock && handleAddToCart(med)}
                      className={`bg-white border rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                        isOutOfStock 
                          ? "opacity-60 border-hairline cursor-not-allowed" 
                          : isInCart 
                            ? "border-primary ring-1 ring-primary shadow-md"
                            : "border-hairline hover:border-primary-soft hover:shadow-md"
                      }`}
                    >
                      <div className="p-4 flex flex-col h-full justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-1 mb-2">
                            <span className="text-[10px] uppercase font-bold text-graphite tracking-wide bg-cloud px-2 py-0.5 rounded border border-hairline">
                              {med.category}
                            </span>
                            {isOutOfStock ? (
                              <Badge variant="destructive" className="text-[9px] font-bold px-1.5 py-0">HẾT HÀNG</Badge>
                            ) : isLowStock ? (
                              <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0">
                                CHỈ CÒN {med.stock}
                              </Badge>
                            ) : (
                              <span className="text-[11px] text-green-600 font-semibold">Tồn: {med.stock}</span>
                            )}
                          </div>

                          <h3 className="font-bold text-ink text-sm leading-snug line-clamp-1 group-hover:text-primary mb-1">
                            {med.name}
                          </h3>
                          <div className="flex items-center gap-1 text-[11px] text-graphite mb-3">
                            <span className="font-medium">Hoạt chất:</span>
                            <span className="truncate max-w-[150px] font-bold text-ink-soft">{med.activeIngredient}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-hairline pt-3 mt-2">
                          <div>
                            <span className="text-xs text-graphite">Đơn giá</span>
                            <div className="flex items-baseline">
                              <span className="text-sm font-black text-primary">{med.price.toLocaleString("vi-VN")}đ</span>
                              <span className="text-[10px] text-graphite">/{med.unit}</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            disabled={isOutOfStock}
                            className={`h-8 w-8 p-0 rounded-xl transition-all ${
                              isInCart 
                                ? "bg-primary text-white hover:bg-primary-deep" 
                                : "bg-cloud text-primary hover:bg-primary-soft border border-hairline"
                            }`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {filteredMedicines.length === 0 && (
                  <div className="col-span-full bg-white border border-hairline rounded-2xl p-12 text-center text-graphite">
                    <span className="text-3xl block mb-2">🔍</span>
                    Không tìm thấy thuốc phù hợp với từ khóa tìm kiếm.
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: SHOPPING CART & SUMMARY (col-span-5) */}
            <div className="col-span-12 xl:col-span-5 flex flex-col space-y-6">
              
              {/* Customer Selector */}
              <Card className="bg-white border border-hairline rounded-2xl shadow-sm z-20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-graphite tracking-wider flex items-center gap-1">
                      <UserCheck className="h-4 w-4 text-primary" /> Khách hàng
                    </span>
                    {selectedCustomer && (
                      <button 
                        onClick={() => { setSelectedCustomer(null); setCustomerSearch(""); }}
                        className="text-xs text-rose-500 font-semibold hover:underline"
                      >
                        Bỏ chọn
                      </button>
                    )}
                  </div>

                  {!selectedCustomer ? (
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Tìm khách hàng theo Tên hoặc Số điện thoại..."
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          setShowCustomerDropdown(true);
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                        className="h-10 border-steel rounded-xl text-xs pr-8"
                      />
                      <Search className="absolute right-3 top-3 h-4 w-4 text-graphite" />
                      
                      {/* Customer Dropdown Results */}
                      {showCustomerDropdown && customerSearch && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-steel rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto">
                          {filteredCustomers.map(c => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setSelectedCustomer(c);
                                setShowCustomerDropdown(false);
                              }}
                              className="p-3 hover:bg-cloud cursor-pointer flex justify-between items-center text-xs border-b border-hairline last:border-b-0"
                            >
                              <div>
                                <div className="font-bold text-ink">{c.name}</div>
                                <div className="text-[10px] text-graphite">{c.phone}</div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-graphite" />
                            </div>
                          ))}
                          {filteredCustomers.length === 0 && (
                            <div className="p-3 text-center text-xs text-graphite">
                              Không tìm thấy khách hàng.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-primary-soft/30 border border-primary-soft p-3 rounded-xl">
                      <div>
                        <div className="font-bold text-primary-deep text-sm">{selectedCustomer.name}</div>
                        <div className="text-xs text-charcoal">{selectedCustomer.phone}</div>
                      </div>
                      <Badge className="bg-primary text-white text-[10px] font-bold px-2 py-0.5">Khách VIP</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shopping Cart Content */}
              <Card className="bg-white border border-hairline rounded-2xl shadow-sm flex flex-col flex-1 min-h-[400px]">
                <CardHeader className="border-b border-hairline p-4 py-3 flex flex-row justify-between items-center bg-cloud/50 rounded-t-2xl">
                  <CardTitle className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    🛍️ Giỏ hàng ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                  </CardTitle>
                  {cart.length > 0 && (
                    <button 
                      onClick={handleClearCart}
                      className="text-xs text-rose-500 font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Xóa tất cả
                    </button>
                  )}
                </CardHeader>
                
                <CardContent className="p-0 flex-1 flex flex-col">
                  {cart.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-graphite">
                      <span className="text-4xl mb-2">🛒</span>
                      <p className="text-xs font-bold">Giỏ hàng đang trống</p>
                      <p className="text-[11px] text-graphite/80 max-w-[220px] mt-1">
                        Hãy chọn các mặt hàng thuốc ở cột trái để thêm vào đơn bán.
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto max-h-[300px] divide-y divide-hairline">
                      {cart.map(item => {
                        const totalLine = item.medicine.price * item.quantity;
                        const hasStockExceeded = item.quantity > item.medicine.stock;

                        return (
                          <div key={item.medicine.id} className={`p-4 flex gap-3 items-start ${hasStockExceeded ? 'bg-red-50' : ''}`}>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-xs text-ink truncate">{item.medicine.name}</h4>
                              <div className="text-[10px] text-graphite flex gap-2 mt-0.5">
                                <span>{item.medicine.activeIngredient}</span>
                                <span>|</span>
                                <span className="font-bold text-ink-soft">Tồn: {item.medicine.stock}</span>
                              </div>
                              {hasStockExceeded && (
                                <span className="text-[10px] text-red-500 font-semibold mt-1 block">
                                  ⚠️ Vượt quá tồn kho thực tế!
                                </span>
                              )}
                            </div>

                            {/* Quantity Editor */}
                            <div className="flex items-center border border-steel rounded-xl h-8 overflow-hidden bg-white">
                              <button 
                                onClick={() => handleUpdateQuantity(item.medicine.id, item.quantity - 1)}
                                className="px-2 hover:bg-cloud h-full text-graphite"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <input 
                                type="number" 
                                value={item.quantity}
                                onChange={(e) => handleUpdateQuantity(item.medicine.id, parseInt(e.target.value) || 1)}
                                className="w-10 text-center text-xs font-bold border-none outline-none focus:ring-0 p-0 h-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button 
                                onClick={() => handleUpdateQuantity(item.medicine.id, item.quantity + 1)}
                                className="px-2 hover:bg-cloud h-full text-graphite"
                                disabled={item.quantity >= item.medicine.stock}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <div className="text-right min-w-[70px]">
                              <div className="text-xs font-bold text-primary">{totalLine.toLocaleString("vi-VN")}đ</div>
                              <div className="text-[10px] text-graphite">{item.medicine.price.toLocaleString("vi-VN")}đ/{item.medicine.unit}</div>
                            </div>

                            <button 
                              onClick={() => handleRemoveFromCart(item.medicine.id)}
                              className="text-graphite hover:text-rose-500 p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Summary calculations */}
                  {cart.length > 0 && (
                    <div className="border-t border-hairline bg-cloud/40 p-4 space-y-3 mt-auto">
                      
                      {/* Calculations rows */}
                      <div className="space-y-1.5 text-xs text-charcoal">
                        <div className="flex justify-between">
                          <span>Tạm tính (chưa VAT):</span>
                          <span className="font-semibold text-ink">{subtotal.toLocaleString("vi-VN")}đ</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span>Chiết khấu (%):</span>
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="number" 
                              min="0" 
                              max="100"
                              value={discountPercent}
                              onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                              className="w-12 text-center text-xs border border-steel rounded-md py-0.5 px-1 focus:ring-primary focus:border-primary"
                            />
                            <span className="font-semibold text-ink-soft">-{discountAmount.toLocaleString("vi-VN")}đ</span>
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <span>Thuế VAT ({taxPercent}%):</span>
                          <span className="font-semibold text-ink">+{taxAmount.toLocaleString("vi-VN")}đ</span>
                        </div>
                      </div>

                      {/* Total Amount Row */}
                      <div className="flex justify-between items-center border-t border-hairline-strong pt-2">
                        <span className="text-sm font-bold text-ink uppercase">Tổng tiền thanh toán:</span>
                        <span className="text-lg font-black text-primary">{totalAmount.toLocaleString("vi-VN")}đ</span>
                      </div>

                      {/* Payment Settings */}
                      <div className="space-y-2 border-t border-hairline pt-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPaymentMethod("CASH")}
                            className={`flex-1 flex items-center justify-center gap-1 h-9 rounded-xl text-xs font-bold transition-all border ${
                              paymentMethod === "CASH"
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-charcoal border-hairline hover:bg-cloud"
                            }`}
                          >
                            <DollarSign className="h-4 w-4" /> Tiền mặt
                          </button>
                          <button
                            onClick={() => setPaymentMethod("BANK_TRANSFER")}
                            className={`flex-1 flex items-center justify-center gap-1 h-9 rounded-xl text-xs font-bold transition-all border ${
                              paymentMethod === "BANK_TRANSFER"
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-charcoal border-hairline hover:bg-cloud"
                            }`}
                          >
                            <CreditCard className="h-4 w-4" /> Chuyển khoản
                          </button>
                        </div>

                        {/* Cash input field if Cash is selected */}
                        {paymentMethod === "CASH" && (
                          <div className="flex justify-between items-center gap-2 bg-white border border-steel p-2 rounded-xl">
                            <span className="text-xs text-graphite font-semibold whitespace-nowrap">Tiền khách đưa:</span>
                            <div className="flex items-center gap-1 flex-1 justify-end">
                              <input 
                                type="number" 
                                min="0"
                                value={receivedCash}
                                onChange={(e) => setReceivedCash(parseInt(e.target.value) || 0)}
                                className="w-24 text-right text-xs font-bold border-none outline-none focus:ring-0 p-0 text-primary"
                              />
                              <span className="text-xs font-bold text-primary">đ</span>
                            </div>
                          </div>
                        )}

                        {paymentMethod === "CASH" && receivedCash > 0 && (
                          <div className="flex justify-between text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                            <span>Tiền thừa trả khách:</span>
                            <span>{changeDue.toLocaleString("vi-VN")}đ</span>
                          </div>
                        )}
                      </div>

                      {/* Checkout Submit */}
                      <Button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="w-full h-11 bg-primary text-white hover:bg-primary-deep text-xs font-bold uppercase rounded-xl transition-all shadow-md mt-1 flex items-center justify-center gap-2"
                      >
                        <Check className="h-4 w-4" /> Xác nhận thanh toán
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* INTERACTION ALERTS, DISCLAIMER, AND NOTES (col-span-12) */}
            <div className="col-span-12 flex flex-col md:flex-row gap-6">
              
              {/* Interaction warning list */}
              <div className="flex-1 flex flex-col space-y-4">
                <Card className="bg-white border border-hairline rounded-2xl shadow-sm flex-1">
                  <CardHeader className="p-4 py-3 border-b border-hairline">
                    <CardTitle className="text-xs font-bold uppercase text-graphite tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-amber-500" /> Kiểm tra tương tác thuốc ({activeInteractions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3.5">
                    {activeInteractions.map((alert, idx) => {
                      const isHigh = alert.severity === 'HIGH';
                      const isMedium = alert.severity === 'MEDIUM';
                      
                      return (
                        <div 
                          key={idx} 
                          className={`p-3.5 rounded-xl border flex gap-3 ${
                            isHigh 
                              ? 'bg-rose-50 border-rose-200 text-rose-950' 
                              : isMedium 
                                ? 'bg-amber-50 border-amber-200 text-amber-950' 
                                : 'bg-blue-50 border-blue-200 text-blue-950'
                          }`}
                        >
                          <div className="mt-0.5">
                            {isHigh ? (
                              <AlertCircle className="h-5 w-5 text-rose-600 animate-bounce" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-amber-600" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs">
                                Tương tác giữa: {alert.medA} ↔ {alert.medB}
                              </span>
                              <Badge className={`text-[9px] font-bold px-1.5 py-0 ${
                                isHigh 
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                                  : isMedium 
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                              }`}>
                                {alert.severity === 'HIGH' ? 'Nghiêm trọng (High)' : alert.severity === 'MEDIUM' ? 'Trung bình (Medium)' : 'Nhẹ (Low)'}
                              </Badge>
                            </div>
                            <p className="text-[11px] leading-relaxed text-charcoal">
                              <strong className="text-ink-soft">Nguy cơ:</strong> {alert.description}
                            </p>
                            <p className="text-[11px] leading-relaxed text-charcoal">
                              <strong className="text-ink-soft">Khuyến nghị dược sĩ:</strong> {alert.recommendation}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {cart.length < 2 && (
                      <div className="text-center p-6 text-xs text-graphite/80 flex flex-col items-center justify-center">
                        <Info className="h-5 w-5 text-graphite mb-1" />
                        Thêm từ 2 loại thuốc trở lên để hệ thống tự động kiểm tra tương tác thuốc.
                      </div>
                    )}

                    {cart.length >= 2 && activeInteractions.length === 0 && (
                      <div className="text-center p-6 text-xs text-emerald-600 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center justify-center gap-1.5">
                        <Check className="h-4.5 w-4.5 text-emerald-600" />
                        Không phát hiện tương tác thuốc nào trong giỏ hàng hiện tại. An toàn để kê đơn.
                      </div>
                    )}

                    {/* Disclaimer */}
                    <div className="text-[10px] text-graphite leading-relaxed border-t border-hairline pt-3 mt-1.5 flex gap-1.5">
                      <span className="font-bold text-rose-600">Disclamer:</span>
                      <span>
                        Hệ thống tự động cảnh báo tương tác thuốc rule-based mang tính chất tham khảo học thuật. Quyết định điều trị y tế cuối cùng thuộc về bác sĩ chuyên khoa hoặc dược sĩ có chuyên môn lâm sàng.
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Consultation Notes */}
              <div className="flex-1">
                <Card className="bg-white border border-hairline rounded-2xl shadow-sm h-full">
                  <CardHeader className="p-4 py-3 border-b border-hairline">
                    <CardTitle className="text-xs font-bold uppercase text-graphite tracking-wider flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-primary" /> Ghi chú tư vấn của Dược sĩ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col h-[calc(100%-45px)] min-h-[160px]">
                    <textarea
                      placeholder="Nhập hướng dẫn sử dụng, lưu ý tư vấn liều lượng hoặc giải pháp thay thế nếu có tương tác thuốc tại đây..."
                      value={consultationNote}
                      onChange={(e) => setConsultationNote(e.target.value)}
                      className="w-full flex-1 border border-steel focus:border-primary rounded-xl p-3 text-xs focus:outline-none resize-none min-h-[100px]"
                    />
                  </CardContent>
                </Card>
              </div>

            </div>

          </main>
        </div>

        {/* ==================== PRINTABLE INVOICE MODAL ==================== */}
        {showInvoiceModal && completedOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[480px] rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
              
              {/* Modal Actions */}
              <div className="flex justify-between items-center p-4 border-b border-hairline bg-cloud">
                <span className="text-xs font-bold text-ink uppercase tracking-wider">Hóa đơn thanh toán</span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handlePrint} className="bg-primary hover:bg-primary-deep text-white text-xs font-bold flex items-center gap-1 rounded-xl">
                    <Printer className="h-3.5 w-3.5" /> In hóa đơn
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCompleteOrder} className="text-xs font-bold border-steel rounded-xl">
                    Hoàn tất (Đơn mới)
                  </Button>
                </div>
              </div>

              {/* Receipt Body (scrollable) */}
              <div className="flex-1 p-6 overflow-y-auto font-mono text-[11px] text-ink-soft print:p-0 print:overflow-visible">
                {/* Physical print container style */}
                <div className="max-w-[400px] mx-auto space-y-4 print:max-w-full">
                  <div className="text-center space-y-1 border-b border-dashed border-steel pb-3">
                    <h2 className="text-sm font-bold text-ink tracking-wide">PHARMAASSIST AI</h2>
                    <p className="text-[10px] text-graphite uppercase tracking-widest">Pharmacy Smart Assistance</p>
                    <p className="text-[9px] text-graphite">123 Nguyễn Huệ, Quận 1, TP. HCM</p>
                    <p className="text-[9px] text-graphite">Hotline: 1800 6868</p>
                  </div>

                  <div className="space-y-1 pb-2 border-b border-dashed border-steel text-left">
                    <div className="flex justify-between">
                      <span>Mã hóa đơn:</span>
                      <span className="font-bold text-ink">{completedOrder.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thời gian:</span>
                      <span>{completedOrder.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nhân viên bán:</span>
                      <span>{completedOrder.staffName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Khách hàng:</span>
                      <span className="font-bold text-ink">{completedOrder.customer.name}</span>
                    </div>
                    {completedOrder.customer.phone && (
                      <div className="flex justify-between">
                        <span>SĐT Khách:</span>
                        <span>{completedOrder.customer.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Order Items Table */}
                  <table className="w-full text-left border-b border-dashed border-steel pb-2">
                    <thead>
                      <tr className="border-b border-dashed border-steel text-graphite">
                        <th className="py-1">Thuốc/Đơn vị</th>
                        <th className="py-1 text-center">SL</th>
                        <th className="py-1 text-right">Đ.Giá</th>
                        <th className="py-1 text-right">T.Tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed divide-hairline">
                      {completedOrder.items.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-1.5 pr-2">
                            <div>{item.medicine.name}</div>
                            <span className="text-[9px] text-graphite">/{item.medicine.unit}</span>
                          </td>
                          <td className="py-1.5 text-center">{item.quantity}</td>
                          <td className="py-1.5 text-right">{item.medicine.price.toLocaleString("vi-VN")}đ</td>
                          <td className="py-1.5 text-right">{ (item.medicine.price * item.quantity).toLocaleString("vi-VN") }đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Calculations */}
                  <div className="space-y-1 text-right border-b border-dashed border-steel pb-2">
                    <div className="flex justify-between">
                      <span>Cộng tiền hàng:</span>
                      <span>{completedOrder.subtotal.toLocaleString("vi-VN")}đ</span>
                    </div>
                    {completedOrder.discountPercent > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Chiết khấu ({completedOrder.discountPercent}%):</span>
                        <span>-{completedOrder.discountAmount.toLocaleString("vi-VN")}đ</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Thuế VAT ({completedOrder.taxPercent}%):</span>
                      <span>+{completedOrder.taxAmount.toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-primary pt-1">
                      <span>TỔNG TIỀN:</span>
                      <span>{completedOrder.totalAmount.toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>

                  {/* Payment details */}
                  <div className="space-y-1 pb-2 border-b border-dashed border-steel text-left">
                    <div className="flex justify-between">
                      <span>Phương thức:</span>
                      <span>{completedOrder.paymentMethod === "CASH" ? "Tiền mặt" : "Chuyển khoản"}</span>
                    </div>
                    {completedOrder.paymentMethod === "CASH" && (
                      <>
                        <div className="flex justify-between">
                          <span>Khách đưa:</span>
                          <span>{completedOrder.receivedCash.toLocaleString("vi-VN")}đ</span>
                        </div>
                        <div className="flex justify-between font-bold text-emerald-600">
                          <span>Trả lại:</span>
                          <span>{completedOrder.changeDue.toLocaleString("vi-VN")}đ</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Counseling advice printout */}
                  {completedOrder.consultationNote && (
                    <div className="p-3 bg-cloud border border-hairline rounded-xl text-left">
                      <div className="font-bold text-ink uppercase tracking-wider mb-1 flex items-center gap-1">
                        📝 Hướng dẫn & Dặn dò lâm sàng
                      </div>
                      <p className="text-[10px] text-charcoal leading-relaxed whitespace-pre-line font-sans">
                        {completedOrder.consultationNote}
                      </p>
                    </div>
                  )}

                  {/* Printed Interactions warning if any */}
                  {completedOrder.interactions.length > 0 && (
                    <div className="p-2 border border-rose-200 bg-rose-50/50 rounded-xl text-left space-y-1">
                      <div className="font-bold text-rose-800 text-[10px] uppercase">
                        ⚠️ Lưu ý tương tác thuốc phát hiện
                      </div>
                      {completedOrder.interactions.map((i: any, idx: number) => (
                        <div key={idx} className="text-[9px] text-rose-950 font-sans leading-tight">
                          • <strong className="font-bold text-ink-soft">{i.medA} + {i.medB}:</strong> {i.description}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-center pt-2 space-y-1 text-graphite text-[9px]">
                    <p className="font-bold">Cảm ơn quý khách! Chúc quý khách luôn khỏe mạnh.</p>
                    <p>Hệ thống hỗ trợ kê đơn PharmaAssist v1.0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
