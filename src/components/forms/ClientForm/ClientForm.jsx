import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box
} from "@mui/material";
import styles from "./ClientForm.module.css";

/**
 * Formulário para criação/edição de clientes
 * @param {boolean} open - Se o modal está aberto
 * @param {function} onClose - Função chamada ao fechar o modal
 * @param {function} onSubmit - Função chamada ao submeter o formulário
 * @param {object} initialData - Dados iniciais para edição
 * @param {string} mode - Modo do formulário (create, edit, view)
 */
export function ClientForm({
  open,
  onClose,
  onSubmit,
  initialData = {},
  mode = "create"
}) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    status: "Ativo",
    dataUltimoContato: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});

  // Preencher formulário quando initialData mudar
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/clientes/", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("access")}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Resposta da API:", data, "É array?", Array.isArray(data));
        if (Array.isArray(data)) {
          setClientsData(data);
        } else {
          setClientsData([]);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar clientes:", err);
        setClientsData([]);
      });
  }, []);




  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validação de campos obrigatórios
    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      empresa: "",
      status: "Ativo",
      dataUltimoContato: new Date().toISOString().split('T')[0]
    });
    setErrors({});
    onClose();
  };

  const isReadOnly = mode === "view";
  const title = mode === "create" ? "Novo Cliente" :
    mode === "edit" ? "Editar Cliente" : "Visualizar Cliente";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      className={styles.Dialog}
    >
      <DialogTitle className={styles.Title}>
        {title}
      </DialogTitle>

      <DialogContent className={styles.Content}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Nome Completo"
              value={formData.nome}
              onChange={handleInputChange("nome")}
              required
              disabled={isReadOnly}
              error={!!errors.nome}
              helperText={errors.nome}
              placeholder="Digite o nome completo"
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange("email")}
              required
              disabled={isReadOnly}
              error={!!errors.email}
              helperText={errors.email}
              placeholder="exemplo@email.com"
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Telefone"
              value={formData.telefone}
              onChange={handleInputChange("telefone")}
              required
              disabled={isReadOnly}
              error={!!errors.telefone}
              helperText={errors.telefone}
              placeholder="(11) 99999-9999"
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Empresa"
              value={formData.empresa}
              onChange={handleInputChange("empresa")}
              disabled={isReadOnly}
              placeholder="Nome da empresa"
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth disabled={isReadOnly}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={handleInputChange("status")}
              >
                <MenuItem value="Ativo">Ativo</MenuItem>
                <MenuItem value="Inativo">Inativo</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Data do Último Contato"
              type="date"
              value={formData.dataUltimoContato}
              onChange={handleInputChange("dataUltimoContato")}
              disabled={isReadOnly}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions className={styles.Actions}>
        <Button onClick={handleClose} color="secondary">
          {isReadOnly ? "Fechar" : "Cancelar"}
        </Button>
        {!isReadOnly && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
          >
            {mode === "create" ? "Criar Cliente" : "Salvar Alterações"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
