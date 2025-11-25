import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormattedInputProps {
  label: string;
  type: 'text' | 'email' | 'number' | 'cpf' | 'cnpj' | 'phone' | 'cep' | 'date' | 'time' | 'datetime-local';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const FormattedInput: React.FC<FormattedInputProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
}) => {
  const formatValue = (inputValue: string, inputType: string): string => {
    if (!inputValue) return '';
    
    const numericValue = inputValue.replace(/\D/g, '');
    
    switch (inputType) {
      case 'cpf':
        return numericValue
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})/, '$1-$2')
          .replace(/(-\d{2})\d+?$/, '$1');
      
      case 'cnpj':
        return numericValue
          .replace(/(\d{2})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1/$2')
          .replace(/(\d{4})(\d{1,2})/, '$1-$2')
          .replace(/(-\d{2})\d+?$/, '$1');
      
      case 'phone':
        if (numericValue.length <= 10) {
          return numericValue
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
        } else {
          return numericValue
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
        }
      
      case 'cep':
        return numericValue
          .replace(/(\d{5})(\d)/, '$1-$2')
          .replace(/(-\d{3})\d+?$/, '$1');
      
      default:
        return inputValue;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (['cpf', 'cnpj', 'phone', 'cep'].includes(type)) {
      const formatted = formatValue(inputValue, type);
      onChange(formatted);
    } else {
      onChange(inputValue);
    }
  };

  const getInputType = () => {
    switch (type) {
      case 'email':
        return 'email';
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'time':
        return 'time';
      case 'datetime-local':
        return 'datetime-local';
      default:
        return 'text';
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={label.toLowerCase().replace(/\s+/g, '-')}
        type={getInputType()}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
    </div>
  );
};