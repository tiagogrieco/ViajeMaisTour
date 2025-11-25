import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const clearDatabase = async () => {
    try {
        toast.loading('Limpando banco de dados...');

        // Delete in order to respect Foreign Key constraints

        // 1. Agenda (pode estar ligada a clientes)
        const { error: errorAgenda } = await supabase.from('agenda').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (errorAgenda) throw errorAgenda;

        // 2. Cotações (ligada a clientes e produtos)
        const { error: errorCotacoes } = await supabase.from('cotacoes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (errorCotacoes) throw errorCotacoes;

        // 3. Dependentes (ligada a clientes)
        const { error: errorDependentes } = await supabase.from('dependentes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (errorDependentes) throw errorDependentes;

        // 4. Produtos (ligada a fornecedores)
        const { error: errorProdutos } = await supabase.from('produtos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (errorProdutos) throw errorProdutos;

        // 5. Clientes
        const { error: errorClientes } = await supabase.from('clientes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (errorClientes) throw errorClientes;

        // 6. Fornecedores
        const { error: errorFornecedores } = await supabase.from('fornecedores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (errorFornecedores) throw errorFornecedores;

        toast.dismiss();
        toast.success('Banco de dados limpo com sucesso!');

        // Reload to reflect empty state
        setTimeout(() => {
            window.location.reload();
        }, 1500);

    } catch (error: any) {
        console.error('Erro ao limpar banco de dados:', error);
        toast.dismiss();
        toast.error(`Erro ao limpar dados: ${error.message || 'Erro desconhecido'}`);
    }
};
