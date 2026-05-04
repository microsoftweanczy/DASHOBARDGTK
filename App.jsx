import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, Calendar, GraduationCap, Award, Map, Briefcase, Building2, 
  BookOpen, ChevronRight, Menu, X, Download, Search, Activity, FileSpreadsheet
} from 'lucide-react';

// --- KONFIGURASI API GOOGLE SHEETS ---
// Ganti URL ini dengan URL Web App Google Apps Script Anda nantinya
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbztgACqoZ-oa95J4DUMPyaRKN6wCtluKF6ahUYsIRPIsH7p1mjTjsEn_WLE278dY4KErg/exec"; 

// --- WARNA TEMA (Apple iOS/MacOS style) ---
const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#5AC8FA', '#FF2D55'];

// --- MOCK DATA SIMULASI (Digunakan jika URL API kosong) ---
const mockGtkData = [
  { id: 1, nama: "Yosep Suyono, S.Pd", nuptk: "1234567890", sekolah: "SDN 1 Komodo", kecamatan: "Komodo", status: "PNS", jenis_sekolah: "Negeri", pengangkatan: "Pemda", sertifikasi: "Sudah", kualifikasi: "S1", jenjang: "SD", pensiun_tahun: 2025, gasing: "Ikut 2025", pangkat: "IV/a", alamat: "Jl. Soekarno Hatta, Labuan Bajo" },
  { id: 2, nama: "Maria Goreti, S.Pd", nuptk: "0987654321", sekolah: "SMPN 1 Lembor", kecamatan: "Lembor", status: "PPPK", jenis_sekolah: "Negeri", pengangkatan: "Pemda", sertifikasi: "Belum", kualifikasi: "S1", jenjang: "SMP", pensiun_tahun: 2030, gasing: "Ikut 2026", pangkat: "IX", alamat: "Wae Nakeng, Lembor" },
  { id: 3, nama: "Agustinus Djehadut", nuptk: "1122334455", sekolah: "SDK Ruteng 1", kecamatan: "Sano Nggoang", status: "Komite", jenis_sekolah: "Swasta", pengangkatan: "Yayasan", sertifikasi: "Belum", kualifikasi: "Belum S1", jenjang: "SD", pensiun_tahun: 2040, gasing: "Tidak", pangkat: "-", alamat: "Werang, Sano Nggoang" },
  { id: 4, nama: "Dra. Siti Aminah", nuptk: "2233445566", sekolah: "SMPN 2 Komodo", kecamatan: "Komodo", status: "PNS", jenis_sekolah: "Negeri", pengangkatan: "Depak", sertifikasi: "Sudah", kualifikasi: "S1", jenjang: "SMP", pensiun_tahun: 2026, gasing: "Tidak", pangkat: "IV/b", alamat: "Batu Cermin, Labuan Bajo" },
  { id: 5, nama: "Fransiskus Xaverius", nuptk: "3344556677", sekolah: "SDN Wae Mata", kecamatan: "Macang Pacar", status: "PPPK PW", jenis_sekolah: "Negeri", pengangkatan: "Pemda", sertifikasi: "Sudah", kualifikasi: "S1", jenjang: "SD", pensiun_tahun: 2028, gasing: "Ikut 2025", pangkat: "IX", alamat: "Bari, Macang Pacar" },
  { id: 6, nama: "Katarina Muti", nuptk: "4455667788", sekolah: "TK Pertiwi", kecamatan: "Mbeliling", status: "Komite", jenis_sekolah: "Negeri", pengangkatan: "Pemda", sertifikasi: "Belum", kualifikasi: "Belum S1", jenjang: "PAUD", pensiun_tahun: 2035, gasing: "Tidak", pangkat: "-", alamat: "Melo, Mbeliling" },
  { id: 7, nama: "Yohanes Babtista, M.Pd", nuptk: "5566778899", sekolah: "SMPK Loyola", kecamatan: "Komodo", status: "PNS", jenis_sekolah: "Swasta", pengangkatan: "Pemda", sertifikasi: "Sudah", kualifikasi: "S2", jenjang: "SMP", pensiun_tahun: 2025, gasing: "Ikut 2026", pangkat: "IV/a", alamat: "Jl. Reklamasi, Labuan Bajo" },
  { id: 8, nama: "Petrus Nggala", nuptk: "6677889900", sekolah: "SDI Watu Wangka", kecamatan: "Ndoso", status: "PNS", jenis_sekolah: "Negeri", pengangkatan: "Pemda", sertifikasi: "Belum", kualifikasi: "Belum S1", jenjang: "SD", pensiun_tahun: 2027, gasing: "Ikut 2025", pangkat: "III/b", alamat: "Ndoso" },
  { id: 9, nama: "Theresia Luju, S.Pd", nuptk: "7788990011", sekolah: "SMPN 1 Kuwus", kecamatan: "Kuwus", status: "PPPK", jenis_sekolah: "Negeri", pengangkatan: "Pemda", sertifikasi: "Sudah", kualifikasi: "S1", jenjang: "SMP", pensiun_tahun: 2032, gasing: "Ikut 2026", pangkat: "IX", alamat: "Golowelu, Kuwus" },
  { id: 10, nama: "Dominikus Jolo", nuptk: "8899001122", sekolah: "SDN Lembor Selatan", kecamatan: "Lembor Selatan", status: "Komite", jenis_sekolah: "Negeri", pengangkatan: "Desa", sertifikasi: "Belum", kualifikasi: "Belum S1", jenjang: "SD", pensiun_tahun: 2045, gasing: "Tidak", pangkat: "-", alamat: "Lengkong, Lembor Selatan" },
];

