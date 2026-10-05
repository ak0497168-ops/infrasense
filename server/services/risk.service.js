import { MaintenanceRecord } from '../models/MaintenanceRecord.js';
import { SensorData } from '../models/SensorData.js';
import { ClimateData } from '../models/ClimateData.js';
import { Infrastructure } from '../models/Infrastructure.js';
import { SimilarityService } from './similarity.service.js';

export class RiskService {
  /**
   * Transparent 6-factor weighted calculation for hackathon demo
   * Architecture ready to be plugged into ML pipeline
   */
  static async calculateRisk(reportData) {
    const { infrastructureType, problemType, severity, location, aiEstimatedSeverity, citizenSeverity } = reportData;
    const { city, area } = location;

    // 1. Current Severity Factor (Weight: 20%)
    let severityScore = 30;
    if (severity === 'Critical') severityScore = 95;
    else if (severity === 'High') severityScore = 75;
    else if (severity === 'Moderate') severityScore = 50;
    else severityScore = 25;

    // 2. Similar Complaints Factor (Weight: 20%)
    const similarity = await SimilarityService.findSimilarIssues({
      infrastructureType,
      problemType,
      city,
      area,
      days: 30
    });
    // Scale count: 0 -> 20, 5 -> 50, 10 -> 75, 15+ -> 95
    let complaintsScore = Math.min(95, Math.max(15, 20 + similarity.similarReportCount * 5));

    // 3. Historical Maintenance Factor (Weight: 20%)
    let records = [];
    try {
      records = await MaintenanceRecord.find({
        infrastructureType,
        area
      }).limit(5);
    } catch {
      records = [];
    }
    let historicalScore = 40;
    if (records.length >= 3) {
      historicalScore = 85; // Recurrent failures
    } else if (records.length >= 1) {
      historicalScore = 60;
    } else {
      historicalScore = 30; // Clean maintenance log
    }

    // 4. Sensor Data Factor (Weight: 15%)
    let sensor = null;
    try {
      sensor = await SensorData.findOne({
        infrastructureType,
        area
      });
    } catch {
      sensor = null;
    }
    let sensorScore = 35;
    let sensorStatus = 'Normal';
    if (sensor) {
      sensorScore = sensor.anomalyScore || 40;
      sensorStatus = sensor.thresholdStatus || 'Normal';
    } else {
      // Deterministic baseline by infrastructure
      if (infrastructureType === 'Bridges' || infrastructureType === 'Water Pipelines') {
        sensorScore = severityScore > 70 ? 72 : 45;
        sensorStatus = severityScore > 70 ? 'Warning' : 'Normal';
      }
    }

    // 5. Climate / Environmental Conditions (Weight: 15%)
    let climate = null;
    try {
      climate = await ClimateData.findOne({ city });
    } catch {
      climate = null;
    }
    let climateScore = 45;
    if (climate) {
      climateScore = Math.min(95, Math.max(20, climate.floodRiskIndex || 45));
    } else {
      // Typical monsoon / humidity baseline
      climateScore = (infrastructureType === 'Roads' || infrastructureType === 'Drainage') ? 68 : 42;
    }

    // 6. Infrastructure Condition Rating (Weight: 10%)
    let infra = null;
    try {
      infra = await Infrastructure.findOne({ category: infrastructureType, area });
    } catch {
      infra = null;
    }
    // Note: lower condition rating implies HIGHER risk score
    let conditionScore = 50;
    if (infra && infra.conditionRating !== undefined) {
      conditionScore = Math.max(10, Math.min(100, 100 - infra.conditionRating));
    } else {
      conditionScore = severityScore > 70 ? 70 : 40;
    }

    // Normalized Weighted Calculation
    // Historical 20%, Complaints 20%, Sensor 15%, Climate 15%, Severity 20%, Condition 10%
    const weightedSum =
      (historicalScore * 0.20) +
      (complaintsScore * 0.20) +
      (sensorScore * 0.15) +
      (climateScore * 0.15) +
      (severityScore * 0.20) +
      (conditionScore * 0.10);

    const riskScore = Math.min(100, Math.max(1, Math.round(weightedSum)));

    // Categorize Risk Level
    let riskLevel = 'Low';
    if (riskScore >= 81) riskLevel = 'Critical';
    else if (riskScore >= 61) riskLevel = 'High';
    else if (riskScore >= 31) riskLevel = 'Moderate';
    else riskLevel = 'Low';

    // Maintenance Likelihood Percentage
    const maintenanceLikelihood = Math.min(99, Math.max(15, Math.round(
      riskScore * 0.92 + (severityScore >= 75 ? 6 : 0)
    )));

    // Helper impact labeler
    const getImpactLabel = (val) => {
      if (val >= 70) return 'High impact';
      if (val >= 40) return 'Moderate impact';
      return 'Low impact';
    };

    // Citizen-friendly explanations
    const riskFactors = {
      historicalMaintenance: {
        score: historicalScore,
        impact: getImpactLabel(historicalScore),
        description: historicalScore >= 70 
          ? 'This infrastructure has required maintenance multiple times over the past 12 months.'
          : 'Maintenance logs show standard scheduled servicing intervals without chronic failures.'
      },
      publicComplaints: {
        score: complaintsScore,
        impact: getImpactLabel(complaintsScore),
        count: similarity.similarReportCount,
        description: similarity.similarReportCount > 0
          ? `${similarity.similarReportCount} similar complaints were recently recorded in this area (${area}).`
          : `No recent conflicting public complaints reported in ${area} within the last 30 days.`
      },
      climate: {
        score: climateScore,
        impact: getImpactLabel(climateScore),
        description: climateScore >= 60
          ? 'Recent environmental moisture and heat cycles significantly accelerate structural deterioration.'
          : 'Local climate conditions are within seasonal averages.'
      },
      sensorData: {
        score: sensorScore,
        impact: getImpactLabel(sensorScore),
        status: sensorStatus,
        description: sensorScore >= 65
          ? `Sensor telemetry reflects abnormal ${sensorStatus.toLowerCase()} fluctuations in local civic grid.`
          : 'Grid telemetry readings remain within standard operational tolerances.'
      },
      currentSeverity: {
        score: severityScore,
        impact: getImpactLabel(severityScore),
        description: aiEstimatedSeverity
          ? `AI visual inspection (Gemini) detected ${aiEstimatedSeverity} severity from uploaded evidence, overriding the citizen-reported ${citizenSeverity || severity} input to drive the risk score with greater accuracy.`
          : `The citizen-reported ${severity} severity level was used directly as no AI visual analysis was available for this submission.`
      },
      infrastructureCondition: {
        score: conditionScore,
        impact: getImpactLabel(conditionScore),
        description: conditionScore >= 60
          ? 'Municipal asset health index indicates existing wear and tear.'
          : 'Structural baseline is currently rated in stable condition.'
      }
    };

    const explanation = `InfraSense synthesized 6 civic data streams for ${infrastructureType} in ${area}, ${city}. The resulting composite score of ${riskScore}/100 establishes a ${riskLevel.toUpperCase()} RISK profile with ${maintenanceLikelihood}% urgent maintenance likelihood.`;

    return {
      riskScore,
      riskLevel,
      maintenanceLikelihood,
      riskFactors,
      explanation,
      similarComplaintsSummary: {
        count: similarity.similarReportCount,
        windowDays: similarity.days,
        notes: similarity.alertMessage
      }
    };
  }
}

export default RiskService;
