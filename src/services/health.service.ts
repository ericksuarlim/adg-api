import { ServiceResponse } from "../interfaces/common/service-response.interface";
import { HealthStatus } from "../interfaces/health/health.interface";

class HealthService {
    async check(): Promise<ServiceResponse<HealthStatus>> {
        return {
            success: true,
            data: {
                status: 'ok',
            },
        };
    }
}

export default HealthService;
