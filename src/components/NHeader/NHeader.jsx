import { Avatar, Badge, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { useState } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import { useNotification } from "../common/Notification/Notification";
import styles from "./NHeader.module.css";
import { NotificationsNone, Search, Logout, Person } from "@mui/icons-material";

export function NHeader({ pesquisar = true }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const { showSuccess } = useNotification();

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    showSuccess("Logout realizado com sucesso!");
    handleClose();
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <header className={styles.Header}>
      {pesquisar && (
        <div className={styles.Pesquisa}>
          <Search /> <span>Search</span>
        </div>
      )}
      <div className={styles.RightSection}>
        <div className={styles.Notifications}>
          <Badge color="primary" variant="dot">
            <NotificationsNone />
          </Badge>
        </div>
        <div className={styles.Profile} onClick={handleProfileClick}>
          <Avatar className={styles.ProfilePicture}>
            {getInitials(user?.username)}
          </Avatar>
          <span>{user?.username || "Usuário"}</span>
        </div>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleClose}>
            <Person sx={{ mr: 1 }} />
            <Typography variant="body2">
              {user?.email || "Sem email"}
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} />
            <Typography variant="body2">Sair</Typography>
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}
