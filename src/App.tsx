/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Shield, 
  Activity, 
  Clock, 
  Globe, 
  EyeOff, 
  Share2, 
  Search,
  AlertCircle,
  ChevronRight,
  Database,
  Lock,
  Zap,
  RefreshCw,
  Cpu,
  Terminal,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Music,
  Download
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TrafficEntry {
  id: string;
  url: string;
  timestamp: string;
  category: string;
  duration: string;
  contentSnippet?: string;
  isIncognito: boolean;
  isSocial: boolean;
  type: 'web' | 'message';
  messageData?: {
    text?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio';
  };
}

interface SystemLog {
  id: string;
  time: string;
  event: string;
  type: 'info' | 'warn' | 'success' | 'error';
}

const MOCK_DATA: TrafficEntry[] = [
  {
    id: '1',
    url: 'https://www.instagram.com/reels/',
    timestamp: '2024-03-04 15:22:10',
    category: 'Social Media',
    duration: '12m 45s',
    contentSnippet: 'Video stream: user_id_882...',
    isIncognito: false,
    isSocial: true,
    type: 'web',
  },
  {
    id: 'm1',
    url: 'WhatsApp (Inbound)',
    timestamp: '2024-03-04 15:15:00',
    category: 'Messaging',
    duration: 'N/A',
    isIncognito: false,
    isSocial: true,
    type: 'message',
    messageData: {
      text: 'Olá, você viu o relatório que te mandei?',
    }
  },
  {
    id: 'm2',
    url: 'Telegram (Outbound)',
    timestamp: '2024-03-04 15:12:30',
    category: 'Messaging',
    duration: 'N/A',
    isIncognito: false,
    isSocial: true,
    type: 'message',
    messageData: {
      mediaUrl: 'https://picsum.photos/seed/capture1/800/600',
      mediaType: 'image',
      text: 'Captura de tela do sistema'
    }
  },
  {
    id: '2',
    url: 'https://www.google.com/search?q=como+hackear...',
    timestamp: '2024-03-04 15:10:05',
    category: 'Search',
    duration: '2m 10s',
    contentSnippet: 'Query: "como hackear..."',
    isIncognito: true,
    isSocial: false,
    type: 'web',
  },
  {
    id: 'm3',
    url: 'WhatsApp (Inbound)',
    timestamp: '2024-03-04 15:05:00',
    category: 'Messaging',
    duration: 'N/A',
    isIncognito: false,
    isSocial: true,
    type: 'message',
    messageData: {
      mediaUrl: '#',
      mediaType: 'video',
      text: 'video_aula_seguranca.mp4'
    }
  },
  {
    id: '3',
    url: 'https://twitter.com/home',
    timestamp: '2024-03-04 14:55:30',
    category: 'Social Media',
    duration: '45m 12s',
    contentSnippet: 'Timeline feed update...',
    isIncognito: false,
    isSocial: true,
    type: 'web',
  },
];

