import { Avatar, Badge } from "@mui/material";
import styles from "./NHeader.module.css";
import { NotificationsNone, Search } from "@mui/icons-material";

export function NHeader({ profileName }) {
  return (
    (profileName = "Nome Da Pessoa"),
    (
      <header className={styles.Header}>
        <div className={styles.Pesquisa}>
          <Search /> <span>Search</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div className={styles.Notifications}>
            <Badge color="primary" variant="dot"> {/* //invisible={} */} 
              <NotificationsNone />
            </Badge>
          </div>
          <div className={styles.Profile}>
            <Avatar className={styles.ProfilePicture}> N </Avatar>
            <span>{profileName}</span>
          </div>
        </div>
      </header>
    )
  );
}
