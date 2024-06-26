import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Service } from "typedi";

import { env } from "../../env";

interface ApiResponse {
  data: any;
  status: number;
  statusText: string;
}

@Service()
export default class AdjutorService {
    private baseUrl: string;
    private authToken: string | null;

    constructor() {
        const adjutorConfig = env.lendsqr.adjutor;
        this.baseUrl = adjutorConfig.baseUrl;
        this.authToken = adjutorConfig.apiKey;
    }

    async getResource(path: string): Promise<ApiResponse> {
        try {
            const config: AxiosRequestConfig = {
                headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
            };
            const response: AxiosResponse = await axios.get(`${this.baseUrl}${path}`, config);
            return {
                data: response.data,
                status: response.status,
                statusText: response.statusText,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Error fetching resource: ${error.response?.status} - ${error.response?.statusText}`);
            } else {
                throw new Error("An unexpected error occurred while fetching the resource");
            }
        }
    }

    async postResource(path: string, data: any): Promise<ApiResponse> {
        try {
            const config: AxiosRequestConfig = {
                headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
            };
            const response: AxiosResponse = await axios.post(`${this.baseUrl}${path}`, data, config);
            return {
                data: response.data,
                status: response.status,
                statusText: response.statusText,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Error posting resource: ${error.response?.status} - ${error.response?.statusText}`);
            } else {
                throw new Error("An unexpected error occurred while posting the resource");
            }
        }
    }
}