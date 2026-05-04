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
// Masukkan URL Web App Google Apps Script Anda di sini
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbztgACqoZ-oa95J4DUMPyaRKN6wCtluKF6ahUYsIRPIsH7p1mjTjsEn_WLE278dY4KErg/exec"; 

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#5AC8FA', '#FF2D55'];

const mockGtkData = [
  { id: 1, nama: "Yosep Suyono, S.Pd", nuptk: "1234567890", sekolah: "SDN 1 Komodo", kecamatan: "Komodo", status: "PNS", jenis_sekolah: "Negeri", pengangkatan: "Pemda", sertifikasi: "Sudah", kualifikasi: "S1", jenjang: "SD", pensiun_tahun: 2025, gasing: "Ikut 2025", pangkat: "IV/a", alamat: "Jl. Soekarno Hatta, Labuan Bajo" },
  { id: 2, nama: "Maria Goreti, S.Pd", nuptk: "0987654321", sekolah: "SMPN 1 Lembor", kecamatan: "Lembor", status: "PPPK", jenis_sekolah: "Negeri", pengangkatan: "Pemda", sertifikasi: "Belum", kualifikasi: "S1", jenjang: "SMP", pensiun_tahun: 2030, gasing: "Ikut 2026", pangkat: "IX", alamat: "Wae Nakeng, Lembor" },
  { id: 3, nama: "Agustinus Djehadut", nuptk: "1122334455", sekolah: "SDK Ruteng 1", kecamatan: "Sano Nggoang", status: "Komite", jenis_sekolah: "Swasta", pengangkatan: "Yayasan", sertifikasi: "Belum", kualifikasi: "Belum S1", jenjang: "SD", pensiun_tahun: 2040, gasing: "Tidak", pangkat: "-", alamat: "Werang, Sano Nggoang" },
  { id: 4, nama: "Dra. Siti Aminah", nuptk: "2233445566", sekolah: "SMPN 2 Komodo", kecamatan: "Komodo", status: "PNS", jenis_sekolah: "Negeri", pengangkatan: "Depak", sertifikasi: "Sudah", kualifikasi: "S1", jenjang: "SMP", pensiun_tahun: 2026, gasing: "Tidak", pangkat: "IV/b", alamat: "Batu Cermin, Labuan Bajo" },
  { id: 5, nama: "Fransiskus Xaverius", nuptk: "3344556677", sekolah: "SDN Wae Mata", kecamatan: "Macang Pacar", status: "PPPK", jenis_sekolah: "Negeri", pengangkatan: "Pemda", sertifikasi: "Sudah", kualifikasi: "S1", jenjang: "SD", pensiun_tahun: 2028, gasing: "Ikut 2025", pangkat: "IX", alamat: "Bari, Macang Pacar" },
];

