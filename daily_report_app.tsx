import React, { useState, useEffect, useRef } from 'react';

// --- MOCK DATA (Silakan sesuaikan dengan data dari Excel Anda) ---
const MOCK_OPERATORS = [
  "Dariman", "Aep Rahman", "Saiful Azis", "M. Febrian", "Sutarto", 
  "Suhendrik", "Ali Samsuri", "Yesman T.", "Riantanto", "Imam Tohiri", 
  "Aditya H.W.", "Bima Kanu", "M. Iksal H.", "Norman S.", "Danna Y.", 
  "Joko P.", "Yanwar S.", "Rahman Y.", "Dian Sanjaya"
];
const MOCK_AREAS = [
  "Incoming Material", "Testing Area", "Blasting Area", "Painting Area", 
  "CNC Area", "Repair / Workshop Area", "Machining Area", "Packing Area", 
  "Dispatch / Delivery Area", "General Area", "Field Assignment (Dinas Luar)", 
  "New Factory"
];
const MOCK_SO = [
  "001/TR/AVI/0126 - PT. TIMAS SUPLINDO",
  "002/TR/AVI/0126 - PT. DENSON PRIMA UTAMA",
  "004/TR/AVI/0226 - PT. REKAYASA INDUSTRI",
  "005/AVI/0226 - PT. KOMALASARI",
  "006/TR/AVI/0226 - PT. ANUGERAH TEKNIK ASIA",
  "007/TR/AVI/0226 - PT. WIJAYA KARYA (Persero) Tbk.",
  "010/TR/AVI/0326 - PT. ATAMORA TEHNIK MAKMUR",
  "011/AVI/0325 R.1 - PT. PP PERSERO Tbk.",
  "012/TR/AVI/0326 - PT. ATAMORA TEHNIK MAKMUR",
  "013/TR/AVI/0326 - PT. ATAMORA TEHNIK MAKMUR",
  "014/TR/AVI/0426 - PT. BERJAYA SUKSES MAKMUR",
  "015/AVI/0425 - PT. AZYMUTH CITRA PERKASA",
  "015/TR/AVI/0426 - PT. JGC INDONESIA",
  "017/TR/AVI/0426 - PT. ATAMORA TEHNIK MAKMUR",
  "018/TR/AVI/0426 - PT. JASA KITA BERSAMA",
  "019/TR/AVI/0426 - PT. TIMAS SUPLINDO",
  "020/AVI/TR/0526 - PT. PP PERSERO Tbk.",
  "021/TR/AVI/0526 - PT. TIMAS SUPLINDO",
  "025/TR/AVI/0726 - PT. WIJAYA KARYA (Persero) Tbk.",
  "030/AVI/1025 R.1BATCH II - PT. WIJAYA KARYA (Persero) Tbk."
];
const MOCK_VALVE_TYPES = [
  "BALL", "BUTTERFLY", "CHECK", "GATE", "GLOBE", "PLUG", "STRAINER"
];
const MOCK_VALVE_SIZES = [
  "1/2\"", "3/4\"", "1\"", "1-1/2\"", "2\"", "3\"", "4\"", "6\"", "8\"", "10\"", 
  "12\"", "14\"", "16\"", "18\"", "20\"", "22\"", "24\"", "26\"", "28\"", "30\"", 
  "32\"", "34\"", "36\""
];
const MOCK_VALVE_CLASSES = [
  "150#", "300#", "600#", "800#", "900#", "1500#", "2500#"
];
const MOCK_ACTIVITIES = [
  "Unboxing Incoming",
  "Internal Hydrotest / Gas Test",
  "Witness Hydrotest / Gas Test",
  "Preparation Blasting",
  "Sand Blasting",
  "Primer Coating",
  "Second Coating",
  "Top Coating",
  "Repair Leak",
  "Repair Seat",
  "Repair Body",
  "General Repair",
  "Machining",
  "Final Check",
  "Packing Material",
  "Loading for Delivery"
];
const SPECIAL_AREAS = ["General Area", "Field Assignment (Dinas Luar)", "New Factory"];