export default function App() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [selectedYear, setSelectedYear] = useState('All');

  // Fetch Data Logic
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (GOOGLE_APPS_SCRIPT_URL) {
          const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
          const result = await response.json();
          setData(result);
        } else {
          // Simulate network delay for mock data
          setTimeout(() => {
            setData(mockGtkData);
            setIsLoading(false);
          }, 800);
          return;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback to mock data if fetch fails
        setData(mockGtkData);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // --- DATA AGGREGATION & MEMOIZATION (Performance Optimization) ---
  const stats = useMemo(() => {
    if (!data.length) return {};
    
    const total = data.length;
    const pns = data.filter(d => d.status === 'PNS').length;
    const pppk = data.filter(d => d.status.includes('PPPK')).length;
    const sertifikasi = data.filter(d => d.sertifikasi === 'Sudah').length;
    const belumS1 = data.filter(d => d.kualifikasi === 'Belum S1').length;
    
    // Distribusi Kecamatan
    const kecMap = {};
    data.forEach(d => {
      kecMap[d.kecamatan] = (kecMap[d.kecamatan] || 0) + 1;
    });
    const sebaranKecamatan = Object.keys(kecMap).map(key => ({ name: key, value: kecMap[key] }));

    // Status Guru Data for Pie Chart
    const statusData = [
      { name: 'PNS', value: pns },
      { name: 'PPPK', value: pppk },
      { name: 'Komite/Honor', value: data.filter(d => d.status === 'Komite').length },
    ];

    // Gasing
    const gasing2025 = data.filter(d => d.gasing === 'Ikut 2025').length;
    const gasing2026 = data.filter(d => d.gasing === 'Ikut 2026').length;

    return { total, pns, pppk, sertifikasi, belumS1, sebaranKecamatan, statusData, gasing2025, gasing2026 };
  }, [data]);

  const pensiunYears = useMemo(() => {
    const years = new Set(data.map(d => d.pensiun_tahun).filter(Boolean));
    return ['All', ...Array.from(years).sort()];
  }, [data]);

  // --- FILTERING LOGIC PER TAB ---
  const filteredData = useMemo(() => {
    let filtered = data;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.nama.toLowerCase().includes(lowerQuery) || 
        d.sekolah.toLowerCase().includes(lowerQuery) ||
        d.kecamatan.toLowerCase().includes(lowerQuery)
      );
    }

    switch (activeTab) {
      case 'pensiun':
        if (selectedYear !== 'All') {
          filtered = filtered.filter(d => d.pensiun_tahun.toString() === selectedYear.toString());
        }
        // Tampilkan yang akan pensiun 5 tahun kedepan jika All
        return filtered.sort((a, b) => a.pensiun_tahun - b.pensiun_tahun);
      case 'sertifikasi':
        return filtered.filter(d => d.sertifikasi === 'Sudah');
      case 'kualifikasi':
        return filtered.filter(d => d.kualifikasi === 'Belum S1');
      case 'gasing':
        return filtered.filter(d => d.gasing !== 'Tidak');
      case 'kepangkatan':
        return filtered.filter(d => d.pangkat !== '-').sort((a, b) => a.pangkat.localeCompare(b.pangkat));
      case 'status':
      case 'pengangkatan':
      case 'sebaran':
      default:
        return filtered;
    }
  }, [data, activeTab, selectedYear, searchQuery]);

  // --- NAVIGATION CONFIG ---
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: Activity },
    { id: 'sebaran', label: 'Sebaran & Total GTK', icon: Map },
    { id: 'pensiun', label: 'Proyeksi Pensiun', icon: Calendar },
    { id: 'status', label: 'Status ASN & Swasta', icon: Building2 },
    { id: 'pengangkatan', label: 'Pengangkatan', icon: Briefcase },
    { id: 'sertifikasi', label: 'Sertifikasi', icon: Award },
    { id: 'kualifikasi', label: 'Kualifikasi Belum S1', icon: GraduationCap },
    { id: 'gasing', label: 'Program Gasing', icon: BookOpen },
    { id: 'kepangkatan', label: 'Kepangkatan', icon: Users },
  ];

  // --- UI COMPONENTS ---
  const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
    <div 
      className="bg-white/70 backdrop-blur-xl border border-white/40 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 ease-out flex items-center space-x-4 group"
      style={{ animation: `fadeIn 0.5s ease-out ${delay}s both` }}
    >
      <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-').replace('-100', '-500')}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );

  const TableHeader = ({ children }) => (
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50 backdrop-blur-md sticky top-0 border-b border-gray-100 z-10">
      {children}
    </th>
  );

  const TableCell = ({ children, bold }) => (
    <td className={`px-6 py-4 whitespace-nowrap text-sm ${bold ? 'font-medium text-gray-900' : 'text-gray-600'} border-b border-gray-50`}>
      {children}
    </td>
  );

  // Jika sedang loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Menarik data dari Google Sheets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-gray-900 font-sans flex selection:bg-blue-100 selection:text-blue-900">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}} />

      {/* --- SIDEBAR (Desktop & Mobile) --- */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-2xl border-r border-gray-200/50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex-shrink-0 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Data GTK Mabar
            </h1>
            <p className="text-xs text-gray-500 mt-1">Dinas PKO Manggarai Barat</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-200 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="flex-1 text-left text-sm">{item.label}</span>
              {activeTab === item.id && <ChevronRight className="w-4 h-4 opacity-50" />}
            </button>
          ))}
        </nav>
        
        <div className="p-6 border-t border-gray-100/50">
          <div className="bg-gray-50 p-4 rounded-2xl flex items-center space-x-3 group cursor-help relative">
            <FileSpreadsheet className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-xs text-gray-500">Sumber Data</p>
              <p className="text-sm font-semibold text-gray-800">Google Sheets</p>
            </div>
            {/* Tooltip Apple Style */}
            <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-gray-900/90 backdrop-blur-md text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl">
              Terkoneksi secara real-time via Google Apps Script.
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/50 backdrop-blur-xl border-b border-gray-200/50 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 mr-4 rounded-full hover:bg-white transition-colors">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <h2 className="text-2xl font-semibold text-gray-800 tracking-tight capitalize">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block group">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors group-focus-within:text-blue-500" />
              <input 
                type="text" 
                placeholder="Cari nama, sekolah, kecamatan..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white/60 border border-gray-200/80 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all w-64 shadow-sm"
              />
            </div>
            <button className="p-2.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm" title="Export Data">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total GTK" value={stats.total} icon={Users} colorClass="text-blue-600 bg-blue-100" delay={0.1} />
                  <StatCard title="Total PNS" value={stats.pns} icon={Award} colorClass="text-green-600 bg-green-100" delay={0.2} />
                  <StatCard title="Sudah Sertifikasi" value={stats.sertifikasi} icon={GraduationCap} colorClass="text-purple-600 bg-purple-100" delay={0.3} />
                  <StatCard title="Peserta Gasing 2025" value={stats.gasing2025} icon={BookOpen} colorClass="text-orange-600 bg-orange-100" delay={0.4} />
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ animation: `fadeIn 0.5s ease-out 0.5s both` }}>
                  
                  {/* Bar Chart: Sebaran Kecamatan */}
                  <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/40 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Sebaran GTK per Kecamatan</h3>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.sebaranKecamatan} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                          <RechartsTooltip 
                            cursor={{fill: '#F3F4F6', opacity: 0.5}}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
                          />
                          <Bar dataKey="value" fill="#007AFF" radius={[6, 6, 0, 0]} maxBarSize={50} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pie Chart: Status Guru */}
                  <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Persentase Status Guru</h3>
                    <div className="h-64 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats.statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {stats.statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TABULAR DATA VIEWS */}
            {activeTab !== 'dashboard' && (
              <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col" style={{ animation: `fadeIn 0.4s ease-out both` }}>
                
                {/* Header Kontrol Tabel */}
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Detail Data {navItems.find(i => i.id === activeTab)?.label}</h3>
                    <p className="text-sm text-gray-500 mt-1">Total {filteredData.length} data ditemukan berdasarkan filter.</p>
                  </div>
                  
                  {/* Khusus Tab Pensiun: Dropdown Tahun */}
                  {activeTab === 'pensiun' && (
                    <div className="flex items-center space-x-3 bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                      <label className="text-sm text-gray-600 font-medium ml-2">Tahun Pensiun:</label>
                      <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer shadow-sm"
                      >
                        {pensiunYears.map(year => (
                          <option key={year} value={year}>{year === 'All' ? 'Semua Tahun' : year}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Wrapper Tabel agar bisa scroll horizontal di HP */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <TableHeader>No</TableHeader>
                        <TableHeader>Informasi Guru</TableHeader>
                        <TableHeader>Penugasan</TableHeader>
                        
                        {/* Kolom Dinamis Berdasarkan Tab */}
                        {activeTab === 'status' && <TableHeader>Status & Instansi</TableHeader>}
                        {activeTab === 'pengangkatan' && <TableHeader>Pengangkatan</TableHeader>}
                        {activeTab === 'pensiun' && <TableHeader>Tahun Pensiun</TableHeader>}
                        {activeTab === 'sertifikasi' && <TableHeader>Sertifikasi</TableHeader>}
                        {activeTab === 'kualifikasi' && <TableHeader>Kualifikasi & Jenjang</TableHeader>}
                        {activeTab === 'gasing' && <TableHeader>Status Gasing</TableHeader>}
                        {activeTab === 'kepangkatan' && <TableHeader>Kepangkatan</TableHeader>}
                        
                        <TableHeader>Detail Lokasi</TableHeader>
                      </tr>
                    </thead>
                    <tbody className="bg-white/40 divide-y divide-gray-100">
                      {filteredData.length > 0 ? filteredData.map((row, index) => (
                        <tr key={row.id} className="hover:bg-blue-50/50 transition-colors duration-200 group">
                          <TableCell>{index + 1}</TableCell>
                          
                          {/* Nama & NUPTK dg Popup Tooltip */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center relative cursor-default">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm shadow-inner border border-blue-100">
                                {row.nama.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">{row.nama}</div>
                                <div className="text-xs text-gray-500 font-mono mt-0.5">NUPTK: {row.nuptk}</div>
                              </div>
                              
                              {/* Hover Card / Pop Up Informasi Rinci */}
                              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-64 bg-gray-900/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none transform translate-x-2 group-hover:translate-x-0 border border-white/10">
                                <div className="text-white space-y-2">
                                  <p className="font-semibold text-sm border-b border-gray-700 pb-2">{row.nama}</p>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <span className="text-gray-400">Sekolah:</span><span>{row.sekolah}</span>
                                    <span className="text-gray-400">Status:</span><span>{row.status}</span>
                                    <span className="text-gray-400">Jenjang:</span><span>{row.jenjang}</span>
                                    <span className="text-gray-400">Alamat:</span><span className="truncate">{row.alamat}</span>
                                  </div>
                                </div>
                                {/* Segitiga Tooltip */}
                                <div className="absolute top-1/2 -left-2 -translate-y-1/2 border-y-8 border-y-transparent border-r-8 border-r-gray-900/95"></div>
                              </div>
                            </div>
                          </td>

                          <TableCell>
                            <div className="text-sm text-gray-900 font-medium">{row.sekolah}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{row.jenis_sekolah}</div>
                          </TableCell>

                          {/* Kolom Dinamis */}
                          {activeTab === 'status' && (
                            <TableCell>
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                row.status === 'PNS' ? 'bg-green-100 text-green-800' : 
                                row.status.includes('PPPK') ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {row.status}
                              </span>
                            </TableCell>
                          )}
                          
                          {activeTab === 'pengangkatan' && (
                            <TableCell>
                              <div className="text-sm text-gray-900">{row.pengangkatan}</div>
                            </TableCell>
                          )}

                          {activeTab === 'pensiun' && (
                            <TableCell>
                              <span className="font-mono bg-orange-50 text-orange-700 px-2 py-1 rounded-md border border-orange-100 text-sm font-medium">
                                {row.pensiun_tahun}
                              </span>
                            </TableCell>
                          )}

                          {activeTab === 'sertifikasi' && (
                            <TableCell>
                               <span className={`px-2 py-1 rounded-md text-xs font-semibold ${row.sertifikasi === 'Sudah' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                 {row.sertifikasi}
                               </span>
                            </TableCell>
                          )}

                          {activeTab === 'kualifikasi' && (
                            <TableCell>
                               <div className="text-sm font-medium text-rose-600">{row.kualifikasi}</div>
                               <div className="text-xs text-gray-500">Guru {row.jenjang}</div>
                            </TableCell>
                          )}

                          {activeTab === 'gasing' && (
                            <TableCell>
                               <div className="text-sm text-indigo-700 font-medium bg-indigo-50 px-2 py-1 rounded inline-block">
                                 {row.gasing}
                               </div>
                            </TableCell>
                          )}

                          {activeTab === 'kepangkatan' && (
                            <TableCell>
                               <div className="text-sm font-bold text-gray-700">Gol. {row.pangkat}</div>
                            </TableCell>
                          )}

                          <TableCell>
                            <div className="flex items-center text-sm text-gray-600">
                              <Map className="w-4 h-4 mr-1.5 text-gray-400" />
                              Kec. {row.kecamatan}
                            </div>
                            <div className="text-xs text-gray-400 mt-1 truncate max-w-[150px]" title={row.alamat}>
                              {row.alamat}
                            </div>
                          </TableCell>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="100%" className="px-6 py-16 text-center text-gray-500">
                            <div className="flex flex-col items-center justify-center">
                              <Search className="w-10 h-10 text-gray-300 mb-3" />
                              <p className="text-base font-medium">Tidak ada data ditemukan</p>
                              <p className="text-sm mt-1">Coba sesuaikan kata kunci pencarian atau filter.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Footer Pagination/Info tabel */}
                <div className="bg-gray-50/80 backdrop-blur-md px-6 py-4 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center rounded-b-3xl">
                  <span>Menampilkan {filteredData.length} baris data</span>
                  <span>Diperbarui secara real-time dari Google Sheets</span>
                </div>
              </div>
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
}
