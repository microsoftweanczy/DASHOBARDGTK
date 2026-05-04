import React, { useState, useMemo, useEffect } from 'react';
// Import Supabase menggunakan CDN ESM
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, Calendar, GraduationCap, Award, Map, Briefcase, Building2, 
  BookOpen, ChevronRight, Menu, X, Download, Search, Activity, FileSpreadsheet, MapPin
} from 'lucide-react';

// --- INISIALISASI SUPABASE ---
/**
 * Catatan: Penggunaan import.meta.env sering menyebabkan error di beberapa lingkungan sandbox.
 * Silakan isi string kosong di bawah ini secara langsung dengan kredensial Supabase Anda
 * atau gunakan variabel global jika tersedia di environment Anda.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // Masukkan URL Supabase Anda di sini
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // Masukkan Anon Key Supabase Anda di sini

// Inisialisasi client hanya jika URL tersedia
const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseAnonKey) : null;

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#5AC8FA', '#FF2D55'];

export default function App() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');

  // --- FETCH DATA DARI SUPABASE ---
  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setErrorMsg("Kredensial Supabase belum diisi di dalam kode (App.jsx). Silakan masukkan URL dan Key Anda.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMsg(null);
      
      try {
        // Mengambil data dari tabel (Pastikan nama tabel sesuai di Supabase)
        const { data: result, error } = await supabase
          .from('dapodik_maret_2026')
          .select('*');

        if (error) throw error;
        setData(result || []);
      } catch (err) {
        console.error("Gagal mengambil data:", err.message);
        setErrorMsg("Gagal terhubung ke database: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- LOGIKA STATISTIK ---
  const stats = useMemo(() => {
    if (!data.length) return { total: 0, pns: 0, pppk: 0, sertifikasi: 0, sebaranKecamatan: [], statusData: [], gasing2025: 0 };
    
    const total = data.length;
    const pns = data.filter(d => (d.status || d.status_kepegawaian)?.toUpperCase() === 'PNS').length;
    const pppk = data.filter(d => (d.status || d.status_kepegawaian)?.toUpperCase().includes('PPPK')).length;
    const sertifikasi = data.filter(d => d.sertifikasi === 'Sudah').length;
    
    const kecMap = {};
    data.forEach(d => {
      const kec = d.kecamatan || "Lainnya";
      kecMap[kec] = (kecMap[kec] || 0) + 1;
    });
    
    const sebaranKecamatan = Object.keys(kecMap).map(key => ({ name: key, value: kecMap[key] }));

    const statusData = [
      { name: 'PNS', value: pns },
      { name: 'PPPK', value: pppk },
      { name: 'Lainnya', value: total - (pns + pppk) },
    ];

    const gasing2025 = data.filter(d => d.gasing === 'Ikut 2025').length;

    return { total, pns, pppk, sertifikasi, sebaranKecamatan, statusData, gasing2025 };
  }, [data]);

  const pensiunYears = useMemo(() => {
    const years = new Set(data.map(d => d.pensiun_tahun).filter(Boolean));
    return ['All', ...Array.from(years).sort()];
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        (d.nama?.toLowerCase().includes(lowerQuery)) || 
        (d.sekolah?.toLowerCase().includes(lowerQuery)) ||
        (d.kecamatan?.toLowerCase().includes(lowerQuery))
      );
    }

    if (activeTab === 'pensiun' && selectedYear !== 'All') {
      filtered = filtered.filter(d => d.pensiun_tahun?.toString() === selectedYear.toString());
    }
    if (activeTab === 'sertifikasi') {
      filtered = filtered.filter(d => d.sertifikasi === 'Sudah');
    }
    if (activeTab === 'gasing') {
      filtered = filtered.filter(d => d.gasing && d.gasing !== 'Tidak');
    }

    return filtered;
  }, [data, activeTab, selectedYear, searchQuery]);

  const navItems = [
    { id: 'dashboard', label: 'Ringkasan', icon: Activity },
    { id: 'sebaran', label: 'Sebaran Wilayah', icon: Map },
    { id: 'pensiun', label: 'Data Pensiun', icon: Calendar },
    { id: 'sertifikasi', label: 'Sertifikasi', icon: Award },
    { id: 'gasing', label: 'Program Gasing', icon: BookOpen },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Menghubungkan ke Supabase...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex overflow-hidden font-sans">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">GTK Mabar</h1>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Dinas PKO Kab. Manggarai Barat</p>
        </div>
        
        <nav className="px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>

        {errorMsg && (
          <div className="mx-4 mt-8 p-3 bg-red-50 border border-red-100 rounded-xl">
             <p className="text-[10px] text-red-600 font-medium leading-relaxed">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 mr-2 hover:bg-slate-100 rounded-lg"><Menu className="w-5 h-5"/></button>
            <h2 className="text-sm font-bold text-slate-700">{navItems.find(i => i.id === activeTab)?.label}</h2>
          </div>
          
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari Guru..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-lg text-xs w-48 lg:w-64 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {activeTab === 'dashboard' ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total GTK', val: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Sertifikasi', val: stats.sertifikasi, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'ASN', val: stats.pns + stats.pppk, icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Gasing', val: stats.gasing2025, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                      <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}><s.icon size={20} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
                        <p className="text-xl font-black text-slate-800">{s.val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 mb-6">Sebaran Guru per Kecamatan</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.sebaranKecamatan}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                          <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 mb-6">Komposisi Kepegawaian</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats.statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {stats.statusData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <RechartsTooltip />
                          <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-700">Daftar GTK <span className="text-slate-400 ml-1 font-medium">({filteredData.length})</span></h3>
                  {activeTab === 'pensiun' && (
                    <select 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="text-xs border-slate-200 rounded-lg px-2 py-1 outline-none font-medium"
                    >
                      {pensiunYears.map(y => <option key={y} value={y}>{y === 'All' ? 'Tahun Pensiun: Semua' : `Tahun: ${y}`}</option>)}
                    </select>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-6 py-3 border-b border-slate-100">Informasi Dasar</th>
                        <th className="px-6 py-3 border-b border-slate-100">Unit Kerja</th>
                        <th className="px-6 py-3 border-b border-slate-100">Status</th>
                        {activeTab === 'pensiun' && <th className="px-6 py-3 border-b border-slate-100 text-orange-600">Pensiun</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredData.slice(0, 50).map((t, idx) => (
                        <tr key={t.id || idx} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                                {t.nama?.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{t.nama}</div>
                                <div className="text-[10px] text-slate-400 font-semibold uppercase">NUPTK: {t.nuptk || '-'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-slate-600 font-bold">{t.sekolah}</div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 uppercase">
                              <MapPin size={10} /> {t.kecamatan || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                              (t.status || t.status_kepegawaian)?.toUpperCase() === 'PNS' 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : 'bg-blue-50 text-blue-600'
                            }`}>
                              {t.status || t.status_kepegawaian || '-'}
                            </span>
                          </td>
                          {activeTab === 'pensiun' && (
                            <td className="px-6 py-4">
                               <div className="text-xs font-black text-orange-600">{t.pensiun_tahun}</div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredData.length > 50 && (
                  <div className="p-4 bg-slate-50 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Menampilkan 50 data pertama dari total {filteredData.length}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
