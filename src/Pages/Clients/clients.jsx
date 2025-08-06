import { useState } from "react";
import { Box, Chip } from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader/PageHeader";
import { CustomTable } from "../../components/common/CustomTable/CustomTable";
import styles from "./clients.module.css";

export default function Clientes() {
  const [selectedRows, setSelectedRows] = useState([]);

  // Dados mockados para demonstração
  const clientsData = [
    {
      id: 1,
      nome: "João Silva",
      email: "joao@email.com",
      telefone: "(11) 99999-9999",
      empresa: "Tech Solutions",
      status: "Ativo",
      dataUltimoContato: "2024-01-15"
    },
    {
      id: 2,
      nome: "Maria Santos",
      email: "maria@email.com",
      telefone: "(11) 88888-8888",
      empresa: "Digital Corp",
      status: "Inativo",
      dataUltimoContato: "2024-01-10"
    },
    {
      id: 3,
      nome: "Pedro Oliveira",
      email: "pedro@email.com",
      telefone: "(11) 77777-7777",
      empresa: "StartUp Inc",
      status: "Ativo",
      dataUltimoContato: "2024-01-20"
    }
  ];

  // Configuração das colunas da tabela
  const columns = [
    {
      id: "nome",
      label: "Nome",
      align: "left"
    },
    {
      id: "email",
      label: "Email",
      align: "left"
    },
    {
      id: "telefone",
      label: "Telefone",
      align: "left"
    },
    {
      id: "empresa",
      label: "Empresa",
      align: "left"
    },
    {
      id: "status",
      label: "Status",
      align: "center",
      render: (value) => (
        <Chip
          label={value}
          color={value === "Ativo" ? "success" : "default"}
          size="small"
        />
      )
    },
    {
      id: "dataUltimoContato",
      label: "Último Contato",
      align: "center",
      render: (value) => new Date(value).toLocaleDateString("pt-BR")
    }
  ];

  const handleAddClient = () => {
    console.log("Adicionar novo cliente");
    // Implementar modal ou navegação para formulário de criação
  };

  const handleEditClient = (clientId) => {
    console.log("Editar cliente:", clientId);
    // Implementar lógica de edição
  };

  const handleDeleteClient = (clientId) => {
    console.log("Deletar cliente:", clientId);
    // Implementar lógica de exclusão
  };

  const handleViewClient = (clientId) => {
    console.log("Visualizar cliente:", clientId);
    // Implementar lógica de visualização
  };

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
        data={clientsData}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
        onView={handleViewClient}
        showActions={true}
      />
    </Box>
  );
}

