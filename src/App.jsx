import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, Calendar, GraduationCap, Award, Map, Briefcase, Building2, 
  BookOpen, ChevronRight, Menu, X, Download, Search, Activity, FileSpreadsheet
} from 'lucide-react';

// --- KONFIGURASI SUPABASE ---
// Menggunakan import CDN untuk menghindari error build di lingkungan tertentu
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Gunakan string kosong sebagai default jika env tidak terbaca untuk mencegah crash saat inisialisasi
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";

let supabase;
try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.error("Gagal menginisialisasi Supabase:", e);
}

// --- WARNA TEMA (Apple iOS/MacOS style) ---
const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#5AC8FA', '#FF2D55'];

// --- UI COMPONENTS ---
const SidebarItem = ({ icon, label, active, onClick, badge }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <span className={`${active ? 'text-white' : 'text-gray-400'}`}>{icon}</span>
    <span className="text-sm font-medium flex-1 text-left">{label}</span>
    {badge && (
      <span className={`text-[10px] px-2 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
        {badge}
      </span>
    )}
    <ChevronRight size={14} className={`opacity-50 transition-transform ${active ? 'rotate-90' : ''}`} />
  </button>
);

const Card = ({ title, value, icon, trend, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
  </div>
);

const TableCell = ({ children, className = "" }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-600 ${className}`}>
    {children}
  </td>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard Utama');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gtkData, setGtkData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- AMBIL DATA DARI SUPABASE ---
  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setError("Konfigurasi Supabase tidak ditemukan. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY sudah diatur di Environment Variables.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Menarik data dari tabel Supabase
        const { data, error: supabaseError } = await supabase
          .from('dapodik_maret_2026') 
          .select('*');

        if (supabaseError) throw supabaseError;

        setGtkData(data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- LOGIKA FILTER & STATISTIK (Pertahankan Asli) ---
  const filteredData = useMemo(() => {
    return gtkData.filter(item => {
      const searchStr = searchTerm.toLowerCase();
      return (
        item.nama?.toLowerCase().includes(searchStr) ||
        item.nuptk?.toString().includes(searchStr) ||
        item.sekolah?.toLowerCase().includes(searchStr) ||
        item.kecamatan?.toLowerCase().includes(searchStr)
      );
    });
  }, [gtkData, searchTerm]);

  // Statistik Dinamis
  const stats = useMemo(() => {
    const total = gtkData.length;
    const pns = gtkData.filter(d => d.status === 'PNS').length;
    const pppk = gtkData.filter(d => d.status === 'PPPK').length;
    const honorer = gtkData.filter(d => d.status === 'Honorer').length;
    const sertifikasi = gtkData.filter(d => d.sertifikasi === 'Sudah').length;
    
    return { total, pns, pppk, honorer, sertifikasi };
  }, [gtkData]);

  const kecamatanStats = useMemo(() => {
    const counts = {};
    gtkData.forEach(d => {
      if (d.kecamatan) {
        counts[d.kecamatan] = (counts[d.kecamatan] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [gtkData]);

  const statusPieData = [
    { name: 'PNS', value: stats.pns },
    { name: 'PPPK', value: stats.pppk },
    { name: 'Honorer', value: stats.honorer },
  ];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <X size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Koneksi Database Gagal</h2>
          <p className="text-gray-500 mb-6 text-sm">{error}</p>
          <div className="text-left bg-gray-50 p-3 rounded-xl mb-6 text-[10px] text-gray-400 font-mono">
            Saran: Cek Environment Variables VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di hosting Anda.
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-gray-900 font-sans selection:bg-blue-100">
      {/* Sidebar (Pertahankan Asli) */}
      <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-500 ease-in-out bg-white/80 backdrop-blur-xl border-r border-gray-100 ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0 lg:w-24'}`}>
        <div className="flex flex-col h-full p-4">
          <div className={`flex items-center gap-3 mb-10 px-2 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 shrink-0">
              <Activity size={24} />
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-blue-900">Data GTK Mabar</h1>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Dinas PKO Manggarai Barat</p>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem icon={<Activity size={20} />} label="Dashboard Utama" active={activeTab === 'Dashboard Utama'} onClick={() => setActiveTab('Dashboard Utama')} />
            <SidebarItem icon={<Map size={20} />} label="Sebaran & Total GTK" active={activeTab === 'Sebaran & Total GTK'} onClick={() => setActiveTab('Sebaran & Total GTK')} />
            <SidebarItem icon={<Calendar size={20} />} label="Proyeksi Pensiun" active={activeTab === 'Proyeksi Pensiun'} onClick={() => setActiveTab('Proyeksi Pensiun')} />
            <SidebarItem icon={<Briefcase size={20} />} label="Status ASN & Swasta" active={activeTab === 'Status ASN & Swasta'} onClick={() => setActiveTab('Status ASN & Swasta')} />
            <SidebarItem icon={<Award size={20} />} label="Sertifikasi" active={activeTab === 'Sertifikasi'} onClick={() => setActiveTab('Sertifikasi')} />
            <SidebarItem icon={<GraduationCap size={20} />} label="Kualifikasi Belum S1" active={activeTab === 'Kualifikasi Belum S1'} onClick={() => setActiveTab('Kualifikasi Belum S1')} />
          </nav>
        </div>
      </aside>

      {/* Main Content (Pertahankan Desain Asli) */}
      <div className={`transition-all duration-500 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-24'}`}>
        <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-xl font-bold text-gray-800">{activeTab}</h2>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative hidden md:block">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Cari nama, sekolah, kecamatan..." 
                 className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-64 transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <button className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
               <Download size={18} />
             </button>
          </div>
        </header>

        <main className="p-6 max-w-[1600px] mx-auto">
          {activeTab === 'Dashboard Utama' && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Total GTK" value={loading ? "..." : stats.total.toLocaleString()} icon={<Users size={24} />} trend="+12% bulan ini" color="bg-blue-500" />
                <Card title="Sudah Sertifikasi" value={loading ? "..." : stats.sertifikasi.toLocaleString()} icon={<Award size={24} />} trend="67% dari total" color="bg-green-500" />
                <Card title="Status ASN (PNS/PPPK)" value={loading ? "..." : (stats.pns + stats.pppk).toLocaleString()} icon={<Briefcase size={24} />} trend="82% stabilitas" color="bg-orange-500" />
                <Card title="Proyeksi Pensiun 2024" value="142" icon={<Calendar size={24} />} trend="-5% vs 2023" color="bg-red-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-8">
                    <h4 className="text-lg font-bold text-gray-800">Distribusi GTK per Kecamatan</h4>
                    <button className="text-xs font-bold text-blue-600 hover:underline">Lihat Detail</button>
                  </div>
                  <div className="h-[350px]">
                    {loading ? (
                      <div className="w-full h-full bg-gray-50 rounded-2xl animate-pulse" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={kecamatanStats}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                          <RechartsTooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                          <Bar dataKey="count" fill="#007AFF" radius={[6, 6, 0, 0]} barSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                   <h4 className="text-lg font-bold text-gray-800 mb-8">Status Pegawai</h4>
                   <div className="h-[300px]">
                    {loading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                            {statusPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Sebaran & Total GTK' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
               <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">Detail Data Sebaran & Total GTK</h4>
                    <p className="text-sm text-gray-400 mt-1">Total {filteredData.length} data ditemukan berdasarkan filter.</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-colors">
                      <FileSpreadsheet size={20} />
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 font-medium">Sinkronisasi Data Supabase...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/50">
                        <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          <th className="px-8 py-5">No</th>
                          <th className="px-6 py-5">Informasi Guru</th>
                          <th className="px-6 py-5">Penugasan</th>
                          <th className="px-6 py-5">Detail Lokasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredData.length > 0 ? filteredData.slice(0, 100).map((row, idx) => (
                          <tr key={row.id || idx} className="hover:bg-blue-50/30 transition-colors group">
                            <TableCell className="px-8 font-medium text-gray-400">{idx + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold shadow-sm group-hover:scale-110 transition-transform">
                                  {row.nama?.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-800 text-base">{row.nama}</div>
                                  <div className="text-[10px] font-bold text-gray-400 tracking-widest mt-0.5">NUPTK: {row.nuptk || '-'}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-700">{row.jabatan_ptk || 'Guru'}</span>
                                <span className={`text-[10px] font-bold w-fit mt-1 px-2 py-0.5 rounded-lg ${
                                  row.status === 'PNS' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                  {row.status}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-gray-700 font-medium capitalize">
                                <Map size={14} className="text-blue-400" />
                                Kec. {row.kecamatan || '-'}
                              </div>
                              <div className="text-[11px] text-gray-400 mt-1 font-bold flex items-center gap-1">
                                <Building2 size={12} /> {row.sekolah}
                              </div>
                            </TableCell>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="4" className="px-6 py-20 text-center">
                              <div className="flex flex-col items-center justify-center text-gray-400">
                                <Search size={48} className="mb-4 opacity-20" />
                                <p className="font-medium text-gray-500">Data tidak ditemukan</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="bg-gray-50/80 px-8 py-5 border-t border-gray-100 text-[10px] font-bold text-gray-400 flex justify-between items-center">
                  <span className="uppercase tracking-widest text-[9px]">Koneksi: Supabase Cloud API</span>
                  <span className="uppercase tracking-widest text-[9px]">Total {filteredData.length} baris data</span>
                </div>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
