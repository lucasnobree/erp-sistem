import { NavLink } from "react-router";
import styles from "./NItemMenu.module.css";

export function NItemMenu({ icon, name, route }) {
  return (
    <NavLink
      to={route}
      className={({ isActive }) =>
        `${styles.listItem} ${isActive && route != null ? styles.active : ""}`
      }
    >
      {icon && <div className={styles.listItemIcon}>{icon}</div>}{" "}
      <div className={styles.listItemText}>{name}</div>
    </NavLink>
  );
}