const CATEGORY_DATA = [
  { name: 'Social', value: 45, color: '#141414' },
  { name: 'Search', value: 25, color: '#444444' },
  { name: 'Dev', value: 15, color: '#777777' },
  { name: 'Other', value: 15, color: '#aaaaaa' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'log' | 'stats' | 'system' | 'settings'>('log');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([
    { id: '1', time: '15:30:01', event: 'Foreground Service initialized', type: 'success' },
    { id: '2', time: '15:30:05', event: 'Watchdog started monitoring (PID: 2881)', type: 'info' },
    { id: '3', time: '15:35:10', event: 'Auto-restart policy: ON_BOOT active', type: 'info' },
  ]);

  const logEndRef = useRef<HTMLDivElement>(null);

  const exportToCSV = () => {
    // Usando ponto e vírgula (;) como separador para melhor compatibilidade com Excel em PT-BR
    const headers = ['ID', 'URL_Origem', 'Data_Hora', 'Categoria', 'Duracao', 'Tipo', 'Conteudo_Link'];
    const rows = MOCK_DATA.map(entry => [
      entry.id,
      entry.url,
      entry.timestamp,
      entry.category,
      entry.duration,
      entry.type,
      entry.type === 'message' 
        ? (entry.messageData?.text || '') + (entry.messageData?.mediaUrl ? ` [Link: ${entry.messageData.mediaUrl}]` : '')
        : entry.contentSnippet || ''
    ]);

    // Adiciona o BOM (Byte Order Mark) para o Excel reconhecer como UTF-8
    const BOM = '\uFEFF';
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_trafego_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (activeTab === 'system') {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [systemLogs, activeTab]);

  // Simulate Watchdog activity
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newLog: SystemLog = {
        id: Math.random().toString(),
        time: timeStr,
        event: 'Watchdog: Heartbeat check - Service ALIVE',
        type: 'info'
      };
      setSystemLogs(prev => [...prev.slice(-15), newLog]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto border-x border-line shadow-2xl bg-white overflow-hidden">
      {/* Header */}
      <header className="bg-ink text-bg p-6 flex justify-between items-center sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-bg p-2 rounded-lg">
            <Settings className="w-6 h-6 text-ink animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">config local</h1>
            <p className="text-[10px] opacity-60 font-mono">PERSISTENCE_MODE: ACTIVE</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-bold uppercase tracking-widest opacity-70">Service Running</span>
          </div>
          <button 
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold transition-colors",
              isMonitoring ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
            )}
          >
            {isMonitoring ? "ACTIVE" : "PAUSED"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {/* Persistence Status Bar */}
        <div className="p-3 bg-ink/5 border-b border-line/10 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 bg-white rounded-lg border border-line/5 shadow-sm">
            <Cpu className="w-3 h-3 mb-1 text-ink" />
            <span className="text-[8px] font-bold uppercase opacity-50">Foreground</span>
            <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase">Active</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-white rounded-lg border border-line/5 shadow-sm">
            <RefreshCw className="w-3 h-3 mb-1 text-ink" />
            <span className="text-[8px] font-bold uppercase opacity-50">Auto-Restart</span>
            <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase">Enabled</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-white rounded-lg border border-line/5 shadow-sm">
            <Zap className="w-3 h-3 mb-1 text-ink" />
            <span className="text-[8px] font-bold uppercase opacity-50">Watchdog</span>
            <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase">Monitoring</span>
          </div>
        </div>

        {activeTab === 'log' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 flex justify-between items-center border-b border-line/5">
              <h2 className="col-header">Log de Atividade Recente</h2>
              <Database className="w-3 h-3 opacity-30" />
            </div>
            
            <div className="divide-y divide-line/5">
              {MOCK_DATA.map((entry) => (
                <div key={entry.id} className="p-4 hover:bg-ink group transition-colors border-b border-line/5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col gap-1 pr-2 overflow-hidden flex-1">
                      <div className="flex items-center gap-2">
                        {entry.isIncognito && <EyeOff className="w-3 h-3 text-red-500" />}
                        {entry.isSocial && <Share2 className="w-3 h-3 text-blue-500" />}
                        {entry.type === 'message' && <MessageSquare className="w-3 h-3 text-emerald-500" />}
                        <span className="text-[11px] font-bold truncate group-hover:text-bg">{entry.url}</span>
                      </div>
                      <span className="text-[9px] opacity-50 font-mono group-hover:text-bg/50">{entry.timestamp}</span>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[10px] font-mono group-hover:text-bg block">{entry.category}</span>
                      <span className="text-[10px] font-bold group-hover:text-bg">{entry.duration}</span>
                    </div>
                  </div>

                  {/* Message Content / Media Links */}
                  {entry.type === 'message' && entry.messageData && (
                    <div className="mt-2 p-2 bg-bg/30 rounded-lg border border-line/5 group-hover:bg-white/10 group-hover:border-white/20">
                      {entry.messageData.text && (
                        <p className="text-[10px] group-hover:text-bg/90 mb-1 italic">
                          "{entry.messageData.text}"
                        </p>
                      )}
                      {entry.messageData.mediaUrl && (
                        <div className="flex items-center gap-2 mt-1">
                          {entry.messageData.mediaType === 'image' && <ImageIcon className="w-3 h-3 text-bg/50 group-hover:text-bg" />}
                          {entry.messageData.mediaType === 'video' && <Video className="w-3 h-3 text-bg/50 group-hover:text-bg" />}
                          {entry.messageData.mediaType === 'audio' && <Music className="w-3 h-3 text-bg/50 group-hover:text-bg" />}
                          <a 
                            href={entry.messageData.mediaUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] font-bold text-blue-600 group-hover:text-blue-300 underline flex items-center gap-1"
                          >
                            <Download className="w-2 h-2" />
                            Baixar {entry.messageData.mediaType}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Content Detail Simulation */}
            <div className="m-4 p-4 bg-ink text-bg rounded-xl shadow-inner">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Inspeção de Conteúdo (SSL Decrypt)</span>
              </div>
              <div className="font-mono text-[10px] opacity-80 leading-relaxed">
                <p className="mb-1 text-emerald-400">[SYSTEM] Decriptação ativa para instagram.com</p>
                <p className="mb-1">GET /reels/C9283XJ2/ HTTP/1.1</p>
                <p className="mb-1">User-Agent: Android/14 (Pixel 7)</p>
                <p className="text-yellow-400">Payload: {"{ \"action\": \"view\", \"media_id\": \"3312...\" }"}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="col-header">Console do Watchdog</h2>
              <Terminal className="w-4 h-4 opacity-30" />
            </div>
            
            <div className="bg-ink rounded-xl p-4 font-mono text-[10px] h-96 overflow-y-auto flex flex-col gap-2 shadow-inner border border-line/20">
              {systemLogs.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <span className="text-bg/40">[{log.time}]</span>
                  <span className={cn(
                    log.type === 'info' && "text-bg/80",
                    log.type === 'success' && "text-emerald-400",
                    log.type === 'warn' && "text-yellow-400",
                    log.type === 'error' && "text-red-400"
                  )}>
                    {log.event}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>

            <div className="mt-6 space-y-4">
              <div className="p-4 border border-line/10 rounded-xl bg-bg/20">
                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2">Lógica de Persistência</h3>
                <ul className="space-y-2 text-[10px] opacity-70">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-ink mt-1.5" />
                    <span><b>Foreground Service:</b> Notificação persistente impede o Android de encerrar o processo por falta de memória.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-ink mt-1.5" />
                    <span><b>Auto-Restart:</b> Implementado via <code>START_STICKY</code> e <code>BroadcastReceiver</code> para boot completo.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-ink mt-1.5" />
                    <span><b>Watchdog:</b> Tarefa agendada via <code>WorkManager</code> que verifica a saúde do serviço a cada 15 minutos.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="col-header mb-6">Distribuição por Categoria</h2>
            
            <div className="h-64 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {CATEGORY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#141414', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#E4E3E0',
                      fontSize: '12px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {CATEGORY_DATA.map((cat) => (
                <div key={cat.name} className="p-4 border border-line/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-[10px] font-bold uppercase">{cat.name}</span>
                  </div>
                  <p className="text-xl font-mono font-bold">{cat.value}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="col-header mb-6">Configurações do Sistema</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-line/10 rounded-xl">
                <div>
                  <p className="text-xs font-bold uppercase">Capturar Modo Anônimo</p>
                  <p className="text-[10px] opacity-50">Usa Accessibility Services</p>
                </div>
                <div className="w-10 h-5 bg-ink rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-bg rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-line/10 rounded-xl">
                <div>
                  <p className="text-xs font-bold uppercase">Inspeção SSL (MITM)</p>
                  <p className="text-[10px] opacity-50">Requer Certificado Root</p>
                </div>
                <div className="w-10 h-5 bg-ink rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-bg rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-line/10 rounded-xl">
                <div>
                  <p className="text-xs font-bold uppercase">Auto-Restart (Boot)</p>
                  <p className="text-[10px] opacity-50">Inicia com o celular</p>
                </div>
                <div className="w-10 h-5 bg-ink rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-bg rounded-full" />
                </div>
              </div>

              <div className="p-4 border border-line/10 rounded-xl bg-bg/30">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-4 h-4 text-ink" />
                  <p className="text-xs font-bold uppercase">Gestão de Dados e Extração</p>
                </div>
                
                <div className="space-y-4">
                  {/* Periodicidade */}
                  <div>
                    <label className="text-[9px] font-bold uppercase opacity-50 block mb-2">Tempo de Retenção (Logs)</label>
                    <select className="w-full bg-white border border-line/10 rounded-lg p-2 text-[10px] font-mono outline-none">
                      <option>24 Horas (Auto-delete)</option>
                      <option>7 Dias</option>
                      <option selected>30 Dias</option>
                      <option>Permanente (Manual)</option>
                    </select>
                  </div>

                  {/* Categorias */}
                  <div>
                    <label className="text-[9px] font-bold uppercase opacity-50 block mb-2">Categorias para Extração</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Social Media', 'Buscas', 'Adulto', 'Financeiro', 'Messaging', 'Outros'].map(cat => (
                        <label key={cat} className="flex items-center gap-2 p-2 bg-white border border-line/5 rounded-lg">
                          <input type="checkbox" defaultChecked className="w-3 h-3 accent-ink" />
                          <span className="text-[9px] uppercase font-bold">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Local de Extração */}
                  <div>
                    <label className="text-[9px] font-bold uppercase opacity-50 block mb-2">Destino da Extração</label>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-ink text-bg rounded-lg text-[9px] font-bold uppercase">Local (SQLite)</button>
                      <button className="flex-1 py-2 bg-white border border-line/20 text-ink rounded-lg text-[9px] font-bold uppercase opacity-50">Cloud Sync</button>
                    </div>
                    <p className="text-[8px] opacity-40 mt-1 italic">Local: /data/user/0/com.configlocal.app/databases/traffic.db</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-line/10 rounded-xl bg-emerald-50/30">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs font-bold uppercase text-emerald-800">Certificado de Inspeção SSL</p>
                </div>
                <p className="text-[10px] text-emerald-700 mb-4 leading-tight">
                  Necessário para capturar conteúdo de redes sociais e sites HTTPS. Sem este certificado, as URLs aparecerão como "Criptografadas".
                </p>
                <button 
                  onClick={() => alert('Simulando download do arquivo: config_local_ca.crt')}
                  className="w-full py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors mb-4"
                >
                  Gerar e Baixar Certificado (.crt)
                </button>
                
                <div className="space-y-2">
                  <p className="text-[9px] font-bold uppercase opacity-50">Como instalar no Android:</p>
                  <ol className="text-[9px] space-y-1 list-decimal list-inside opacity-70">
                    <li>Vá em Configurações {'>'} Segurança</li>
                    <li>Criptografia e Credenciais</li>
                    <li>Instalar um certificado {'>'} Certificado CA</li>
                    <li>Selecione o arquivo 'config_local_ca.crt'</li>
                    <li>Confirme a instalação "Assim mesmo"</li>
                  </ol>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={exportToCSV}
                  className="w-full py-4 bg-ink text-bg rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar Relatório (CSV)
                </button>
                <button className="w-full py-4 bg-white border border-line/20 text-ink rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-bg transition-colors">
                  Exportar Relatório (PDF)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-bg border-t border-line/20 flex justify-around items-center p-4 z-20">
        <button 
          onClick={() => setActiveTab('log')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'log' ? "text-ink" : "text-ink/30")}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase">Logs</span>
        </button>
        <button 
          onClick={() => setActiveTab('system')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'system' ? "text-ink" : "text-ink/30")}
        >
          <Cpu className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase">System</span>
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'stats' ? "text-ink" : "text-ink/30")}
        >
          <Globe className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase">Stats</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'settings' ? "text-ink" : "text-ink/30")}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase">Config</span>
        </button>
      </nav>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
