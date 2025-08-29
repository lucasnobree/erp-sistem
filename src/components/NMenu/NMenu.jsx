import List from "@mui/material/List";
import styles from "./NMenu.module.css";
import { NItemMenu } from "../NItemMenu/NItemMenu";
import { AutoAwesomeMotion, CalendarToday, Dashboard, Group } from "@mui/icons-material";

const menuItems = [
  { id: "dashboard", icon: <Dashboard />, name: "Dashboards", route: "/Dashboard" },
  { id: "clients", icon: <AutoAwesomeMotion />, name: "Clientes", route: "/Clients" },
  { id: "events", icon: <CalendarToday />, name: "Atividades", route: "/Kanaban" },
  { id: "team", icon: <Group />, name: "Grupo", route: "/Group" },
];

export function NMenu() {
  return (
    <div className={styles.General}>
      <List className={styles.Drawer}>
        <div className={styles.Icon}>
          DN
        </div>
        {menuItems.map((item) => (
          <NItemMenu
            key={item.id}
            icon={item.icon}
            name={item.name}
            route={item.route}
          />
        ))}
      </List>
    </div>
  );
}