export default function DailyReportApp() {
  const [darkMode, setDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: '', body: '', isError: false });

  // Form States
  const [reportDate, setReportDate] = useState('');
  const [workShift, setWorkShift] = useState('');
  
  // Operator State (Multi-select with custom input)
  const [availableOperators, setAvailableOperators] = useState(MOCK_OPERATORS);
  const [selectedOperators, setSelectedOperators] = useState([]);
  const [operatorSearch, setOperatorSearch] = useState('');
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);

  const [productionArea, setProductionArea] = useState('');
  
  // Conditional States based on Production Area
  const isSpecialArea = SPECIAL_AREAS.includes(productionArea);

  // SO State
  const [salesOrderDropdown, setSalesOrderDropdown] = useState('');
  const [salesOrderText, setSalesOrderText] = useState('');

  // Valve State
  const [valveList, setValveList] = useState([]); // For normal areas
  const [currentValveType, setCurrentValveType] = useState('');
  const [currentValveSize, setCurrentValveSize] = useState('');
  const [currentValveClass, setCurrentValveClass] = useState('');
  const [currentValveQty, setCurrentValveQty] = useState('');
  const [valveText, setValveText] = useState(''); // For special areas

  // Activity State
  const [activityDropdown, setActivityDropdown] = useState('');
  const [activityText, setActivityText] = useState('');

  // File Upload State
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const triggerModal = (title, body, isError = false) => {
    setModalMessage({ title, body, isError });
    setShowModal(true);
  };

  const handleClearData = () => {
    setReportDate('');
    setWorkShift('');
    setSelectedOperators([]);
    setOperatorSearch('');
    setProductionArea('');
    setSalesOrderDropdown('');
    setSalesOrderText('');
    setValveList([]);
    setCurrentValveType('');
    setCurrentValveSize('');
    setCurrentValveClass('');
    setCurrentValveQty('');
    setValveText('');
    setActivityDropdown('');
    setActivityText('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // VALIDATIONS
    if (!reportDate) return triggerModal("Validasi Gagal", "Tanggal Laporan wajib diisi.", true);
    if (!workShift) return triggerModal("Validasi Gagal", "Work Shift wajib dipilih.", true);
    if (selectedOperators.length === 0) return triggerModal("Validasi Gagal", "Minimal 1 Operator Name wajib dipilih/diisi.", true);
    if (!productionArea) return triggerModal("Validasi Gagal", "Production Area wajib dipilih.", true);
    
    if (isSpecialArea) {
      if (!salesOrderText.trim()) return triggerModal("Validasi Gagal", "Keterangan Sales Order wajib diisi.", true);
      if (!valveText.trim()) return triggerModal("Validasi Gagal", "Keterangan Type Valve wajib diisi.", true);
      if (!activityText.trim()) return triggerModal("Validasi Gagal", "Keterangan Activity / Remarks wajib diisi.", true);
    } else {
      if (!salesOrderDropdown) return triggerModal("Validasi Gagal", "Sales Order wajib dipilih.", true);
      if (valveList.length === 0) return triggerModal("Validasi Gagal", "Minimal 1 Data Valve wajib ditambahkan.", true);
      if (!activityDropdown) return triggerModal("Validasi Gagal", "Activity / Remarks wajib dipilih.", true);
    }

    // If passed validation, show success and clear data
    triggerModal("Berhasil!", "Laporan Harian Anda berhasil disimpan.");
    handleClearData();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
        triggerModal("File Terlalu Besar", "Ukuran file tidak boleh lebih dari 5MB.", true);
        e.target.value = ''; // Reset input
        setFile(null);
      } else {
        setFile(selectedFile);
      }
    }
  };

  const addOperator = (op) => {
    if (!selectedOperators.includes(op)) {
      setSelectedOperators([...selectedOperators, op]);
    }
    setOperatorSearch('');
    setShowOperatorDropdown(false);
  };

  const removeOperator = (opToRemove) => {
    setSelectedOperators(selectedOperators.filter(op => op !== opToRemove));
  };

  const handleAddNewOperator = () => {
    if (operatorSearch.trim() && !availableOperators.includes(operatorSearch.trim())) {
      const newOp = operatorSearch.trim();
      setAvailableOperators([...availableOperators, newOp]);
      addOperator(newOp);
    }
  };

  const handleAddValve = () => {
    if (!currentValveType || !currentValveSize || !currentValveClass || !currentValveQty) {
      triggerModal("Data Belum Lengkap", "Harap lengkapi Type, Size, Class, dan Qty sebelum menambahkan valve.", true);
      return;
    }
    const qtyNum = parseInt(currentValveQty, 10);
    if (isNaN(qtyNum) || qtyNum < 1 || qtyNum > 99) {
      triggerModal("Validasi Qty", "Quantity hanya boleh berupa angka dari 1 hingga 99.", true);
      return;
    }

    const newValve = {
      type: currentValveType,
      size: currentValveSize,
      valveClass: currentValveClass,
      qty: qtyNum
    };
    
    setValveList([...valveList, newValve]);
    // Reset subform
    setCurrentValveType('');
    setCurrentValveSize('');
    setCurrentValveClass('');
    setCurrentValveQty('');
  };

  const removeValve = (index) => {
    setValveList(valveList.filter((_, i) => i !== index));
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen font-sans`}>
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-slate-700">
          
          {/* Header */}
          <div className="bg-blue-600 dark:bg-blue-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <img src="Logo Alfa_2.png" alt="PT. Alfa Valves Indonesia" className="h-12 w-auto object-contain" onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "https://placehold.co/120x40/ffffff/000000?text=ALFA+VALVES";
                }} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Daily Report</h1>
                <p className="text-blue-100 text-sm">PT. Alfa Valves Indonesia</p>
              </div>
            </div>
            
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-400 dark:bg-blue-700 dark:hover:bg-blue-600 text-white transition-colors"
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {}
              {/* 1. Tanggal Laporan */}
              <div>
                <label className="block text-sm font-semibold mb-2">1. Tanggal Laporan <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {/* 2. Work Shift */}
              <div>
                <label className="block text-sm font-semibold mb-2">2. Work Shift <span className="text-red-500">*</span></label>
                <select 
                  value={workShift}
                  onChange={(e) => setWorkShift(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="">-- Pilih Shift --</option>
                  <option value="Non Shift (08:00 - 17:00)">Non Shift (08:00 - 17:00)</option>
                  <option value="Shift 1 (08:00 - 17:00)">Shift 1 (08:00 - 17:00)</option>
                  <option value="Shift 2 (15:00 - 00:00)">Shift 2 (15:00 - 00:00)</option>
                </select>
              </div>
            </div>

            {/* 3. Operator Name */}
            <div className="relative">
              <label className="block text-sm font-semibold mb-2">3. Operator Name <span className="text-red-500">*</span></label>
              <div className="w-full min-h-[42px] px-2 py-1 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus-within:ring-2 focus-within:ring-blue-500 flex flex-wrap items-center gap-2 transition-all">
                {selectedOperators.map((op, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs font-medium px-2.5 py-1 rounded flex items-center gap-1 shadow-sm">
                    {op}
                    <button type="button" onClick={() => removeOperator(op)} className="hover:text-red-500 font-bold focus:outline-none">&times;</button>
                  </span>
                ))}
                <input 
                  type="text" 
                  value={operatorSearch}
                  onChange={(e) => {
                    setOperatorSearch(e.target.value);
                    setShowOperatorDropdown(true);
                  }}
                  onFocus={() => setShowOperatorDropdown(true)}
                  placeholder={selectedOperators.length === 0 ? "Ketik atau pilih nama operator..." : ""}
                  className="flex-1 bg-transparent outline-none min-w-[150px] p-1 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                />
              </div>
              
              {showOperatorDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {availableOperators
                    .filter(op => op.toLowerCase().includes(operatorSearch.toLowerCase()) && !selectedOperators.includes(op))
                    .map((op, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => addOperator(op)}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors"
                      >
                        {op}
                      </div>
                    ))}
                  {operatorSearch.trim() && !availableOperators.some(op => op.toLowerCase() === operatorSearch.toLowerCase()) && (
                    <div 
                      onClick={handleAddNewOperator}
                      className="px-4 py-2 cursor-pointer text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-600 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Tambahkan "{operatorSearch}" sebagai operator baru
                    </div>
                  )}
                  {availableOperators.filter(op => !selectedOperators.includes(op)).length === 0 && !operatorSearch.trim() && (
                    <div className="px-4 py-2 text-gray-500 text-sm">Semua operator telah dipilih.</div>
                  )}
                </div>
              )}
            </div>

            {/* 4. Production Area */}
            <div>
              <label className="block text-sm font-semibold mb-2">4. Production Area <span className="text-red-500">*</span></label>
              <select 
                value={productionArea}
                onChange={(e) => {
                  setProductionArea(e.target.value);
                  // Reset fields when changing area types
                  setSalesOrderDropdown('');
                  setSalesOrderText('');
                  setValveList([]);
                  setValveText('');
                  setActivityDropdown('');
                  setActivityText('');
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="">-- Pilih Production Area --</option>
                {MOCK_AREAS.map((area, idx) => (
                  <option key={idx} value={area}>{area}</option>
                ))}
              </select>
            </div>

            {}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 space-y-6">
              
              {/* 5. Sales Order */}
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center justify-between">
                  <span>5. Sales Order (SO) <span className="text-red-500">*</span></span>
                  {isSpecialArea && <span className="text-xs font-normal text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">Input Manual Mode</span>}
                </label>
                {isSpecialArea ? (
                  <div>
                    <textarea 
                      value={salesOrderText}
                      onChange={(e) => setSalesOrderText(e.target.value)}
                      maxLength={500}
                      rows={2}
                      placeholder="Ketik keterangan Sales Order / Pekerjaan..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    ></textarea>
                    <div className="text-right text-xs text-gray-500 mt-1">{salesOrderText.length}/500 karakter</div>
                  </div>
                ) : (
                  <select 
                    value={salesOrderDropdown}
                    onChange={(e) => setSalesOrderDropdown(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="">-- Pilih Sales Order --</option>
                    {MOCK_SO.map((so, idx) => (
                      <option key={idx} value={so}>{so}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* 6. Type Valve */}
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center justify-between">
                  <span>6. Data Valve <span className="text-red-500">*</span></span>
                  {isSpecialArea && <span className="text-xs font-normal text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">Input Manual Mode</span>}
                </label>
                {isSpecialArea ? (
                  <div>
                    <textarea 
                      value={valveText}
                      onChange={(e) => setValveText(e.target.value)}
                      maxLength={500}
                      rows={3}
                      placeholder="Ketik keterangan Valve yang dikerjakan..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    ></textarea>
                    <div className="text-right text-xs text-gray-500 mt-1">{valveText.length}/500 karakter</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Input Cascading Sub-form */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm">
                      <div className="sm:col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">Type</label>
                        <select value={currentValveType} onChange={(e) => setCurrentValveType(e.target.value)} className="w-full p-2 text-sm rounded border border-gray-300 dark:border-slate-600 bg-transparent outline-none focus:ring-1 focus:ring-blue-500">
                          <option value="">-- Pilih --</option>
                          {MOCK_VALVE_TYPES.map((v, i) => <option key={i} value={v}>{v}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">Size</label>
                        <select disabled={!currentValveType} value={currentValveSize} onChange={(e) => setCurrentValveSize(e.target.value)} className="w-full p-2 text-sm rounded border border-gray-300 dark:border-slate-600 bg-transparent outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50">
                          <option value="">-- Pilih --</option>
                          {MOCK_VALVE_SIZES.map((v, i) => <option key={i} value={v}>{v}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">Class</label>
                        <select disabled={!currentValveSize} value={currentValveClass} onChange={(e) => setCurrentValveClass(e.target.value)} className="w-full p-2 text-sm rounded border border-gray-300 dark:border-slate-600 bg-transparent outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50">
                          <option value="">-- Pilih --</option>
                          {MOCK_VALVE_CLASSES.map((v, i) => <option key={i} value={v}>{v}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">Qty (1-99)</label>
                        <input 
                          type="text" 
                          disabled={!currentValveClass} 
                          value={currentValveQty} 
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            if (val.length <= 2) setCurrentValveQty(val);
                          }}
                          placeholder="0"
                          className="w-full p-2 text-sm rounded border border-gray-300 dark:border-slate-600 bg-transparent outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 text-center"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-xs invisible mb-1">Action</label>
                        <button 
                          type="button" 
                          onClick={handleAddValve}
                          disabled={!currentValveQty}
                          className="w-full py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Display Added Valves */}
                    {valveList.length > 0 && (
                      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                          <thead className="bg-gray-50 dark:bg-slate-900/50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                            {valveList.map((valve, idx) => (
                              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{valve.type}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{valve.size}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{valve.valveClass}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-center font-semibold">{valve.qty}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                                  <button type="button" onClick={() => removeValve(idx)} className="text-red-500 hover:text-red-700 p-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 7. Activity / Remarks */}
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center justify-between">
                  <span>7. Activity / Remarks <span className="text-red-500">*</span></span>
                  {isSpecialArea && <span className="text-xs font-normal text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">Input Manual Mode</span>}
                </label>
                {isSpecialArea ? (
                  <div>
                    <textarea 
                      value={activityText}
                      onChange={(e) => setActivityText(e.target.value)}
                      maxLength={500}
                      rows={2}
                      placeholder="Ketik keterangan aktivitas pekerjaan yang dilakukan..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    ></textarea>
                    <div className="text-right text-xs text-gray-500 mt-1">{activityText.length}/500 karakter</div>
                  </div>
                ) : (
                  <select 
                    value={activityDropdown}
                    onChange={(e) => setActivityDropdown(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="">-- Pilih Activity / Remarks --</option>
                    {MOCK_ACTIVITIES.map((act, idx) => (
                      <option key={idx} value={act}>{act}</option>
                    ))}
                  </select>
                )}
              </div>

            </div>
            
            {}
            {/* 8. Upload File */}
            <div>
              <label className="block text-sm font-semibold mb-2">8. Upload Bukti Pekerjaan (Foto / PDF)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" ref={fileInputRef} accept="image/*,.pdf" className="sr-only" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 italic bg-blue-50 dark:bg-blue-900/20 p-2 rounded border-l-4 border-blue-500">
                "Tambahkan bukti foto / dokumen yang di lakukan saat anda selesai melakukan pekerjaan. Dengan adanya bukti akan memperkuat validasi laporan anda."
              </p>
              {file && (
                <div className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  File terpilih: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row justify-end gap-4">
              <button 
                type="button" 
                onClick={handleClearData}
                className="px-6 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-gray-200 font-medium transition-colors w-full sm:w-auto"
              >
                Clear Data
              </button>
              <button 
                type="button" 
                onClick={handleSave}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                Save Report
              </button>
            </div>

          </div>
        </div>
      </div>

      {}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700">
            <div className="text-center p-4">
              {modalMessage.isError ? (
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
              ) : (
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{modalMessage.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-300">{modalMessage.body}</p>
            </div>
            <div className="mt-5 sm:mt-6">
              <button 
                type="button" 
                className={`w-full inline-flex justify-center rounded-lg border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors ${modalMessage.isError ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
                onClick={() => setShowModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}