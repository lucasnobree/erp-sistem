import { useState, useEffect } from "react";
import { Box, Chip } from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader/PageHeader";
import { CustomTable } from "../../components/common/CustomTable/CustomTable";
import { ClientForm } from "../../components/forms/ClientForm/ClientForm";
import styles from "./clients.module.css";

export default function Clientes() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [clientsData, setClientsData] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Buscar clientes na API quando o componente carregar
  useEffect(() => {
    fetch("http://localhost:8000/api/clientes/") // ajuste a URL para sua API Django
      .then((res) => res.json())
      .then((data) => setClientsData(data))
      .catch((err) => console.error("Erro ao buscar clientes:", err));
  }, []);

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
          color={value === "Ativo" ? "success" : "default"}
          size="small"
        />
      )
    },
    {
      id: "dataUltimoContato",
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
    try {
      const response = await fetch("http://localhost:8000/api/clientes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar cliente");
      }

      const savedClient = await response.json();

      // Atualiza a lista sem precisar recarregar
      setClientsData((prev) => [...prev, savedClient]);
    } catch (err) {
      console.error(err);
    }
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
