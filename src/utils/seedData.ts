import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';

// --- Helpers de Geração Aleatória ---

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Lucas', 'Julia', 'Marcos', 'Fernanda', 'Gabriel', 'Larissa', 'Roberto', 'Patricia', 'Carlos', 'Beatriz'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro'];
const cities = [
    { nome: 'São Paulo', uf: 'SP' },
    { nome: 'Rio de Janeiro', uf: 'RJ' },
    { nome: 'Belo Horizonte', uf: 'MG' },
    { nome: 'Curitiba', uf: 'PR' },
    { nome: 'Salvador', uf: 'BA' },
    { nome: 'Brasília', uf: 'DF' },
    { nome: 'Porto Alegre', uf: 'RS' },
    { nome: 'Recife', uf: 'PE' }
];

const generateName = () => `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;

const generateCPF = () => {
    const n = () => getRandomInt(0, 9);
    return `${n()}${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}-${n()}${n()}`;
};

const generateCNPJ = () => {
    const n = () => getRandomInt(0, 9);
    return `${n()}${n()}.${n()}${n()}.${n()}${n()}.${n()}${n()}${n()}/0001-${n()}${n()}`;
};

const generatePhone = () => {
    return `(${getRandomInt(11, 99)}) 9${getRandomInt(1000, 9999)}-${getRandomInt(1000, 9999)}`;
};

const generateDate = (startYear: number, endYear: number) => {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
};

const supplierTypes = ['Operadora', 'Hotel', 'Companhia Aérea', 'Seguradora', 'Receptivo'];
const productCategories = ['Pacote', 'Aéreo', 'Hotel', 'Seguro', 'Cruzeiro', 'Passeio'];
const destinations = ['Disney', 'Paris', 'Cancun', 'Nova York', 'Roma', 'Lisboa', 'Buenos Aires', 'Santiago', 'Malditas', 'Tóquio'];

// --- Função Principal ---

export const seedTestData = async () => {
    try {
        toast.loading('Gerando dados aleatórios...');

        // 1. Criar Fornecedor Aleatório
        const fornecedorNome = `Fornecedor ${getRandomItem(lastNames)} ${getRandomItem(['Turismo', 'Viagens', 'Operadora', 'Resorts'])}`;
        const fornecedor = await supabaseService.fornecedores.create({
            nome: fornecedorNome,
            tipo: getRandomItem(supplierTypes),
            contato: generateName(),
            email: `contato@${fornecedorNome.toLowerCase().replace(/ /g, '')}.com`,
            telefone: generatePhone(),
            cnpj: generateCNPJ(),
            cidade: getRandomItem(cities).nome,
            estado: getRandomItem(cities).uf,
            observacoes: `Fornecedor gerado em ${new Date().toLocaleString()}`
        });
        console.log('Fornecedor criado:', fornecedor);

        // 2. Criar Produto Aleatório
        const destino = getRandomItem(destinations);
        const categoria = getRandomItem(productCategories);
        const produto = await supabaseService.produtos.create({
            nome: `${categoria} para ${destino} - Promoção`,
            categoria: categoria,
            descricao: `Incrível ${categoria.toLowerCase()} para ${destino} com condições especiais.`,
            preco: getRandomInt(1500, 15000),
            fornecedorId: fornecedor.id,
            observacoes: 'Produto gerado automaticamente.'
        });
        console.log('Produto criado:', produto);

        // 3. Criar Cliente Aleatório
        const clienteNome = generateName();
        const clienteCity = getRandomItem(cities);
        const cliente = await supabaseService.clientes.create({
            nome: clienteNome,
            email: `${clienteNome.toLowerCase().replace(/ /g, '.')}@email.com`,
            telefone: generatePhone(),
            cpf: generateCPF(),
            dataNascimento: generateDate(1960, 2000),
            cidade: clienteCity.nome,
            estado: clienteCity.uf,
            status: getRandomItem(['Ativo', 'Ativo', 'Ativo', 'Inativo']), // Mais chance de ser Ativo
            observacoes: 'Cliente interessado em viagens internacionais.'
        });
        console.log('Cliente criado:', cliente);

        // 4. Criar Dependente (50% de chance)
        if (Math.random() > 0.5) {
            await supabaseService.dependentes.create({
                clienteId: cliente.id,
                nome: `${getRandomItem(firstNames)} ${clienteNome.split(' ').pop()}`, // Mesmo sobrenome
                parentesco: getRandomItem(['Filho(a)', 'Cônjuge', 'Pai/Mãe']),
                dataNascimento: generateDate(2010, 2023)
            });
        }

        // 5. Criar Cotação
        const dataViagem = generateDate(2025, 2026);
        const valorTotal = produto.preco * getRandomInt(1, 4);
        const percentual = getRandomInt(5, 15);
        const comissao = (valorTotal * percentual) / 100;

        await supabaseService.cotacoes.create({
            clienteId: cliente.id,
            dataViagem: dataViagem,
            dataRetorno: dataViagem,
            numeroPassageiros: getRandomInt(1, 5),
            valorTotal: valorTotal,
            status: getRandomItem(['Pendente', 'Em Análise', 'Aprovada', 'Rejeitada']),
            observacoes: `Interesse em ${destino}`,
            percentualComissao: percentual,
            comissao: comissao
        });

        // 6. Criar Item na Agenda (para hoje ou futuro próximo)
        const agendaDate = new Date();
        agendaDate.setDate(agendaDate.getDate() + getRandomInt(0, 7)); // Hoje até +7 dias

        await supabaseService.agenda.create({
            titulo: `Reunião com ${clienteNome.split(' ')[0]}`,
            descricao: `Discutir detalhes da viagem para ${destino}.`,
            data: agendaDate.toISOString().split('T')[0],
            hora: `${getRandomInt(9, 18)}:00`,
            status: 'Pendente',
            observacoes: 'Gerado automaticamente.'
        });

        toast.dismiss();
        toast.success('Dados aleatórios gerados com sucesso!');

        // Recarregar a página
        setTimeout(() => {
            window.location.reload();
        }, 1500);

    } catch (error: any) {
        console.error('Erro ao gerar dados:', error);
        toast.dismiss();
        toast.error(`Erro ao gerar dados: ${error.message || 'Verifique o console'}`);
    }
};
