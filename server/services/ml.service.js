import { RiskService } from './risk.service.js';

/**
 * Machine Learning Interface Layer
 *
 * Current Phase: Transparent deterministic civic risk matrix (RiskService)
 * Future Phase: Decoupled Python microservice running XGBoost/PyTorch inference
 */
export class MLService {
  static async predictRisk(reportData) {
    const mlApiUrl = process.env.ML_API_URL;

    // Pluggable ML microservice branch
    if (mlApiUrl) {
      try {
        console.log(`[MLService] Forwarding inference payload to remote ML endpoint: ${mlApiUrl}`);
        const response = await fetch(`${mlApiUrl}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData)
        });
        if (response.ok) {
          const mlResult = await response.json();
          return mlResult;
        }
      } catch (err) {
        console.warn(`[MLService] Remote ML API unreachable (${err.message}). Gracefully falling back to transparent risk calculator.`);
      }
    }

    // Default transparent statistical risk engine
    return await RiskService.calculateRisk(reportData);
  }
}

export default MLService;
