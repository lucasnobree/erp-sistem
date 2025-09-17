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
    const token = localStorage.getItem("access");

    if (!token) return; // se não tiver token, não tenta buscar

    fetch("http://127.0.0.1:8000/api/clientes/", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClientsData(data);
        } else {
          console.error("Resposta inesperada:", data);
          setClientsData([]);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar clientes:", err);
        setClientsData([]);
      });
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
      // login
      const authResponse = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "davy", password: "123" }),
      });

      if (!authResponse.ok) throw new Error("Falha na autenticação");

      const { access } = await authResponse.json();
      localStorage.setItem("access", access);

      // cria cliente
      const payload = {
        nome: newClient.nome,
        email: newClient.email,
        telefone: newClient.telefone,
        empresa: newClient.empresa,
        status: newClient.status.toUpperCase(),
        ultimo_contato: new Date(newClient.dataUltimoContato).toISOString(),
      };

      const response = await fetch("http://127.0.0.1:8000/api/clientes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      // ✅ em vez de adicionar só o cliente criado, recarregue toda a lista
      const clientsResponse = await fetch("http://127.0.0.1:8000/api/clientes/", {
        headers: {
          "Authorization": `Bearer ${access}`,
          "Content-Type": "application/json",
        },
      });

      const allClients = await clientsResponse.json();
      setClientsData(allClients);

      setIsFormOpen(false);

    } catch (err) {
      console.error("Erro completo:", err);
      alert(`Erro: ${err.message}`);
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
