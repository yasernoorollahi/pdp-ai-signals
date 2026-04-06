import axios from 'axios';
export const STEP_ENDPOINTS = [
    { key: 'facts', label: 'Facts', endpoint: '/extract/facts' },
    { key: 'intent', label: 'Intent', endpoint: '/extract/intent' },
    { key: 'tone', label: 'Tone', endpoint: '/extract/tone' },
    { key: 'cognitive', label: 'Cognitive', endpoint: '/extract/cognitive' },
    { key: 'context', label: 'Context', endpoint: '/extract/context' },
    { key: 'topics', label: 'Topics', endpoint: '/extract/topics' }
];
export const apiClient = axios.create({
    baseURL: '/',
    timeout: 0,
    headers: {
        'Content-Type': 'application/json'
    }
});
export async function fetchModels(provider) {
    const { data } = await apiClient.get(`/models/${provider}`);
    return data;
}
export async function runExtractionStep(endpoint, payload, options) {
    const response = await apiClient.post(endpoint, payload, options?.pipelineRunId
        ? {
            headers: {
                'X-Pipeline-Run-Id': options.pipelineRunId
            }
        }
        : {});
    return response.data;
}
