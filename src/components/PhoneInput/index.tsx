import React, { useState } from "react";
import { CountryCode } from "libphonenumber-js";
import TextField from "../TextFields/TextField";
import Select from "../TextFields/Select";
import "./styles.css";

interface Country {
  code: CountryCode;
  name: string;
  dialCode: string;
  format: string;
  regex: RegExp;
}

const countries: Country[] = [
  { code: "US", name: "🇺🇸", dialCode: "+1", format: "(000) 000-0000", regex: /^\(\d{3}\) \d{3}-\d{4}$/ },
  { code: "GB", name: "🇬🇧", dialCode: "+44", format: "00000 000000", regex: /^\d{5} \d{6}$/ },
  { code: "CA", name: "🇨🇦", dialCode: "+1", format: "(000) 000-0000", regex: /^\(\d{3}\) \d{3}-\d{4}$/ },
  { code: "AU", name: "🇦🇺", dialCode: "+61", format: "0000 000 000", regex: /^\d{4} \d{3} \d{3}$/ },
  // Add more countries as needed
];

interface PhoneInputProps {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  showCountryDropdown?: boolean;
}

const formatPhoneNumber = (digits: string, format: string) => {
  let formatted = "";
  let digitIndex = 0;

  for (let i = 0; i < format.length; i++) {
    if (format[i] === "0") {
      if (digitIndex < digits.length) {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        break; // Stop if no more digits
      }
    } else {
      if (digitIndex < digits.length) {
        formatted += format[i]; // Add the format character
      } else {
        break;
      }
    }
  }

  return formatted;
}

const PhoneInput = ({ showCountryDropdown = true, value, setValue }: PhoneInputProps) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [displayValue, setDisplayValue] = useState(value);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = countries.find((c) => c.code === e.target.value);
    if (country) {
      setSelectedCountry(country);

      // Reset the phone number when the country changes
      setValue(country.dialCode); // Start with the new country's dial code
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, ""); // Remove non-digits
    const formatted = formatPhoneNumber(rawDigits, selectedCountry.format);
    setDisplayValue(formatted);
    setValue(`${selectedCountry.dialCode}${rawDigits}`);
  }

  return (
    <div className="phone-input-container">
      {showCountryDropdown && (
        <Select
          value={selectedCountry.code}
          onChange={handleCountryChange}
        >
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name} {country.dialCode}
            </option>
          ))}
        </Select>
      )}

      <TextField
        type="tel"
        placeholder={selectedCountry.format}
        value={displayValue.startsWith(selectedCountry.dialCode)
          ? displayValue.replace(selectedCountry.dialCode, "").trim()
          : displayValue}
        onChange={handlePhoneNumberChange}
      />
    </div>
  )
}


export default PhoneInput;