import apiClient from './apiClient';

export interface IntegrationFormData {
  fullName: string;
  companyName?: string;
  email: string;
  phone?: string;
  integrationType: string;
  websiteUrl?: string;
  description: string;
  expectedVolume: string;
}

export interface IntegrationResponse {
  success: boolean;
  data: {
    id: string;
    message: string;
  };
}

export async function submitIntegrationRequest(
  formData: IntegrationFormData,
): Promise<IntegrationResponse> {
  const { data } = await apiClient.post<IntegrationResponse>('/integration', formData);
  return data;
}
