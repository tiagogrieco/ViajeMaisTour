import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { supabaseService } from '@/services/supabaseService';
import { Cliente, Dependente, Fornecedor, Produto, Cotacao, AgendaItem } from '@/types';
import { toast } from 'sonner';

// --- CLIENTES ---
export function useClientes(page = 1, limit = 10, search = '', status = 'all') {
    return useQuery({
        queryKey: ['clientes', page, limit, search, status],
        queryFn: () => supabaseService.clientes.list(page, limit, search, status),
        placeholderData: keepPreviousData,
    });
}

export function useClienteMutations() {
    const queryClient = useQueryClient();

    const create = useMutation({
        mutationFn: supabaseService.clientes.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            toast.success('Cliente criado com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao criar cliente');
        }
    });

    const update = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Cliente> }) =>
            supabaseService.clientes.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            toast.success('Cliente atualizado com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao atualizar cliente');
        }
    });

    const remove = useMutation({
        mutationFn: supabaseService.clientes.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            toast.success('Cliente removido com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao remover cliente');
        }
    });

    return { create, update, remove };
}

// --- DEPENDENTES ---
export function useDependentes() {
    return useQuery({
        queryKey: ['dependentes'],
        queryFn: supabaseService.dependentes.list,
    });
}

export function useDependenteMutations() {
    const queryClient = useQueryClient();

    const create = useMutation({
        mutationFn: supabaseService.dependentes.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dependentes'] });
            toast.success('Dependente adicionado com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao adicionar dependente');
        }
    });

    const update = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Dependente> }) =>
            supabaseService.dependentes.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dependentes'] });
            toast.success('Dependente atualizado com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao atualizar dependente');
        }
    });

    const remove = useMutation({
        mutationFn: supabaseService.dependentes.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dependentes'] });
            toast.success('Dependente removido com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao remover dependente');
        }
    });

    return { create, update, remove };
}

// --- FORNECEDORES ---
export function useFornecedores() {
    return useQuery({
        queryKey: ['fornecedores'],
        queryFn: supabaseService.fornecedores.list,
    });
}

export function useFornecedorMutations() {
    const queryClient = useQueryClient();

    const create = useMutation({
        mutationFn: supabaseService.fornecedores.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
            toast.success('Fornecedor criado com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao criar fornecedor');
        }
    });

    const update = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Fornecedor> }) =>
            supabaseService.fornecedores.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
            toast.success('Fornecedor atualizado com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao atualizar fornecedor');
        }
    });

    const remove = useMutation({
        mutationFn: supabaseService.fornecedores.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
            toast.success('Fornecedor removido com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao remover fornecedor');
        }
    });

    return { create, update, remove };
}

// --- PRODUTOS ---
export function useProdutos() {
    return useQuery({
        queryKey: ['produtos'],
        queryFn: supabaseService.produtos.list,
    });
}

export function useProdutoMutations() {
    const queryClient = useQueryClient();

    const create = useMutation({
        mutationFn: supabaseService.produtos.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['produtos'] });
            toast.success('Produto criado com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao criar produto');
        }
    });

    const update = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Produto> }) =>
            supabaseService.produtos.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['produtos'] });
            toast.success('Produto atualizado com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao atualizar produto');
        }
    });

    const remove = useMutation({
        mutationFn: supabaseService.produtos.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['produtos'] });
            toast.success('Produto removido com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao remover produto');
        }
    });

    return { create, update, remove };
}

// --- COTAÇÕES ---
export function useCotacoes() {
    return useQuery({
        queryKey: ['cotacoes'],
        queryFn: supabaseService.cotacoes.list,
    });
}

export function useCotacaoMutations() {
    const queryClient = useQueryClient();

    const create = useMutation({
        mutationFn: supabaseService.cotacoes.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cotacoes'] });
            toast.success('Cotação criada com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao criar cotação');
        }
    });

    const update = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Cotacao> }) =>
            supabaseService.cotacoes.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cotacoes'] });
            toast.success('Cotação atualizada com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao atualizar cotação');
        }
    });

    const remove = useMutation({
        mutationFn: supabaseService.cotacoes.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cotacoes'] });
            toast.success('Cotação removida com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao remover cotação');
        }
    });

    return { create, update, remove };
}

// --- AGENDA ---
export function useAgenda() {
    return useQuery({
        queryKey: ['agenda'],
        queryFn: supabaseService.agenda.list,
    });
}

export function useAgendaMutations() {
    const queryClient = useQueryClient();

    const create = useMutation({
        mutationFn: supabaseService.agenda.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agenda'] });
            toast.success('Agendamento criado com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao criar agendamento');
        }
    });

    const update = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<AgendaItem> }) =>
            supabaseService.agenda.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agenda'] });
            toast.success('Agendamento atualizado com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao atualizar agendamento');
        }
    });

    const remove = useMutation({
        mutationFn: supabaseService.agenda.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agenda'] });
            toast.success('Agendamento removido com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Erro ao remover agendamento');
        }
    });

    return { create, update, remove };
}
