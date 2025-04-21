import "./styles.css";
import { ExpandMore } from "@mui/icons-material";

interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}

const Select = ({ value, onChange, children }: SelectProps) => {
  return (
    <div className="select-container">
      <select className="text-field select"
        value={value}
        onChange={onChange}>
        {children}
      </select>
      <div className="select-icon">
        <ExpandMore />
      </div>
    </div>
  )
}

export default Select;