import {
  FormControl,
  FormHelperText,
  FormLabel,
  OutlinedInput,
} from "@mui/material";
import { ChangeEvent, InputHTMLAttributes } from "react";

type Props = {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  disabled?: boolean;
};

export function CarFormInput({
  id,
  name,
  type,
  label,
  error,
  value,
  disabled,
  onChange,
  inputProps,
}: Props) {
  const helperId = `${id}-helper`;

  return (
    <FormControl fullWidth required error={Boolean(error)} disabled={disabled}>
      <FormLabel htmlFor={id} sx={{ mb: 0.5, color: "text.primary" }}>
        {label}
      </FormLabel>
      <OutlinedInput
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        inputProps={{ "aria-describedby": helperId, ...inputProps }}
      />
      <FormHelperText id={helperId}>{error ?? " "}</FormHelperText>
    </FormControl>
  );
}
