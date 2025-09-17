import { Avatar, Badge } from "@mui/material";
import styles from "./NHeader.module.css";
import { NotificationsNone, Search } from "@mui/icons-material";

export function NHeader({ profileName = "Nome Da Pessoa", pesquisar = true }) {
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
        <div className={styles.Profile}>
          <Avatar className={styles.ProfilePicture}>N</Avatar>
          <span>{profileName}</span>
        </div>
      </div>
    </header>
  );
}
