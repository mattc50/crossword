import "./styles.css";

interface TextFieldProps {
  type: string;
  placeholder: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextField = ({ type = "text", placeholder, value, onChange }: TextFieldProps) => {
  return (
    <input
      className="text-field"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  )
}

export default TextField;