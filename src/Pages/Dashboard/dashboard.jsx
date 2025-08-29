import { Grid, Box } from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader/PageHeader";
import { DataCard } from "../../components/common/DataCard/DataCard";
import { 
  People, 
  Assignment, 
  TrendingUp, 
  AttachMoney 
} from "@mui/icons-material";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  console.log("Dashboard component loaded");
  // Dados mockados para demonstração
  const dashboardData = [
    {
      id: 1,
      title: "Total de Clientes",
      value: "1,234",
      subtitle: "Clientes ativos",
      icon: <People />,
      trend: "up",
      trendValue: "+12% este mês"
    },
    {
      id: 2,
      title: "Projetos Ativos",
      value: "56",
      subtitle: "Em andamento",
      icon: <Assignment />,
      trend: "up",
      trendValue: "+8% este mês"
    },
    {
      id: 3,
      title: "Taxa de Conversão",
      value: "68%",
      subtitle: "Leads convertidos",
      icon: <TrendingUp />,
      trend: "down",
      trendValue: "-3% este mês"
    },
    {
      id: 4,
      title: "Receita Total",
      value: "R$ 125.430",
      subtitle: "Este mês",
      icon: <AttachMoney />,
      trend: "up",
      trendValue: "+15% este mês"
    }
  ];

  const handleAddNew = () => {
    console.log("Adicionar novo item ao dashboard");
    // Implementar lógica de adição
  };

  return (
    <Box className={styles.Container}>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do seu negócio"
        onAdd={handleAddNew}
        addButtonText="Novo Widget"
      />
      
      <Grid container spacing={3}>
        {dashboardData.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.id}>
            <DataCard
              title={item.title}
              value={item.value}
              subtitle={item.subtitle}
              icon={item.icon}
              trend={item.trend}
              trendValue={item.trendValue}
              onMenuClick={() => console.log(`Menu clicked for ${item.title}`)}
            />
          </Grid>
        ))}
      </Grid>
      
      {/* Área para gráficos e outras visualizações */}
      <Box className={styles.ChartsSection}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box className={styles.ChartPlaceholder}>
              <h3>Gráfico de Vendas</h3>
              <p>Aqui será implementado um gráfico de vendas ao longo do tempo</p>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className={styles.ChartPlaceholder}>
              <h3>Atividades Recentes</h3>
              <p>Lista das atividades mais recentes do sistema</p>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
