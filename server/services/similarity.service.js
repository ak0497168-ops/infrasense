import { Report } from '../models/Report.js';
import { PublicComplaint } from '../models/PublicComplaint.js';

export class SimilarityService {
  /**
   * Search for recent similar complaints and reports
   * @param {Object} params
   * @param {string} params.infrastructureType
   * @param {string} params.problemType
   * @param {string} params.city
   * @param {string} params.area
   * @param {number} [params.days=30]
   */
  static async findSimilarIssues({ infrastructureType, problemType, city, area, days = 30 }) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Query recent reports in this area
    let areaReports = [];
    try {
      areaReports = await Report.find({
        infrastructureType,
        'location.area': area,
        createdAt: { $gte: cutoffDate }
      }).limit(10);
    } catch {
      areaReports = [];
    }

    // Query recorded public complaints in this locality
    let complaints = [];
    try {
      complaints = await PublicComplaint.find({
        infrastructureType,
        area: area
      }).limit(20);
    } catch {
      complaints = [];
    }

    const matchingComplaints = complaints.filter(c => 
      !problemType || c.problemType.toLowerCase() === problemType.toLowerCase() || c.infrastructureType === infrastructureType
    );

    const totalCount = (areaReports ? areaReports.length : 0) + matchingComplaints.length;

    let alertMessage = '';
    if (totalCount >= 10) {
      alertMessage = `${totalCount} similar complaints were recently recorded in this area within the last ${days} days. High civic impact zone.`;
    } else if (totalCount > 0) {
      alertMessage = `${totalCount} similar issues have recently been reported in this area (${area}, ${city}).`;
    } else {
      alertMessage = `First recent complaint recorded for this issue in ${area}.`;
    }

    return {
      similarReportCount: totalCount,
      recentSimilarReports: (areaReports || []).slice(0, 3).map(r => ({
        reportId: r.reportId,
        problemType: r.problemType,
        severity: r.severity,
        status: r.status,
        date: r.createdAt
      })),
      area,
      city,
      days,
      alertMessage
    };
  }
}

export default SimilarityService;
