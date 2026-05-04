import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, Calendar, GraduationCap, Award, Map, Briefcase, Building2, 
  BookOpen, ChevronRight, Menu, X, Download, Search, Activity, FileSpreadsheet
} from 'lucide-react';

// --- INISIALISASI SUPABASE ---
// Pastikan variabel VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY ada di .env Anda
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#5AC8FA', '#FF2D55'];

export default function App() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');

  // --- FETCH DATA DARI SUPABASE ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Menarik data dari tabel 'dapodik_maret_2026' di Supabase
        const { data: result, error } = await supabase
          .from('dapodik_maret_2026')
          .select('*');

        if (error) throw error;
        setData(result || []);
      } catch (error) {
        console.error("Gagal mengambil data dari :", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (Url) fetchData();
  }, []);

  // --- STATISTIK & LOGIKA DATA ---
  const stats = useMemo(() => {
    if (!data.length) return { total: 0, pns: 0, pppk: 0, sertifikasi: 0, sebaranKecamatan: [], statusData: [], gasing2025: 0 };
    
    const total = data.length;
    const pns = data.filter(d => d.status === 'PNS').length;
    const pppk = data.filter(d => d.status && d.status.includes('PPPK')).length;
    const sertifikasi = data.filter(d => d.sertifikasi === 'Sudah').length;
    
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
        (d.nama && d.nama.toLowerCase().includes(lowerQuery)) || 
        (d.sekolah && d.sekolah.toLowerCase().includes(lowerQuery)) ||
        (d.kecamatan && d.kecamatan.toLowerCase().includes(lowerQuery)) ||
        (d.nuptk && d.nuptk.toString().includes(lowerQuery))
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

  // --- UI RENDERING ---
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: Activity },
    { id: 'sebaran', label: 'Sebaran & Total GTK', icon: Map },
    { id: 'pensiun', label: 'Proyeksi Pensiun', icon: Calendar },
    { id: 'status', label: 'Status ASN & Swasta', icon: Building2 },
    { id: 'sertifikasi', label: 'Sertifikasi', icon: Award },
    { id: 'gasing', label: 'Program Gasing', icon: BookOpen },
    { id: 'kepangkatan', label: 'Kepangkatan', icon: Users },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Sinkronisasi Database ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/90 backdrop-blur-2xl border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Data GTK Mabar</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Dinas PKO</p>
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

      {/* Main Content */}
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
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeTab === 'dashboard' ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Total GTK', val: stats.total, icon: Users, bg: 'bg-blue-50', text: 'text-blue-600' },
                    { label: 'Sertifikasi', val: stats.sertifikasi, icon: Award, bg: 'bg-green-50', text: 'text-green-600' },
                    { label: 'Status ASN', val: stats.pns + stats.pppk, icon: Briefcase, bg: 'bg-orange-50', text: 'text-orange-600' },
                    { label: 'Program Gasing', val: stats.gasing2025, icon: BookOpen, bg: 'bg-purple-50', text: 'text-purple-600' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
                      <div className={`p-4 rounded-2xl ${stat.bg} ${stat.text}`}><stat.icon className="w-6 h-6" /></div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">{stat.label}</p>
                        <h3 className="text-2xl font-black text-gray-800">{stat.val}</h3>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6">Sebaran per Kecamatan</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.sebaranKecamatan}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                          <YAxis axisLine={false} tickLine={false} />
                          <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                          <Bar dataKey="value" fill="#007AFF" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                    <h3 className="font-bold text-gray-800 mb-6 w-full text-left">Status Kepegawaian</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats.statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {stats.statusData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <RechartsTooltip />
                          <Legend verticalAlign="bottom" iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-800">Daftar GTK ({filteredData.length})</h3>
                  {activeTab === 'pensiun' && (
                    <select 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="text-sm border-gray-200 rounded-lg px-3 py-1 outline-none"
                    >
                      {pensiunYears.map(y => <option key={y} value={y}>{y === 'All' ? 'Semua Tahun' : y}</option>)}
                    </select>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-bold">
                      <tr>
                        <th className="px-6 py-4">NO</th>
                        <th className="px-6 py-4">INFORMASI GURU</th>
                        <th className="px-6 py-4">PENUGASAN</th>
                        <th className="px-6 py-4">DETAIL LOKASI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredData.slice(0, 100).map((t, idx) => (
                        <tr key={t.id || idx} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-6 text-slate-400 font-medium">{idx + 1}</td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                                {t.nama?.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{t.nama}</div>
                                <div className="text-[10px] text-slate-400 mt-1 font-bold uppercase">NUPTK: {t.nuptk || '-'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="text-sm text-slate-600 font-semibold">{t.jabatan_ptk || 'Guru'}</div>
                            <div className="text-[10px] text-slate-400 uppercase mt-1 font-bold">{t.status_kepegawaian || t.status}</div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-2 text-slate-600 font-medium text-xs">
                              <MapPin size={12} className="text-slate-400" />
                              Kec. {t.kecamatan || '-'}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{t.sekolah}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center text-xs text-slate-400">
                  Menampilkan {Math.min(100, filteredData.length)} data teratas. Gunakan pencarian untuk data lebih spesifik.
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
