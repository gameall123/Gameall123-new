import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  Eye,
  MousePointer,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color: string;
  }>;
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [isRealTime, setIsRealTime] = useState(false);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [salesData, setSalesData] = useState<ChartData | null>(null);
  const [userActivityData, setUserActivityData] = useState<ChartData | null>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<any[]>([]);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize real-time connection
  useEffect(() => {
    if (isRealTime) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => disconnectWebSocket();
  }, [isRealTime]);

  // Load initial data
  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const connectWebSocket = () => {
    try {
      wsRef.current = new WebSocket('ws://localhost:3000/analytics');
      
      wsRef.current.onopen = () => {
        console.log('📊 Analytics WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealTimeUpdate(data);
      };

      wsRef.current.onerror = (error) => {
        console.error('Analytics WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to analytics WebSocket:', error);
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const handleRealTimeUpdate = (data: any) => {
    switch (data.type) {
      case 'metric_update':
        updateMetrics(data.payload);
        break;
      case 'new_event':
        addRealtimeEvent(data.payload);
        break;
      case 'chart_update':
        updateChartData(data.payload);
        break;
    }
  };

  const updateMetrics = (newMetrics: Partial<MetricCard>[]) => {
    setMetrics(prev => 
      prev.map(metric => {
        const update = newMetrics.find(m => m.id === metric.id);
        return update ? { ...metric, ...update } : metric;
      })
    );
  };

  const addRealtimeEvent = (event: any) => {
    setRealtimeEvents(prev => [event, ...prev.slice(0, 19)]); // Keep last 20 events
  };

  const updateChartData = (chartUpdate: any) => {
    if (chartUpdate.chartId === 'sales') {
      setSalesData(chartUpdate.data);
    } else if (chartUpdate.chartId === 'users') {
      setUserActivityData(chartUpdate.data);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock metrics data
      const mockMetrics: MetricCard[] = [
        {
          id: 'revenue',
          title: 'Revenue Totale',
          value: '€24,567',
          change: 12.5,
          trend: 'up',
          icon: <DollarSign className="h-6 w-6" />,
          color: 'text-green-600',
          subtitle: '+€2,750 vs ultimo periodo'
        },
        {
          id: 'orders',
          title: 'Ordini',
          value: '1,247',
          change: 8.2,
          trend: 'up',
          icon: <ShoppingCart className="h-6 w-6" />,
          color: 'text-blue-600',
          subtitle: '89 ordini oggi'
        },
        {
          id: 'users',
          title: 'Utenti Attivi',
          value: '3,542',
          change: -2.1,
          trend: 'down',
          icon: <Users className="h-6 w-6" />,
          color: 'text-purple-600',
          subtitle: '245 nuovi questa settimana'
        },
        {
          id: 'products',
          title: 'Prodotti Venduti',
          value: '4,892',
          change: 15.7,
          trend: 'up',
          icon: <Package className="h-6 w-6" />,
          color: 'text-orange-600',
          subtitle: 'Bestseller: FIFA 24'
        },
        {
          id: 'views',
          title: 'Visualizzazioni',
          value: '48,293',
          change: 6.8,
          trend: 'up',
          icon: <Eye className="h-6 w-6" />,
          color: 'text-indigo-600',
          subtitle: '2.4k visualizzazioni/ora'
        },
        {
          id: 'conversion',
          title: 'Tasso Conversione',
          value: '3.8%',
          change: 0.5,
          trend: 'up',
          icon: <MousePointer className="h-6 w-6" />,
          color: 'text-pink-600',
          subtitle: '+0.2% vs media settore'
        }
      ];

      setMetrics(mockMetrics);

      // Mock chart data
      const mockSalesData: ChartData = {
        labels: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
        datasets: [
          {
            label: 'Vendite',
            data: [2400, 1398, 9800, 3908, 4800, 3800, 4300],
            color: '#3b82f6'
          },
          {
            label: 'Target',
            data: [2000, 3000, 4000, 3500, 4500, 4000, 4200],
            color: '#ef4444'
          }
        ]
      };

      setSalesData(mockSalesData);

      const mockUserData: ChartData = {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [
          {
            label: 'Utenti Attivi',
            data: [120, 80, 450, 890, 1200, 780],
            color: '#10b981'
          }
        ]
      };

      setUserActivityData(mockUserData);

      // Mock top products
      const mockTopProducts = [
        { id: 1, name: 'FIFA 24', sales: 234, revenue: '€13,620', change: 15.2 },
        { id: 2, name: 'Call of Duty MW3', sales: 189, revenue: '€11,340', change: 8.7 },
        { id: 3, name: 'PlayStation 5', sales: 67, revenue: '€33,500', change: 23.1 },
        { id: 4, name: 'Nintendo Switch OLED', sales: 95, revenue: '€28,500', change: -5.3 },
        { id: 5, name: 'Xbox Game Pass', sales: 156, revenue: '€2,340', change: 12.8 }
      ];

      setTopProducts(mockTopProducts);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const exportData = () => {
    const data = {
      metrics,
      salesData,
      userActivityData,
      topProducts,
      timeRange,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gameall-analytics-${timeRange}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const refreshData = () => {
    loadAnalyticsData();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Panoramica performance GameAll in tempo reale</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              {(['24h', '7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    timeRange === range 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Real-time Toggle */}
            <Button
              variant={isRealTime ? "default" : "outline"}
              onClick={() => setIsRealTime(!isRealTime)}
              className="flex items-center gap-2"
            >
              <Activity className={`h-4 w-4 ${isRealTime ? 'animate-pulse' : ''}`} />
              {isRealTime ? 'Live' : 'Static'}
            </Button>

            {/* Actions */}
            <Button variant="outline" onClick={refreshData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg bg-gray-100 ${metric.color}`}>
                      {metric.icon}
                    </div>
                    <div className="flex items-center">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : metric.trend === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : null}
                      <span className={`text-sm font-medium ml-1 ${
                        metric.trend === 'up' ? 'text-green-500' : 
                        metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                    {metric.subtitle && (
                      <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Vendite</TabsTrigger>
            <TabsTrigger value="users">Utenti</TabsTrigger>
            <TabsTrigger value="products">Prodotti</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Andamento Vendite
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Grafico vendite interattivo</p>
                      <p className="text-sm">(Chart.js integration)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Activity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Attività Utenti
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <LineChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Grafico attività utenti</p>
                      <p className="text-sm">(Real-time data)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Prodotti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.sales} vendite</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{product.revenue}</p>
                        <div className="flex items-center gap-1">
                          {product.change > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span className={`text-xs ${product.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {product.change > 0 ? '+' : ''}{product.change}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Analisi Dettagliata Vendite</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Grafici Vendite Avanzati</p>
                    <p>Breakdown per categoria, regione, tempo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Analisi Comportamento Utenti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">User Journey Analytics</p>
                    <p>Heatmaps, funnel analysis, retention</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Performance Prodotti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Product Analytics</p>
                    <p>Inventory, margins, demand forecasting</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Real-time Events */}
        {isRealTime && realtimeEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 animate-pulse text-green-500" />
                Eventi in Tempo Reale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {realtimeEvents.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded text-sm"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-600">{event.timestamp}</span>
                    <span className="font-medium">{event.message}</span>
                    {event.value && (
                      <Badge variant="secondary">{event.value}</Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}