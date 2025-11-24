// Formatação de CPF
export const formatCPF = (cpf: string): string => {
  const numericCPF = cpf.replace(/\D/g, '');
  return numericCPF
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

// Formatação de CNPJ
export const formatCNPJ = (cnpj: string): string => {
  const numericCNPJ = cnpj.replace(/\D/g, '');
  return numericCNPJ
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

// Formatação de telefone
export const formatPhone = (phone: string): string => {
  const numericPhone = phone.replace(/\D/g, '');
  if (numericPhone.length <= 10) {
    return numericPhone
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  } else {
    return numericPhone
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }
};

// Formatação de CEP
export const formatCEP = (cep: string): string => {
  const numericCEP = cep.replace(/\D/g, '');
  return numericCEP
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

// Formatação de moeda
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Formatação de data
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
};

// Formatação de hora
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  // Se já está no formato HH:MM, retorna como está
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  // Se é um timestamp ou data completa, extrai a hora
  try {
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } catch {
    // Se falhar, retorna o valor original
  }
  
  return timeString;
};

// Validação de CPF
export const isValidCPF = (cpf: string): boolean => {
  const numericCPF = cpf.replace(/\D/g, '');
  
  if (numericCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(numericCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numericCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numericCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numericCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numericCPF.charAt(10))) return false;
  
  return true;
};

// Validação de CNPJ
export const isValidCNPJ = (cnpj: string): boolean => {
  const numericCNPJ = cnpj.replace(/\D/g, '');
  
  if (numericCNPJ.length !== 14) return false;
  if (/^(\d)\1+$/.test(numericCNPJ)) return false;
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numericCNPJ.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (digit1 !== parseInt(numericCNPJ.charAt(12))) return false;
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numericCNPJ.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return digit2 === parseInt(numericCNPJ.charAt(13));
};

// Validação de email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Formatação de número de telefone para exibição
export const formatPhoneDisplay = (phone: string): string => {
  if (!phone) return '';
  const numericPhone = phone.replace(/\D/g, '');
  
  if (numericPhone.length === 10) {
    return `(${numericPhone.slice(0, 2)}) ${numericPhone.slice(2, 6)}-${numericPhone.slice(6)}`;
  } else if (numericPhone.length === 11) {
    return `(${numericPhone.slice(0, 2)}) ${numericPhone.slice(2, 7)}-${numericPhone.slice(7)}`;
  }
  
  return phone;
};

// Remover formatação de strings
export const removeFormatting = (value: string): string => {
  return value.replace(/\D/g, '');
};