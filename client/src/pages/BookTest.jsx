import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  CalendarCheck, 
  CheckCircle2, 
  Home, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Tag, 
  Clock, 
  ShieldCheck, 
  Banknote, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Search,
  Plus,
  Trash2
} from 'lucide-react';

const TIME_SLOTS = [
  '06:30 AM - 07:30 AM (Fasting Slot)',
  '07:30 AM - 08:30 AM (Fasting Slot)',
  '08:30 AM - 09:30 AM (Fasting Slot)',
  '09:30 AM - 10:30 AM',
  '11:00 AM - 12:00 PM',
  '02:00 PM - 03:00 PM',
  '04:00 PM - 05:00 PM',
  '05:30 PM - 06:30 PM',
];

export default function BookTest() {
  const { user, loading: authLoading } = useAuth();
  const { 
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
    setSelectedBranch
  } = useCart();

  const navigate = useNavigate();

  // Wizard Steps: 1: Tests Selection, 2: Collection & Schedule, 3: Patient Details, 4: Review & Payment, 5: Confirmation
  const [currentStep, setCurrentStep] = useState(1);

  // Available tests catalog for on-page quick selection
  const [catalogTests, setCatalogTests] = useState([]);
  const [testSearch, setTestSearch] = useState('');
  const [branches, setBranches] = useState([]);

  // Form State
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [branchId, setBranchId] = useState('');

  // Patient Info
  const [patientDetails, setPatientDetails] = useState({
    fullName: user?.name || '',
    age: '',
    gender: 'Male',
    phone: user?.phone || '',
    email: user?.email || '',
    address: {
      street: user?.addresses?.[0]?.street || '',
      city: user?.addresses?.[0]?.city || 'Timergara',
      state: user?.addresses?.[0]?.state || 'Lower Dir',
      zipCode: user?.addresses?.[0]?.zipCode || '',
      landmark: '',
    }
  });

  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_collection');
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState({ text: '', isError: false });

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [testsRes, branchRes] = await Promise.all([
          api.get('/tests'),
          api.get('/branches'),
        ]);
        setCatalogTests(testsRes.data.tests || []);
        const branchList = branchRes.data.branches || [];
        setBranches(branchList);
        if (branchList.length > 0 && !branchId) {
          setBranchId(branchList[0]._id);
        }
      } catch (err) {
        console.error('Failed to load booking catalog data', err);
      }
    };
    loadData();
  }, []);

  // Sync user info if logged in
  useEffect(() => {
    if (user) {
      setPatientDetails(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
        address: {
          ...prev.address,
          street: prev.address.street || user.addresses?.[0]?.street || '',
          city: prev.address.city || user.addresses?.[0]?.city || 'Timergara',
          state: prev.address.state || user.addresses?.[0]?.state || 'Lower Dir',
          zipCode: prev.address.zipCode || user.addresses?.[0]?.zipCode || '',
        }
      }));
    }
  }, [user]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = await applyCouponCode(couponInput);
    if (res.success) {
      setCouponMsg({ text: res.message, isError: false });
      setCouponInput('');
    } else {
      setCouponMsg({ text: res.message, isError: true });
    }
  };

  const handleCreateBooking = async () => {
    if (!user) {
      alert('Please sign in before booking so your patient record and report are linked to your account.');
      return;
    }

    if (cart.length === 0) {
      alert('Please select at least one medical test or health package.');
      setCurrentStep(1);
      return;
    }

    if (cart.some((item) => item.price === null || item.price === undefined || !Number.isFinite(Number(item.price)))) {
      alert('One or more selected items no longer have a confirmed price. Please remove them and contact the laboratory.');
      setCurrentStep(1);
      return;
    }

    if (!patientDetails.fullName || !patientDetails.phone || !patientDetails.age) {
      alert('Please fill out patient name, age, and phone number.');
      setCurrentStep(3);
      return;
    }

    if (collectionType === 'home_collection' && !patientDetails.address.street) {
      alert('Please provide street address for home sample collection.');
      setCurrentStep(3);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patientDetails,
        collectionType,
        branchId: collectionType === 'branch_visit' ? branchId : null,
        appointmentDate,
        timeSlot,
        items: cart.map(i => ({
          itemType: i.type,
          itemId: i.id,
          itemName: i.name,
          itemCode: i.code,
          price: i.price,
        })),
        couponCode: appliedCoupon?.code || '',
        paymentMethod,
        specialInstructions,
      };

      const res = await api.post('/bookings', payload);
      setConfirmedBooking({ ...res.data.booking, sampleId: res.data.sampleId });
      clearCart();
      setCurrentStep(5); // Confirmation step
    } catch (err) {
      console.error('Booking failed', err);
      alert(err.response?.data?.message || 'Failed to complete appointment booking. Please check details.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCatalog = catalogTests.filter(t => 
    t.name.toLowerCase().includes(testSearch.toLowerCase()) || 
    t.code.toLowerCase().includes(testSearch.toLowerCase())
  );

  if (authLoading) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-sm text-slate-500">Loading your patient account…</div>;
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">Sign in to book your tests</h1>
          <p className="mt-3 text-sm text-slate-600">
            Your selected tests stay in your cart. Sign in or create an account to receive a booking ID, track your sample, and find approved reports later in My Laboratory Reports.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/login" state={{ from: '/book-test' }} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Sign In</Link>
            <Link to="/register" state={{ from: '/book-test' }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Step Indicator Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
          Online Appointment Booking Wizard
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Book Laboratory Tests & Phlebotomy
        </h1>
      </div>

      {/* Steps Breadcrumbs */}
      {currentStep < 5 && (
        <div className="grid grid-cols-4 gap-2 bg-white p-3 rounded-2xl border border-slate-200 text-xs font-bold text-center">
          <button 
            onClick={() => setCurrentStep(1)}
            className={`py-2 rounded-xl transition-all ${currentStep === 1 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            1. Select Tests ({cart.length})
          </button>
          <button 
            onClick={() => cart.length > 0 && setCurrentStep(2)}
            disabled={cart.length === 0}
            className={`py-2 rounded-xl transition-all ${currentStep === 2 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50 disabled:opacity-40'}`}
          >
            2. Schedule & Visit
          </button>
          <button 
            onClick={() => cart.length > 0 && setCurrentStep(3)}
            disabled={cart.length === 0}
            className={`py-2 rounded-xl transition-all ${currentStep === 3 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50 disabled:opacity-40'}`}
          >
            3. Patient Details
          </button>
          <button 
            onClick={() => cart.length > 0 && setCurrentStep(4)}
            disabled={cart.length === 0}
            className={`py-2 rounded-xl transition-all ${currentStep === 4 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50 disabled:opacity-40'}`}
          >
            4. Review & Pay
          </button>
        </div>
      )}

      {/* STEP 1: TEST SELECTION */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Select Laboratory Tests or Health Packages
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Search from our tests catalog and add multiple tests to a single booking.
                </p>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
                >
                  <span>Continue to Scheduling</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Currently Selected Tests Box */}
            {cart.length > 0 && (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-3">
                <span className="text-xs font-bold text-blue-900 block">
                  Currently Selected Items in This Booking ({cart.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cart.map((item, index) => (
                    <div key={item.id} className="p-3 bg-white rounded-xl border border-blue-200/70 flex items-center justify-between gap-2 shadow-xs">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-extrabold text-blue-700">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-800 truncate">{item.name}</h5>
                        <span className="text-[10px] text-slate-400 font-mono">${item.price} | {item.sampleType}</span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-300 hover:text-rose-500 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Search inside booking wizard */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tests by name or code (e.g. CBC, Lipid, Thyroid, HbA1c)..."
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {/* Tests Catalog List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-1">
              {filteredCatalog.map((t) => {
                const selectedIndex = cart.findIndex(i => i.id === t._id);
                const inCart = selectedIndex !== -1;
                const testPrice = t.discountedPrice !== null && t.discountedPrice !== undefined ? t.discountedPrice : t.price;
                const hasConfirmedPrice = testPrice !== null && testPrice !== undefined && testPrice !== '' && Number.isFinite(Number(testPrice));
                const canBook = t.isActive !== false
                  && (t.availabilityStatus || 'available') === 'available'
                  && hasConfirmedPrice;
                return (
                  <div key={t._id} className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 bg-white flex items-center justify-between gap-3 shadow-xs transition-colors">
                    <div className="min-w-0 flex-1">
                      {inCart && (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-extrabold text-white">
                          {String(selectedIndex + 1).padStart(2, '0')}
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {t.department}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">{t.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                        <span>Code: {t.code}</span>
                        <span>•</span>
                        <span className="text-slate-800 font-bold">
                          {hasConfirmedPrice ? `PKR ${Number(testPrice).toLocaleString('en-PK')}` : 'Price pending confirmation'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => inCart ? removeFromCart(t._id) : addToCart(t, 'test')}
                      disabled={!inCart && !canBook}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                        inCart
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : canBook ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {inCart ? 'Selected' : canBook ? '+ Add' : 'Not bookable'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={cart.length === 0}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 text-sm flex items-center gap-2 disabled:opacity-40"
            >
              <span>Next: Select Date & Location</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: COLLECTION TYPE & SCHEDULE */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-900">
              Appointment Logistics & Time Slot
            </h3>

            {/* Collection Mode Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Choose Where Sample Is Drawn:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setCollectionType('home_collection')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    collectionType === 'home_collection'
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Home className={`w-6 h-6 mb-2 ${collectionType === 'home_collection' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <h4 className="text-sm font-bold text-slate-900">Doorstep Home Collection</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Certified phlebotomist arrives at your residence with sterile vacuum tubes.
                  </p>
                  <span className="text-[11px] font-bold text-blue-600 mt-2 block">
                    {subtotal >= 75 ? 'FREE on orders $75+' : '$15 standard dispatch fee'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCollectionType('branch_visit')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    collectionType === 'branch_visit'
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Building2 className={`w-6 h-6 mb-2 ${collectionType === 'branch_visit' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <h4 className="text-sm font-bold text-slate-900">Visit Laboratory Branch</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Visit MALAK Lab Science Hub at your selected appointment time.
                  </p>
                  <span className="text-[11px] font-bold text-blue-600 mt-2 block">
                    No collection surcharge
                  </span>
                </button>
              </div>
            </div>

            {/* If Branch Visit, choose Branch */}
            {collectionType === 'branch_visit' && (
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Select Diagnostic Branch Center:
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} — {b.address.street}, {b.address.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date & Time Slot Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Preferred Appointment Date:
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Preferred Time Slot:
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {TIME_SLOTS.map((slot, i) => (
                    <option key={i} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 text-sm flex items-center gap-2"
            >
              <span>Next: Patient Information</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PATIENT INFORMATION */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-900">
              Patient Demographics & Contact
            </h3>
            <p className="text-xs text-slate-500 -mt-3">
              These details will be printed on the official verified diagnostic report.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Patient Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Johnathan Doe"
                  value={patientDetails.fullName}
                  onChange={(e) => setPatientDetails({ ...patientDetails, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Age (Years) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  placeholder="e.g. 38"
                  value={patientDetails.age}
                  onChange={(e) => setPatientDetails({ ...patientDetails, age: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Gender *
                </label>
                <select
                  value={patientDetails.gender}
                  onChange={(e) => setPatientDetails({ ...patientDetails, gender: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mobile Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="03XX XXXXXXX"
                  value={patientDetails.phone}
                  onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email (for PDF Report Delivery)
                </label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={patientDetails.email}
                  onChange={(e) => setPatientDetails({ ...patientDetails, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Address fields (Mandatory if Home Collection) */}
            {collectionType === 'home_collection' && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Home Collection Address
                </h4>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Street Address & Apartment / Unit *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                    value={patientDetails.address.street}
                    onChange={(e) => setPatientDetails({
                      ...patientDetails,
                      address: { ...patientDetails.address, street: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                    <input
                      type="text"
                      value={patientDetails.address.city}
                      onChange={(e) => setPatientDetails({
                        ...patientDetails,
                        address: { ...patientDetails.address, city: e.target.value }
                      })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
                    <input
                      type="text"
                      value={patientDetails.address.state}
                      onChange={(e) => setPatientDetails({
                        ...patientDetails,
                        address: { ...patientDetails.address, state: e.target.value }
                      })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Zip Code</label>
                    <input
                      type="text"
                      value={patientDetails.address.zipCode}
                      onChange={(e) => setPatientDetails({
                        ...patientDetails,
                        address: { ...patientDetails.address, zipCode: e.target.value }
                      })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Special Instructions or Medical Notes (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Ring doorbell twice, difficult vein access, patient fasting since 9 PM..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={() => {
                if (!patientDetails.fullName || !patientDetails.phone || !patientDetails.age) {
                  alert('Please enter patient name, age, and phone number.');
                  return;
                }
                setCurrentStep(4);
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 text-sm flex items-center gap-2"
            >
              <span>Next: Review & Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & PAYMENT METHOD */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Review Booking Details
                </h3>

                {/* Patient Summary Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-sm">{patientDetails.fullName}</span>
                    <span className="text-slate-500">{patientDetails.age} Yrs / {patientDetails.gender}</span>
                  </div>
                  <div className="text-slate-500">
                    Phone: {patientDetails.phone} | Email: {patientDetails.email || 'N/A'}
                  </div>
                  <div className="text-slate-500">
                    Mode: <strong className="text-slate-700">{collectionType === 'home_collection' ? 'Home Sample Collection' : 'Branch Visit'}</strong>
                  </div>
                  <div className="text-slate-500">
                    Date & Slot: <strong className="text-slate-700">{new Date(appointmentDate).toDateString()} ({timeSlot})</strong>
                  </div>
                </div>

                {/* Tests Items List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Tests Included ({cart.length})
                  </h4>
                  {cart.map((item, index) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
                      <div>
                        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[10px] font-extrabold text-blue-700">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{item.sampleType}</span>
                      </div>
                      <span className="font-bold text-slate-900">${item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Payment Method Selector */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Select Payment Method:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash_on_collection')}
                      className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                        paymentMethod === 'cash_on_collection'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-800'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Banknote className="w-5 h-5 text-blue-600 shrink-0" />
                      <div className="text-left">
                        <span>Cash / Card on Sample Collection</span>
                        <span className="block text-[10px] font-normal text-slate-400">Pay to Phlebotomist or Front Desk</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Price Breakdown & Confirm CTA */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4">
                <h4 className="text-base font-bold text-slate-900">Payment Breakdown</h4>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Tests Subtotal:</span>
                    <span className="font-semibold text-slate-900">${subtotal}</span>
                  </div>
                  {collectionType === 'home_collection' && (
                    <div className="flex justify-between">
                      <span>Phlebotomy Dispatch:</span>
                      <span>{homeCollectionFee === 0 ? <span className="text-blue-600 font-bold">FREE</span> : `$${homeCollectionFee}`}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-blue-600 font-bold">
                      <span>Discount ({appliedCoupon?.code}):</span>
                      <span>-${discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-black text-slate-900 pt-3 border-t border-slate-200">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">${totalAmount}</span>
                  </div>
                </div>

                {/* Coupon input */}
                {!appliedCoupon && (
                  <form onSubmit={handleApplyCoupon} className="pt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 text-xs uppercase font-mono rounded-xl border border-slate-200"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponMsg.text && (
                  <p className={`text-[11px] ${couponMsg.isError ? 'text-rose-500' : 'text-blue-600'}`}>
                    {couponMsg.text}
                  </p>
                )}

                <button
                  onClick={handleCreateBooking}
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-extrabold rounded-2xl shadow-xl shadow-blue-600/20 text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Confirming Appointment...' : `Confirm & Book Appointment ($${totalAmount})`}
                </button>

                <p className="text-[10px] text-slate-400 text-center">
                  By confirming, you agree to MALAK Lab Science Hub appointment and sample collection instructions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-start">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Patient Details</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: INSTANT CONFIRMATION */}
      {currentStep === 5 && confirmedBooking && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
              Booking Confirmed Successfully
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Appointment Scheduled!
            </h2>
            <p className="text-sm text-slate-600">
              Your test appointment has been registered in our automated laboratory system.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-bold">Booking Reference ID:</span>
              <span className="font-mono text-base font-black text-blue-600">{confirmedBooking.bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Patient:</span>
              <span className="font-bold text-slate-800">{confirmedBooking.patientDetails.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Patient Record ID:</span>
              <span className="font-mono font-bold text-slate-800">{confirmedBooking.patientNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sample Tracking ID:</span>
              <span className="font-mono font-bold text-slate-800">{confirmedBooking.sampleId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scheduled Date:</span>
              <span className="font-bold text-slate-800">{new Date(confirmedBooking.appointmentDate).toDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time Slot:</span>
              <span className="font-bold text-slate-800">{confirmedBooking.timeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Collection Type:</span>
              <span className="font-bold text-slate-800 uppercase">{confirmedBooking.collectionType.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
              <span>Total Payable:</span>
              <span className="text-slate-900">${confirmedBooking.totalAmount} ({confirmedBooking.paymentStatus.toUpperCase()})</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to={`/customer/track/${confirmedBooking.bookingId}`}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Track Sample Progress</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/customer/bookings"
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
            >
              Go to My Customer Portal
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
