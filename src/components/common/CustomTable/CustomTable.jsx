import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box
} from "@mui/material";
import { MoreVert, Edit, Delete, Visibility } from "@mui/icons-material";
import { useState } from "react";
import styles from "./CustomTable.module.css";

/**
 * Componente de tabela reutilizável e customizável
 * @param {Array} columns - Array de objetos com configuração das colunas
 * @param {Array} data - Array de dados para exibir na tabela
 * @param {boolean} selectable - Se permite seleção de linhas
 * @param {Array} selectedRows - Array de IDs das linhas selecionadas
 * @param {function} onSelectionChange - Função chamada quando seleção muda
 * @param {function} onEdit - Função chamada ao editar uma linha
 * @param {function} onDelete - Função chamada ao deletar uma linha
 * @param {function} onView - Função chamada ao visualizar uma linha
 * @param {boolean} showActions - Se deve mostrar coluna de ações
 */
export function CustomTable({
  columns = [],
  data = [],
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onEdit,
  onDelete,
  onView,
  showActions = true
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const handleMenuClick = (event, rowId) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowId(rowId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = data.map(row => row.id);
      onSelectionChange?.(allIds);
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (rowId) => {
    const newSelection = selectedRows.includes(rowId)
      ? selectedRows.filter(id => id !== rowId)
      : [...selectedRows, rowId];
    onSelectionChange?.(newSelection);
  };

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  return (
    <TableContainer component={Paper} className={styles.Container}>
      <Table className={styles.Table}>
        <TableHead>
          <TableRow>
            {selectable && (
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={isIndeterminate}
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </TableCell>
            )}
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                className={styles.HeaderCell}
              >
                {column.label}
              </TableCell>
            ))}
            {showActions && (
              <TableCell align="center" className={styles.HeaderCell}>
                Ações
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length + (selectable ? 1 : 0) + (showActions ? 1 : 0)}
                align="center"
                className={styles.EmptyCell}
              >
                <Typography variant="body2" color="textSecondary">
                  Nenhum dado encontrado
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={row.id}
                className={styles.Row}
                selected={selectedRows.includes(row.id)}
              >
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    className={styles.Cell}
                  >
                    {column.render ? column.render(row[column.id], row) : row[column.id]}
                  </TableCell>
                ))}
                {showActions && (
                  <TableCell align="center" className={styles.Cell}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, row.id)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {onView && (
          <MenuItem onClick={() => { onView(selectedRowId); handleMenuClose(); }}>
            <Visibility fontSize="small" style={{ marginRight: 8 }} />
            Visualizar
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem onClick={() => { onEdit(selectedRowId); handleMenuClose(); }}>
            <Edit fontSize="small" style={{ marginRight: 8 }} />
            Editar
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem onClick={() => { onDelete(selectedRowId); handleMenuClose(); }}>
            <Delete fontSize="small" style={{ marginRight: 8 }} />
            Excluir
          </MenuItem>
        )}
      </Menu>
    </TableContainer>
  );
}

