import { useState, useEffect } from "react";
import { TextField, FormHelperText } from "@mui/material";
import styles from "./ValidatedInput.module.css";

/**
 * Componente de input com validação integrada
 * @param {string} label - Label do campo
 * @param {string} type - Tipo do input (text, email, tel, number, date, etc.)
 * @param {string} value - Valor atual do campo
 * @param {function} onChange - Função chamada quando o valor muda
 * @param {Array} validationRules - Array de regras de validação
 * @param {boolean} required - Se o campo é obrigatório
 * @param {string} placeholder - Placeholder do campo
 * @param {boolean} disabled - Se o campo está desabilitado
 * @param {string} mask - Máscara para formatação (phone, cpf, cnpj, cep)
 * @param {object} ...props - Outras props do TextField
 */
export function ValidatedInput({
  label,
  type = "text",
  value,
  onChange,
  validationRules = [],
  required = false,
  placeholder,
  disabled = false,
  mask,
  ...props
}) {
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  // Função para aplicar máscaras
  const applyMask = (inputValue, maskType) => {
    if (!maskType || !inputValue) return inputValue;

    const cleanValue = inputValue.replace(/\D/g, "");

    switch (maskType) {
      case "phone":
        if (cleanValue.length <= 10) {
          return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
        } else {
          return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        }
      case "cpf":
        return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      case "cnpj":
        return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
      case "cep":
        return cleanValue.replace(/(\d{5})(\d{3})/, "$1-$2");
      case "date":
        return cleanValue.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
      default:
        return inputValue;
    }
  };

  // Função para validar o campo
  const validateField = (fieldValue) => {
    if (required && (!fieldValue || fieldValue.trim() === "")) {
      return "Este campo é obrigatório";
    }

    for (const rule of validationRules) {
      const errorMessage = rule(fieldValue);
      if (errorMessage) {
        return errorMessage;
      }
    }

    return "";
  };

  // Validação em tempo real
  useEffect(() => {
    if (touched) {
      const errorMessage = validateField(value);
      setError(errorMessage);
    }
  }, [value, touched, required, validationRules]);

  const handleChange = (event) => {
    let newValue = event.target.value;

    // Aplicar máscara se especificada
    if (mask) {
      newValue = applyMask(newValue, mask);
    }

    // Validações específicas por tipo
    if (type === "number") {
      newValue = newValue.replace(/[^0-9]/g, "");
    }

    onChange(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <div className={styles.Container}>
      <TextField
        label={label}
        type={type === "number" ? "text" : type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        error={touched && !!error}
        fullWidth
        variant="outlined"
        className={styles.TextField}
        {...props}
      />
      {touched && error && (
        <FormHelperText error className={styles.ErrorText}>
          {error}
        </FormHelperText>
      )}
    </div>
  );
}

// Funções de validação pré-definidas
export const validationRules = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value) ? "Email inválido" : "";
  },
  
  phone: (value) => {
    const cleanValue = value?.replace(/\D/g, "");
    return cleanValue && (cleanValue.length < 10 || cleanValue.length > 11) 
      ? "Telefone deve ter 10 ou 11 dígitos" : "";
  },
  
  cpf: (value) => {
    const cleanValue = value?.replace(/\D/g, "");
    return cleanValue && cleanValue.length !== 11 ? "CPF deve ter 11 dígitos" : "";
  },
  
  cnpj: (value) => {
    const cleanValue = value?.replace(/\D/g, "");
    return cleanValue && cleanValue.length !== 14 ? "CNPJ deve ter 14 dígitos" : "";
  },
  
  minLength: (min) => (value) => {
    return value && value.length < min ? `Mínimo de ${min} caracteres` : "";
  },
  
  maxLength: (max) => (value) => {
    return value && value.length > max ? `Máximo de ${max} caracteres` : "";
  },
  
  onlyNumbers: (value) => {
    return value && !/^\d+$/.test(value) ? "Apenas números são permitidos" : "";
  },
  
  onlyLetters: (value) => {
    return value && !/^[a-zA-ZÀ-ÿ\s]+$/.test(value) ? "Apenas letras são permitidas" : "";
  }
};