export default function App() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (GOOGLE_APPS_SCRIPT_URL) {
          const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
          const result = await response.json();
          // Pastikan data memiliki ID unik untuk keperluan React key
          const formattedData = result.map((item, index) => ({
            ...item,
            id: item.id || `gtk-${index}`
          }));
          setData(formattedData);
        } else {
          setTimeout(() => {
            setData(mockGtkData);
            setIsLoading(false);
          }, 800);
          return;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setData(mockGtkData);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (!data.length) return { total: 0, pns: 0, pppk: 0, sertifikasi: 0, belumS1: 0, sebaranKecamatan: [], statusData: [], gasing2025: 0, gasing2026: 0 };
    
    const total = data.length;
    const pns = data.filter(d => d.status === 'PNS').length;
    const pppk = data.filter(d => d.status && d.status.includes('PPPK')).length;
    const sertifikasi = data.filter(d => d.sertifikasi === 'Sudah').length;
    const belumS1 = data.filter(d => d.kualifikasi === 'Belum S1').length;
    
    const kecMap = {};
    data.forEach(d => {
      if(d.kecamatan) kecMap[d.kecamatan] = (kecMap[d.kecamatan] || 0) + 1;
    });
    const sebaranKecamatan = Object.keys(kecMap).map(key => ({ name: key, value: kecMap[key] }));

    const statusData = [
      { name: 'PNS', value: pns },
      { name: 'PPPK', value: pppk },
      { name: 'Lainnya', value: total - (pns + pppk) },
    ];

    const gasing2025 = data.filter(d => d.gasing === 'Ikut 2025').length;
    const gasing2026 = data.filter(d => d.gasing === 'Ikut 2026').length;

    return { total, pns, pppk, sertifikasi, belumS1, sebaranKecamatan, statusData, gasing2025, gasing2026 };
  }, [data]);

  const pensiunYears = useMemo(() => {
    const years = new Set(data.map(d => d.pensiun_tahun).filter(Boolean));
    return ['All', ...Array.from(years).sort()];
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Filter Pencarian Global
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        (d.nama && d.nama.toLowerCase().includes(lowerQuery)) || 
        (d.sekolah && d.sekolah.toLowerCase().includes(lowerQuery)) ||
        (d.kecamatan && d.kecamatan.toLowerCase().includes(lowerQuery)) ||
        (d.nuptk && d.nuptk.toString().includes(lowerQuery))
      );
    }

    // Filter Berdasarkan Tab Aktif
    switch (activeTab) {
      case 'sebaran':
        // Menampilkan semua data (master list)
        return filtered;
      case 'pensiun':
        let pData = filtered.filter(d => d.pensiun_tahun);
        if (selectedYear !== 'All') {
          pData = pData.filter(d => d.pensiun_tahun.toString() === selectedYear.toString());
        }
        return pData.sort((a, b) => a.pensiun_tahun - b.pensiun_tahun);
      case 'sertifikasi':
        return filtered.filter(d => d.sertifikasi === 'Sudah');
      case 'kualifikasi':
        return filtered.filter(d => d.kualifikasi === 'Belum S1');
      case 'gasing':
        return filtered.filter(d => d.gasing && d.gasing !== 'Tidak');
      case 'kepangkatan':
        return filtered.filter(d => d.pangkat && d.pangkat !== '-');
      case 'status':
        return filtered;
      default:
        return filtered;
    }
  }, [data, activeTab, selectedYear, searchQuery]);

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
      className="bg-white/70 backdrop-blur-xl border border-white/40 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center space-x-4 group"
      style={{ animation: `fadeIn 0.5s ease-out ${delay}s both` }}
    >
      <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-').replace('-100', '-600')}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );

  const TableHeader = ({ children }) => (
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/80 sticky top-0 border-b border-gray-100 z-10">
      {children}
    </th>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Memuat data PKO...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-gray-900 font-sans flex overflow-hidden">
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* --- SIDEBAR --- */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/90 backdrop-blur-2xl border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Data GTK Mabar</h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Dinas PKO</p>
        </div>
        <nav className="px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* --- MAIN --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 mr-4 bg-gray-100 rounded-full"><Menu className="w-5 h-5"/></button>
            <h2 className="text-xl font-bold text-gray-800">{navItems.find(i => i.id === activeTab)?.label}</h2>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari Guru / Sekolah..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {activeTab === 'dashboard' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard title="Total GTK" value={stats.total} icon={Users} colorClass="bg-blue-100 text-blue-600" delay={0} />
                  <StatCard title="PNS" value={stats.pns} icon={Award} colorClass="bg-green-100 text-green-600" delay={0.1} />
                  <StatCard title="Sertifikasi" value={stats.sertifikasi} icon={GraduationCap} colorClass="bg-purple-100 text-purple-600" delay={0.2} />
                  <StatCard title="Gasing 2025" value={stats.gasing2025} icon={BookOpen} colorClass="bg-orange-100 text-orange-600" delay={0.3} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-6 text-lg">Sebaran Guru per Kecamatan</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.sebaranKecamatan}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                          <YAxis axisLine={false} tickLine={false} />
                          <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                          <Bar dataKey="value" fill="#007AFF" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-6 text-lg">Status Kepegawaian</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats.statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {stats.statusData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <RechartsTooltip />
                          <Legend verticalAlign="bottom" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                  <div>
                    <h3 className="font-bold text-gray-800">Daftar Guru ({filteredData.length})</h3>
                    <p className="text-xs text-gray-500">Menampilkan hasil pencarian dan filter aktif</p>
                  </div>
                  {activeTab === 'pensiun' && (
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="text-sm border-gray-200 rounded-lg">
                      {pensiunYears.map(y => <option key={y} value={y}>{y === 'All' ? 'Semua Tahun' : y}</option>)}
                    </select>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <TableHeader>No</TableHeader>
                        <TableHeader>Informasi Guru</TableHeader>
                        <TableHeader>Satuan Pendidikan</TableHeader>
                        <TableHeader>Kecamatan</TableHeader>
                        <TableHeader>Status</TableHeader>
                        {activeTab === 'pensiun' && <TableHeader>Tahun Pensiun</TableHeader>}
                        {activeTab === 'gasing' && <TableHeader>Status Gasing</TableHeader>}
                        {activeTab === 'kepangkatan' && <TableHeader>Golongan</TableHeader>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-4 text-sm text-gray-400">{idx + 1}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 text-sm">{row.nama}</div>
                            <div className="text-xs text-gray-500 font-mono">NUPTK: {row.nuptk || '-'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-700">{row.sekolah}</div>
                            <div className="text-[10px] text-gray-400 uppercase">{row.jenjang} - {row.jenis_sekolah}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{row.kecamatan}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${row.status === 'PNS' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                              {row.status}
                            </span>
                          </td>
                          {activeTab === 'pensiun' && <td className="px-6 py-4 text-sm font-bold text-orange-600">{row.pensiun_tahun}</td>}
                          {activeTab === 'gasing' && <td className="px-6 py-4 text-sm text-indigo-600 font-medium">{row.gasing}</td>}
                          {activeTab === 'kepangkatan' && <td className="px-6 py-4 text-sm font-bold">{row.pangkat}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
