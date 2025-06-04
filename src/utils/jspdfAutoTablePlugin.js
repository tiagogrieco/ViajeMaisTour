// src/utils/jspdfAutoTablePlugin.js

// IMPORTANTE: Este arquivo deve ser importado APENAS ONDE VOCÊ USA JAVASCRIPT para gerar o PDF.
// Ele garante que o jsPDF-Autotable seja carregado e adicione suas funcionalidades
// ao protótipo do jsPDF.

// A ordem importa: jsPDF precisa estar disponível globalmente ou ser o primeiro a ser importado.
// A importação de 'jspdf-autotable' aqui garante que ele execute seu código
// de extensão no jsPDF.
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Opcional: Você pode exportar jsPDF aqui se quiser que outros módulos o importem deste local.
export default jsPDF;