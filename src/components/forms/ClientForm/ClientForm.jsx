import { useState } from "react";
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
  MenuItem
} from "@mui/material";
import { ValidatedInput, validationRules } from "../ValidatedInput/ValidatedInput";
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
    nome: initialData.nome || "",
    email: initialData.email || "",
    telefone: initialData.telefone || "",
    empresa: initialData.empresa || "",
    cargo: initialData.cargo || "",
    endereco: initialData.endereco || "",
    cidade: initialData.cidade || "",
    estado: initialData.estado || "",
    cep: initialData.cep || "",
    status: initialData.status || "Ativo",
    observacoes: initialData.observacoes || ""
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field) => (value) => {
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
    } else if (!validationRules.email(formData.email)) {
      // Email válido
    } else {
      newErrors.email = validationRules.email(formData.email);
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório";
    } else {
      const phoneError = validationRules.phone(formData.telefone);
      if (phoneError) {
        newErrors.telefone = phoneError;
      }
    }

    if (formData.cep && formData.cep.length > 0) {
      const cleanCep = formData.cep.replace(/\D/g, "");
      if (cleanCep.length !== 8) {
        newErrors.cep = "CEP deve ter 8 dígitos";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        empresa: "",
        cargo: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
        status: "Ativo",
        observacoes: ""
      });
    }
  };

  const isReadOnly = mode === "view";
  const title = mode === "create" ? "Novo Cliente" : 
                mode === "edit" ? "Editar Cliente" : "Visualizar Cliente";

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      className={styles.Dialog}
    >
      <DialogTitle className={styles.Title}>
        {title}
      </DialogTitle>
      
      <DialogContent className={styles.Content}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <ValidatedInput
              label="Nome Completo"
              value={formData.nome}
              onChange={handleInputChange("nome")}
              required
              disabled={isReadOnly}
              validationRules={[validationRules.minLength(2)]}
              placeholder="Digite o nome completo"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <ValidatedInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange("email")}
              required
              disabled={isReadOnly}
              validationRules={[validationRules.email]}
              placeholder="exemplo@email.com"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <ValidatedInput
              label="Telefone"
              value={formData.telefone}
              onChange={handleInputChange("telefone")}
              required
              disabled={isReadOnly}
              mask="phone"
              validationRules={[validationRules.phone]}
              placeholder="(11) 99999-9999"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <ValidatedInput
              label="Empresa"
              value={formData.empresa}
              onChange={handleInputChange("empresa")}
              disabled={isReadOnly}
              placeholder="Nome da empresa"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <ValidatedInput
              label="Cargo"
              value={formData.cargo}
              onChange={handleInputChange("cargo")}
              disabled={isReadOnly}
              placeholder="Cargo na empresa"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={isReadOnly}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleInputChange("status")(e.target.value)}
              >
                <MenuItem value="Ativo">Ativo</MenuItem>
                <MenuItem value="Inativo">Inativo</MenuItem>
                <MenuItem value="Prospect">Prospect</MenuItem>
                <MenuItem value="Lead">Lead</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <ValidatedInput
              label="Endereço"
              value={formData.endereco}
              onChange={handleInputChange("endereco")}
              disabled={isReadOnly}
              placeholder="Rua, número, complemento"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <ValidatedInput
              label="Cidade"
              value={formData.cidade}
              onChange={handleInputChange("cidade")}
              disabled={isReadOnly}
              placeholder="Nome da cidade"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <ValidatedInput
              label="Estado"
              value={formData.estado}
              onChange={handleInputChange("estado")}
              disabled={isReadOnly}
              validationRules={[validationRules.maxLength(2)]}
              placeholder="SP"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <ValidatedInput
              label="CEP"
              value={formData.cep}
              onChange={handleInputChange("cep")}
              disabled={isReadOnly}
              mask="cep"
              placeholder="00000-000"
            />
          </Grid>
          
          <Grid item xs={12}>
            <ValidatedInput
              label="Observações"
              value={formData.observacoes}
              onChange={handleInputChange("observacoes")}
              disabled={isReadOnly}
              multiline
              rows={3}
              placeholder="Observações adicionais sobre o cliente"
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions className={styles.Actions}>
        <Button onClick={onClose} color="secondary">
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

