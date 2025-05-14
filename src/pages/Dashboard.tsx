
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer } from '@/components/ui/chart';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  ChartPie, ChartBar, ChartColumnStacked, ChartLine, Users, 
  LayoutDashboard, Menu
} from 'lucide-react';
import { Proposal } from '@/types/proposal';
import { mockProposals } from '@/data/mockData';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const Dashboard: React.FC = () => {
  const { user, users, filterProposals } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  // Use filterProposals para obter as propostas
  const proposals = filterProposals(mockProposals);
  
  // Dados para gráfico de propostas por status
  const proposalsByStatus = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    proposals.forEach(proposal => {
      statusCounts[proposal.status] = (statusCounts[proposal.status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
  }, [proposals]);
  
  // Dados para gráfico de propostas por mês
  const proposalsByMonth = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    const valueCounts: Record<string, number> = {};
    
    proposals.forEach(proposal => {
      const date = new Date(proposal.date);
      const monthYear = format(date, 'MMM/yy');
      
      monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
      valueCounts[monthYear] = (valueCounts[monthYear] || 0) + proposal.totals.grandTotal;
    });
    
    const months = Object.keys(monthCounts).sort((a, b) => {
      const dateA = new Date('01 ' + a);
      const dateB = new Date('01 ' + b);
      return dateA.getTime() - dateB.getTime();
    });
    
    return months.map(month => ({
      name: month,
      count: monthCounts[month],
      value: valueCounts[month]
    }));
  }, [proposals]);
  
  // Dados para ranking de usuários por quantidade de propostas
  const userRanking = useMemo(() => {
    const userCounts: Record<string, { count: number, value: number }> = {};
    
    proposals.forEach(proposal => {
      const manager = proposal.managerName;
      if (!userCounts[manager]) {
        userCounts[manager] = { count: 0, value: 0 };
      }
      userCounts[manager].count += 1;
      userCounts[manager].value += proposal.totals.grandTotal;
    });
    
    return Object.entries(userCounts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        value: data.value
      }))
      .sort((a, b) => b.count - a.count);
  }, [proposals, users]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  if (!user?.isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <div className="container mx-auto py-12 px-4">
          <h1 className="text-2xl font-bold">Acesso Negado</h1>
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="container mx-auto py-4 md:py-6 px-2 md:px-4">
        <header className="mb-4 md:mb-8 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1 md:mt-2">
              Visualização de dados e estatísticas das propostas
            </p>
          </div>
          {isMobile && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
              aria-label="Menu do dashboard"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </header>
        
        <Separator className="mb-4 md:mb-6" />
        
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block`}>
          <Tabs defaultValue="overview" className="mb-6 md:mb-8">
            <ScrollArea className="w-full">
              <TabsList className="mb-4 md:mb-6 flex-nowrap overflow-x-auto w-full">
                <TabsTrigger value="overview" className="flex items-center gap-1 whitespace-nowrap">
                  <ChartBar className="h-4 w-4" /> Visão Geral
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-1 whitespace-nowrap">
                  <Users className="h-4 w-4" /> Usuários
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center gap-1 whitespace-nowrap">
                  <ChartLine className="h-4 w-4" /> Timeline
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
            
            <TabsContent value="overview" className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Gráfico de propostas por status */}
                <Card>
                  <CardHeader className="pb-1 md:pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <ChartPie className="h-5 w-5" />
                      Propostas por Status
                    </CardTitle>
                    <CardDescription>
                      Distribuição de propostas por status atual
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 md:pt-2">
                    <ChartContainer 
                      config={{}} 
                      className="h-[280px] md:h-80 mt-2"
                      aspectRatio={isMobile ? "square" : "video"}
                    >
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                          data={proposalsByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={!isMobile}
                          label={({ name, percent }) => 
                            isMobile 
                              ? null 
                              : `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={isMobile ? 60 : 80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {proposalsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} propostas`, 'Quantidade']} />
                        <Legend layout={isMobile ? "horizontal" : "vertical"} verticalAlign={isMobile ? "bottom" : "middle"} align={isMobile ? "center" : "right"} />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
                
                {/* Gráfico de valores por status */}
                <Card>
                  <CardHeader className="pb-1 md:pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <ChartColumnStacked className="h-5 w-5" />
                      Valores por Status
                    </CardTitle>
                    <CardDescription>
                      Total de valores de propostas por status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 md:pt-2">
                    <ChartContainer 
                      config={{}} 
                      className="h-[280px] md:h-80 mt-2"
                      aspectRatio={isMobile ? "square" : "video"}
                    >
                      <BarChart 
                        data={proposalsByStatus}
                        margin={isMobile ? { top: 5, right: 5, bottom: 5, left: 5 } : { top: 20, right: 30, bottom: 5, left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} />
                        <YAxis width={isMobile ? 30 : 40} tick={{ fontSize: isMobile ? 10 : 12 }} />
                        <Tooltip 
                          formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Valor']}
                        />
                        <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                        <Bar dataKey="value" name="Quantidade" fill="#8884d8" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="users" className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {/* Ranking de usuários */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Ranking de Usuários</CardTitle>
                    <CardDescription>
                      Usuários classificados por número de propostas e valor total
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">Pos</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead className="text-center">Propostas</TableHead>
                          <TableHead className="text-right">Valor Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userRanking.slice(0, isMobile ? 5 : 10).map((user, index) => (
                          <TableRow key={user.name}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="max-w-[120px] md:max-w-none truncate">{user.name}</TableCell>
                            <TableCell className="text-center">{user.count}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              R$ {user.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                {/* Gráfico de propostas por usuário */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Propostas por Usuário</CardTitle>
                    <CardDescription>
                      Comparação da quantidade de propostas por usuário
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 md:pt-2">
                    <ChartContainer 
                      config={{}} 
                      className="h-[280px] md:h-80 mt-2"
                      aspectRatio={isMobile ? "square" : "video"}
                    >
                      <BarChart 
                        data={userRanking.slice(0, isMobile ? 5 : 8)}
                        margin={isMobile ? { top: 5, right: 5, bottom: 50, left: 5 } : { top: 20, right: 30, bottom: 70, left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          height={60}
                          tick={{ fontSize: isMobile ? 10 : 12 }}
                          tickFormatter={(value) => value.length > 10 ? value.substring(0, 10) + "..." : value}
                          angle={-45} 
                          textAnchor="end"
                        />
                        <YAxis width={isMobile ? 30 : 40} tick={{ fontSize: isMobile ? 10 : 12 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                        <Bar dataKey="count" name="Propostas" fill="#82ca9d" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {/* Tendência de propostas por mês */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Evolução Mensal de Propostas</CardTitle>
                    <CardDescription>
                      Quantidade e valor total de propostas por mês
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 md:pt-2">
                    <ChartContainer 
                      config={{}} 
                      className="h-[280px] md:h-80 mt-2"
                      aspectRatio={isMobile ? "square" : "video"}
                    >
                      <AreaChart 
                        data={proposalsByMonth}
                        margin={isMobile ? { top: 5, right: 5, bottom: 5, left: 5 } : { top: 20, right: 30, bottom: 5, left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} />
                        <YAxis yAxisId="left" orientation="left" width={isMobile ? 30 : 40} tick={{ fontSize: isMobile ? 10 : 12 }} />
                        <YAxis yAxisId="right" orientation="right" width={isMobile ? 30 : 40} tick={{ fontSize: isMobile ? 10 : 12 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                        <Area 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="count" 
                          name="Quantidade" 
                          fill="#8884d8" 
                          stroke="#8884d8"
                          strokeWidth={isMobile ? 1 : 2}
                        />
                        <Area 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="value" 
                          name="Valor Total (R$)" 
                          fill="#82ca9d" 
                          stroke="#82ca9d"
                          strokeWidth={isMobile ? 1 : 2}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <Separator className="my-4 md:my-6" />
        
        {/* Resumo de Dados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 md:mt-6">
          <Card>
            <CardHeader className="pb-0 md:pb-2">
              <CardTitle className="text-base md:text-lg">Total de Propostas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl md:text-4xl font-bold">{proposals.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-0 md:pb-2">
              <CardTitle className="text-base md:text-lg">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl md:text-4xl font-bold truncate">
                R$ {proposals.reduce((sum, p) => sum + p.totals.grandTotal, 0)
                  .toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </p>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2 md:col-span-1">
            <CardHeader className="pb-0 md:pb-2">
              <CardTitle className="text-base md:text-lg">Propostas em Aberto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl md:text-4xl font-bold">
                {proposals.filter(p => p.status === "Em aberto").length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
