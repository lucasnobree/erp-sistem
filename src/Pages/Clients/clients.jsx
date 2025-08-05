import { NMenu } from "../../components/NMenu/NMenu";
import { NSubMenu } from "../../components/NSubmenu/NSubMenu";
import styles from "./clients.module.css";

export default function Clientes() {
  return (
    <div className={styles.Desktop}>
      <NMenu />
      <NSubMenu nomeTela={"Clientes"} />
    </div>
  );
}
