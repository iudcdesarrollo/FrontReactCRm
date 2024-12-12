import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  PhoneCall, 
  PhoneForwarded,
  ClipboardCheck,
  UserCheck,
  XCircle,
  User,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import '../../css/Admins/Metrics.css';

interface Cliente {
  numero: string;
}

interface MetricData {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
  clients: Cliente[];
}

interface MetricsResponseData {
  agente: string;
  total: number;
  sinGestionar: number;
  clientesSinGestionar: Cliente[];
  conversacion: number;
  clientesConversacion: Cliente[];
  depuracion: number;
  clientesDepuracion: Cliente[];
  llamada: number;
  clientesLlamada: Cliente[];
  segundaLlamada: number;
  clientesSegundaLlamada: Cliente[];
  inscrito: number;
  clientesInscrito: Cliente[];
  ventaPerdida: number;
  clientesVentaPerdida: Cliente[];
  metricsByTime: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

const LeadsView: React.FC<{
  metric: MetricData;
  onBack: () => void;
}> = ({ metric, onBack }) => (
  <div className="p-6">
    <div className="flex items-center gap-4 mb-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Volver</span>
      </button>
      <h2 className="text-xl font-semibold text-white">
        {metric.title} - Lista de Leads
      </h2>
    </div>
    <div className="metrics-grid">
      {metric.clients.length > 0 ? (
        metric.clients.map((lead, index) => (
          <div key={index} className="metric-card">
            <div className="metric-content">
              <div className="metric-icon" style={{ backgroundColor: metric.color }}>
                <User size={24} />
              </div>
              <div className="metric-info">
                <h3 className="text-gray-400">Número de Contacto</h3>
                <div className="metric-value">{lead.numero}</div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-info">
              <div className="text-gray-400 text-center">No hay leads disponibles</div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

const MetricCard: React.FC<MetricData & { onClick: () => void }> = ({ 
  title, 
  value, 
  change, 
  icon, 
  color,
  onClick 
}) => (
  <div 
    className="metric-card group cursor-pointer hover:bg-gray-800 transition-all duration-200" 
    onClick={onClick}
  >
    <div className="metric-content">
      <div className="metric-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="metric-info">
        <h3>{title}</h3>
        <div className="metric-value">{value}</div>
        <div className="metric-change">{change}</div>
      </div>
    </div>
  </div>
);

const AgentCard: React.FC<{ name: string; onClick: () => void }> = ({ name, onClick }) => (
  <div
    className="metric-card group cursor-pointer hover:bg-gray-800 transition-all duration-200"
    onClick={onClick}
  >
    <div className="metric-content">
      <div className="metric-icon" style={{ backgroundColor: '#4F46E5' }}>
        <User size={24} />
      </div>
      <div className="metric-info">
        <h3 className="text-gray-400">Agente</h3>
        <div className="metric-value">{name}</div>
      </div>
    </div>
  </div>
);

const Metrics: React.FC = () => {
  const [metricsData, setMetricsData] = useState<{ [key: string]: MetricData[] }>({});
  const [agents, setAgents] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL_GENERAL}/metricas`);
        
        if (response.data.success && response.data.data.length > 0) {
          const agentsData = response.data.data as MetricsResponseData[];
          const agentNames = agentsData.map(data => data.agente);
          const metricsMap: { [key: string]: MetricData[] } = {};
          
          agentsData.forEach(apiData => {
            const calculateChange = (current: number, previous: number) => {
              return previous === 0 ? "N/A" : `${((current - previous) / previous * 100).toFixed(1)}% desde el mes pasado`;
            };

            metricsMap[apiData.agente] = [
              {
                title: "Total Leads",
                value: `${apiData.total} leads`,
                change: calculateChange(apiData.total, apiData.metricsByTime.monthly),
                icon: <Users size={24} />,
                color: '#4F46E5',
                clients: []
              },
              {
                title: "Sin Gestionar",
                value: `${apiData.sinGestionar} leads`,
                change: calculateChange(apiData.sinGestionar, apiData.metricsByTime.monthly),
                icon: <UserPlus size={24} />,
                color: '#7C3AED',
                clients: apiData.clientesSinGestionar
              },
              {
                title: "Conversación",
                value: `${apiData.conversacion} leads`,
                change: calculateChange(apiData.conversacion, apiData.metricsByTime.monthly),
                icon: <MessageCircle size={24} />,
                color: '#2563EB',
                clients: apiData.clientesConversacion
              },
              {
                title: "Depuración",
                value: `${apiData.depuracion} leads`,
                change: calculateChange(apiData.depuracion, apiData.metricsByTime.monthly),
                icon: <ClipboardCheck size={24} />,
                color: '#0891B2',
                clients: apiData.clientesDepuracion
              },
              {
                title: "Llamada",
                value: `${apiData.llamada} leads`,
                change: calculateChange(apiData.llamada, apiData.metricsByTime.monthly),
                icon: <PhoneCall size={24} />,
                color: '#059669',
                clients: apiData.clientesLlamada
              },
              {
                title: "Segunda Llamada",
                value: `${apiData.segundaLlamada} leads`,
                change: calculateChange(apiData.segundaLlamada, apiData.metricsByTime.monthly),
                icon: <PhoneForwarded size={24} />,
                color: '#0D9488',
                clients: apiData.clientesSegundaLlamada
              },
              {
                title: "Inscritos",
                value: `${apiData.inscrito} leads`,
                change: calculateChange(apiData.inscrito, apiData.metricsByTime.monthly),
                icon: <UserCheck size={24} />,
                color: '#16A34A',
                clients: apiData.clientesInscrito
              },
              {
                title: "Venta Perdida",
                value: `${apiData.ventaPerdida} leads`,
                change: calculateChange(apiData.ventaPerdida, apiData.metricsByTime.monthly),
                icon: <XCircle size={24} />,
                color: '#DC2626',
                clients: apiData.clientesVentaPerdida
              }
            ];
          });

          setAgents(agentNames);
          setMetricsData(metricsMap);
        } else {
          setError('No hay datos disponibles');
        }
      } catch (err) {
        setError('Error al cargar las métricas');
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="metrics-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="metric-card animate-pulse">
            <div className="h-32 bg-gray-800 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        {error}
      </div>
    );
  }

  // Show leads view if a metric is selected
  if (selectedMetric) {
    return (
      <LeadsView
        metric={selectedMetric}
        onBack={() => setSelectedMetric(null)}
      />
    );
  }

  // Show metrics view if an agent is selected
  if (selectedAgent) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setSelectedAgent(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
          <h2 className="text-xl font-semibold text-white">Métricas de {selectedAgent}</h2>
        </div>
        <div className="metrics-grid">
          {metricsData[selectedAgent]?.map((metric, i) => (
            <MetricCard 
              key={i} 
              {...metric} 
              onClick={() => setSelectedMetric(metric)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Show agents list
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Seleccionar Agente</h2>
      <div className="metrics-grid">
        {agents.map((agent) => (
          <AgentCard
            key={agent}
            name={agent}
            onClick={() => setSelectedAgent(agent)}
          />
        ))}
      </div>
    </div>
  );
};

export default Metrics;