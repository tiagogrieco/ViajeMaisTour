import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';

export const seedTestData = async () => {
    try {
        toast.loading('Gerando dados de teste...');

        // 1. Criar Fornecedor
        const fornecedor = await supabaseService.fornecedores.create({
            nome: 'Fornecedor Teste Ltda',
            tipo: 'Operadora',
            contato: 'João Silva',
            email: 'contato@fornecedorteste.com',
            telefone: '(11) 99999-9999',
            cnpj: '00.000.000/0001-00',
            cidade: 'São Paulo',
            estado: 'SP',
            observacoes: 'Fornecedor criado automaticamente para testes.'
        });
        console.log('Fornecedor criado:', fornecedor);

        // 2. Criar Produto
        const produto = await supabaseService.produtos.create({
            nome: 'Pacote Teste Disney',
            categoria: 'Pacote',
            descricao: 'Pacote completo para Disney com aéreo e hotel.',
            preco: 5000.00,
            fornecedorId: fornecedor.id,
            observacoes: 'Produto de teste.'
        });
        console.log('Produto criado:', produto);

        // 3. Criar Cliente
        const cliente = await supabaseService.clientes.create({
            nome: 'Cliente Teste da Silva',
            email: 'cliente.teste@email.com',
            telefone: '(11) 98888-8888',
            cpf: '111.111.111-11',
            dataNascimento: '1990-01-01',
            cidade: 'Rio de Janeiro',
            estado: 'RJ',
            status: 'Ativo',
            observacoes: 'Cliente gerado para testes.'
        });
        console.log('Cliente criado:', cliente);

        // 4. Criar Dependente
        await supabaseService.dependentes.create({
            clienteId: cliente.id,
            nome: 'Filho Teste da Silva',
            parentesco: 'Filho',
            dataNascimento: '2015-05-05'
        });

        // 5. Criar Cotação
        await supabaseService.cotacoes.create({
            clienteId: cliente.id,
            dataViagem: '2025-12-25',
            dataRetorno: '2026-01-05',
            numeroPassageiros: 2,
            valorTotal: 10000.00,
            status: 'Pendente',
            observacoes: 'Cotação de teste.'
        });

        // 6. Criar Item na Agenda
        await supabaseService.agenda.create({
            titulo: 'Reunião com Cliente Teste',
            descricao: 'Apresentar proposta Disney.',
            data: new Date().toISOString().split('T')[0], // Hoje
            hora: '14:00',
            status: 'Pendente',
            observacoes: 'Agendamento automático.'
        });

        toast.dismiss();
        toast.success('Dados de teste gerados com sucesso!');

        // Recarregar a página para atualizar os dados (simples e eficaz)
        setTimeout(() => {
            window.location.reload();
        }, 1500);

    } catch (error) {
        console.error('Erro ao gerar dados de teste:', error);
        toast.dismiss();
        toast.error('Erro ao gerar dados. Verifique o console.');
    }
};
