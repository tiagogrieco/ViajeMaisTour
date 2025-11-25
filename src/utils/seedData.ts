import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';

// --- Helpers de Geração Aleatória ---

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Lucas', 'Julia', 'Marcos', 'Fernanda', 'Gabriel', 'Larissa', 'Roberto', 'Patricia', 'Carlos', 'Beatriz', 'Rafael', 'Camila', 'Bruno', 'Amanda'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Araújo'];
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

// Gera data relativa ao dia de hoje (dias negativos = passado, positivos = futuro)
const generateRelativeDate = (minDays: number, maxDays: number) => {
    const today = new Date();
    const daysOffset = getRandomInt(minDays, maxDays);
    const date = new Date(today);
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
};

const supplierTypes = ['Operadora', 'Hotel', 'Companhia Aérea', 'Seguradora', 'Receptivo'];
const productCategories = ['Pacote', 'Aéreo', 'Hotel', 'Seguro', 'Cruzeiro', 'Passeio'];
const destinations = ['Disney', 'Paris', 'Cancun', 'Nova York', 'Roma', 'Lisboa', 'Buenos Aires', 'Santiago', 'Maldivas', 'Tóquio', 'Dubai', 'Londres'];

// --- Função Principal ---

export const seedTestData = async () => {
    try {
        toast.loading('Gerando 10 registros completos...');

        const RECORDS_COUNT = 10;

        for (let i = 0; i < RECORDS_COUNT; i++) {
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
                status: getRandomItem(['Ativo', 'Ativo', 'Ativo', 'Inativo']),
                observacoes: 'Cliente interessado em viagens internacionais.'
            });

            // 4. Criar Dependente (50% de chance)
            if (Math.random() > 0.5) {
                await supabaseService.dependentes.create({
                    clienteId: cliente.id,
                    nome: `${getRandomItem(firstNames)} ${clienteNome.split(' ').pop()}`,
                    parentesco: getRandomItem(['Filho(a)', 'Cônjuge', 'Pai/Mãe']),
                    dataNascimento: generateDate(2010, 2023)
                });
            }

            // 5. Criar Cotação com datas variadas (passado, presente, futuro)
            // Distribuir: 60% passado (histórico), 20% presente/próximo, 20% futuro
            let dataViagem: string;
            let cotacaoStatus: string;
            const rand = Math.random();

            if (rand < 0.6) {
                // Passado (-365 a -7 dias) - Histórico de 1 ano
                dataViagem = generateRelativeDate(-365, -7);
                cotacaoStatus = getRandomItem(['Finalizada', 'Finalizada', 'Finalizada', 'Aprovada']); // Maioria finalizada
            } else if (rand < 0.8) {
                // Presente/Próximo (-7 a +30 dias)
                dataViagem = generateRelativeDate(-7, 30);
                cotacaoStatus = getRandomItem(['Pendente', 'Em Análise', 'Aprovada', 'Finalizada']);
            } else {
                // Futuro (+30 a +180 dias)
                dataViagem = generateRelativeDate(30, 180);
                cotacaoStatus = getRandomItem(['Pendente', 'Em Análise', 'Aprovada']);
            }

            const valorTotal = produto.preco * getRandomInt(1, 4);
            const percentual = getRandomInt(5, 15);
            const comissao = (valorTotal * percentual) / 100;

            await supabaseService.cotacoes.create({
                clienteId: cliente.id,
                dataViagem: dataViagem,
                dataRetorno: dataViagem,
                numeroPassageiros: getRandomInt(1, 5),
                valorTotal: valorTotal,
                status: cotacaoStatus,
                observacoes: `Interesse em ${destino}`,
                percentualComissao: percentual,
                comissao: comissao
            });

            // 6. Criar Eventos na Agenda com datas variadas
            const eventRand = Math.random();
            let agendaDate: string;
            let agendaStatus: string;

            if (eventRand < 0.2) {
                // Passado (-30 a -1 dias)
                agendaDate = generateRelativeDate(-30, -1);
                agendaStatus = getRandomItem(['Concluído', 'Cancelado']);
            } else if (eventRand < 0.5) {
                // Hoje e próximos dias (0 a +7 dias)
                agendaDate = generateRelativeDate(0, 7);
                agendaStatus = getRandomItem(['Agendado', 'Confirmado', 'Pendente']);
            } else {
                // Futuro (+7 a +60 dias)
                agendaDate = generateRelativeDate(7, 60);
                agendaStatus = getRandomItem(['Agendado', 'Pendente']);
            }

            const eventTypes = [
                { titulo: `Check-in: ${destino}`, descricao: `Check-in do cliente ${clienteNome} para viagem a ${destino}` },
                { titulo: `Check-out: ${destino}`, descricao: `Check-out do cliente ${clienteNome} retornando de ${destino}` },
                { titulo: `Viagem: ${destino}`, descricao: `Início da viagem de ${clienteNome} para ${destino}` },
                { titulo: `Reunião - Fechamento ${destino}`, descricao: `Reunião para fechar pacote de viagem para ${destino} com ${clienteNome}` },
                { titulo: `Atendimento: ${clienteNome}`, descricao: `Atendimento inicial para apresentar opções de viagem` }
            ];

            const selectedEvent = getRandomItem(eventTypes);

            await supabaseService.agenda.create({
                titulo: selectedEvent.titulo,
                descricao: selectedEvent.descricao,
                data: agendaDate,
                hora: `${getRandomInt(9, 18)}:00`,
                local: getRandomItem(['Escritório', 'Online - Zoom', 'Online - Meet', 'Aeroporto', '']),
                cliente: clienteNome,
                status: agendaStatus,
                observacoes: 'Gerado automaticamente.'
            });

            // Atualizar toast com progresso
            toast.loading(`Gerando registros... ${i + 1}/${RECORDS_COUNT}`);
        }

        toast.dismiss();
        toast.success(`${RECORDS_COUNT} registros completos gerados com sucesso!`);

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
