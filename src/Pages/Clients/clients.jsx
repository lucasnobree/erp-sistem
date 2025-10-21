import { useState } from "react";
import { Box, Chip } from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader/PageHeader";
import { CustomTable } from "../../components/common/CustomTable/CustomTable";
import { ClientForm } from "../../components/forms/ClientForm/ClientForm";
import { Loading } from "../../components/common/Loading/Loading";
import { useClients } from "../../shared/hooks";
import { useNotification } from "../../components/common/Notification/Notification";
import styles from "./clients.module.css";

export default function Clientes() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const { 
    data: clientsData, 
    loading, 
    error, 
    create, 
    refetch 
  } = useClients();
  
  const { showSuccess, showError } = useNotification();

  // Configuração das colunas da tabela
  const columns = [
    { id: "nome", label: "Nome", align: "left" },
    { id: "email", label: "Email", align: "left" },
    { id: "telefone", label: "Telefone", align: "left" },
    { id: "empresa", label: "Empresa", align: "left" },
    {
      id: "status",
      label: "Status",
      align: "center",
      render: (value) => (
        <Chip
          label={value}
          color={value === "ATIVO" ? "success" : "default"}
          size="small"
        />
      )
    },
    {
      id: "ultimo_contato",
      label: "Último Contato",
      align: "center",
      render: (value) =>
        value ? new Date(value).toLocaleDateString("pt-BR") : "-"
    }
  ];

  const handleAddClient = () => {
    setIsFormOpen(true);
  };

  const handleSubmitClient = async (newClient) => {
    const payload = {
      nome: newClient.nome,
      email: newClient.email,
      telefone: newClient.telefone,
      empresa: newClient.empresa,
      status: newClient.status.toUpperCase(),
      ultimo_contato: new Date(newClient.dataUltimoContato).toISOString(),
    };

    const result = await create(payload);
    
    if (result.success) {
      showSuccess("Cliente criado com sucesso!");
      setIsFormOpen(false);
    } else {
      showError(result.error || "Erro ao criar cliente");
    }
  };

  if (loading && !clientsData) {
    return <Loading fullScreen message="Carregando clientes..." />;
  }

  if (error) {
    return (
      <Box className={styles.Container}>
        <PageHeader
          title="Clientes"
          subtitle="Erro ao carregar dados"
        />
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <p>Erro: {error}</p>
          <button onClick={refetch}>Tentar novamente</button>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={styles.Container}>
      <PageHeader
        title="Clientes"
        subtitle="Gerencie seus clientes e relacionamentos"
        onAdd={handleAddClient}
        addButtonText="Novo Cliente"
      />

      <CustomTable
        columns={columns}
        data={clientsData || []}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        showActions={true}
      />

      {/* Formulário de Cliente */}
      <ClientForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitClient}
        mode="create"
      />
    </Box>
  );
}
