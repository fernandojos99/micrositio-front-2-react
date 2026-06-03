import apiClient from '../apiClient';
import { TestingCardPlaybook, CreateTestingCardPlaybookData } from '../types/testingCardPlaybook';

const BASE_URL = import.meta.env.VITE_API_URL || '';

class TestingCardPlaybookService {
  async listarTodos(): Promise<TestingCardPlaybook[]> {
    const response = await apiClient.get(`${BASE_URL}/testing-cards-playbook`);
    return response.data.data;
  }

  async obtenerPorPagina(pagina: number): Promise<TestingCardPlaybook | null> {
    const response = await apiClient.get(`${BASE_URL}/testing-cards-playbook/por-pagina`, {
      params: { pagina }
    });
    return response.data.data;
  }

  async buscarPorCampo(campo: string): Promise<TestingCardPlaybook[]> {
    const response = await apiClient.get(`${BASE_URL}/testing-cards-playbook/buscar`, {
      params: { campo }
    });
    return response.data.data;
  }

  async buscarPorTipo(tipo: string): Promise<TestingCardPlaybook[]> {
    const response = await apiClient.get(`${BASE_URL}/testing-cards-playbook/buscar-tipo`, {
      params: { tipo }
    });
    return response.data.data;
  }

  async crear(data: CreateTestingCardPlaybookData): Promise<TestingCardPlaybook> {
    const response = await apiClient.post(`${BASE_URL}/testing-cards-playbook`, data);
    return response.data.data;
  }

  async actualizar(pagina: number, data: Partial<CreateTestingCardPlaybookData>): Promise<TestingCardPlaybook | null> {
    const response = await apiClient.put(`${BASE_URL}/testing-cards-playbook/por-pagina`, data, {
      params: { pagina }
    });
    return response.data.data;
  }

  async eliminar(pagina: number): Promise<boolean> {
    const response = await apiClient.delete(`${BASE_URL}/testing-cards-playbook/por-pagina`, {
      params: { pagina }
    });
    return response.data.data;
  }
}

export default TestingCardPlaybookService;
