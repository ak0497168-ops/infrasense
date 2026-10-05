import { Report } from '../models/Report.js';
import { Infrastructure } from '../models/Infrastructure.js';
import { ClimateData } from '../models/ClimateData.js';
import { SensorData } from '../models/SensorData.js';

export const getOverview = async (req, res, next) => {
  try {
    const categories = ['Roads', 'Bridges', 'Streetlights', 'Water Pipelines', 'Public Buildings', 'Drainage'];

    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const reportCount = await Report.countDocuments({ infrastructureType: cat });
        const resolvedCount = await Report.countDocuments({ infrastructureType: cat, status: 'RESOLVED' });
        
        // Mock / calculated health score for category
        let healthScore = 78;
        if (cat === 'Roads') healthScore = 64;
        if (cat === 'Drainage') healthScore = 58;
        if (cat === 'Bridges') healthScore = 86;
        if (cat === 'Streetlights') healthScore = 79;
        if (cat === 'Water Pipelines') healthScore = 68;
        if (cat === 'Public Buildings') healthScore = 82;

        return {
          category: cat,
          healthScore,
          activeIssues: reportCount - resolvedCount,
          totalReports: reportCount,
          status: healthScore >= 75 ? 'Good' : healthScore >= 60 ? 'Fair' : 'Attention Needed'
        };
      })
    );

    const overallHealth = Math.round(
      categoryStats.reduce((acc, c) => acc + c.healthScore, 0) / categoryStats.length
    );

    res.status(200).json({
      success: true,
      data: {
        overallHealth,
        healthRating: overallHealth >= 75 ? 'Stable' : 'Moderate Strain',
        categoryHealth: categoryStats,
        lastAssessmentDate: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTrends = async (req, res, next) => {
  try {
    // 6-month historical risk trend
    const monthlyRiskTrend = [
      { month: 'May', avgRiskScore: 54, reports: 38, resolved: 32 },
      { month: 'Jun', avgRiskScore: 68, reports: 54, resolved: 41 },
      { month: 'Jul', avgRiskScore: 76, reports: 72, resolved: 58 },
      { month: 'Aug', avgRiskScore: 72, reports: 65, resolved: 60 },
      { month: 'Sep', avgRiskScore: 61, reports: 49, resolved: 46 },
      { month: 'Oct', avgRiskScore: 58, reports: 42, resolved: 39 },
    ];

    // Reports by infrastructure category
    const categoryDistribution = [
      { name: 'Roads', count: 84, risk: 74, fill: '#0284c7' },
      { name: 'Drainage', count: 62, risk: 78, fill: '#0d9488' },
      { name: 'Water Pipelines', count: 48, risk: 68, fill: '#3b82f6' },
      { name: 'Streetlights', count: 41, risk: 52, fill: '#eab308' },
      { name: 'Bridges', count: 19, risk: 71, fill: '#ea580c' },
      { name: 'Public Buildings', count: 24, risk: 59, fill: '#6366f1' },
    ];

    // Most common problems reported by citizens
    const commonProblems = [
      { problem: 'Pothole & Surface Wear', category: 'Roads', count: 68, severityIndex: 78 },
      { problem: 'Blocked Silt & Catch Basin', category: 'Drainage', count: 52, severityIndex: 82 },
      { problem: 'Water Mains Rupture', category: 'Water Pipelines', count: 37, severityIndex: 75 },
      { problem: 'Non-functional Streetlights', category: 'Streetlights', count: 34, severityIndex: 48 },
      { problem: 'Expansion Joint Fissure', category: 'Bridges', count: 16, severityIndex: 86 },
    ];

    // Resolution performance metrics
    const resolutionStatus = [
      { status: 'Resolved', count: 184, percentage: 66 },
      { status: 'In Progress', count: 46, percentage: 16 },
      { status: 'Maintenance Scheduled', count: 28, percentage: 10 },
      { status: 'Under Review', count: 22, percentage: 8 },
    ];

    res.status(200).json({
      success: true,
      data: {
        monthlyRiskTrend,
        categoryDistribution,
        commonProblems,
        resolutionStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getEnvironment = async (req, res, next) => {
  try {
    const climateRecords = await ClimateData.find({}).limit(5);

    const regionalWeather = {
      city: 'Patna / Metro Urban Zone',
      temperature: 29.4,
      unitTemp: '°C',
      rainfallMm: 68.2,
      rainfallStatus: 'Heavy Monsoon Runoff',
      humidity: 78,
      floodRiskIndex: 72,
      floodRiskLevel: 'High',
      soilSaturation: 82,
      environmentalRiskRating: 'Elevated Degradation Factor',
      sensorStationsActive: 14,
      atmosphericNotes: 'Elevated precipitation index increases hydraulic scouring risk on drainage culverts and asphalt subgrades.'
    };

    res.status(200).json({
      success: true,
      data: regionalWeather
    });
  } catch (error) {
    next(error);
  }
};

export const getCommunity = async (req, res, next) => {
  try {
    const totalReports = await Report.countDocuments();
    const resolvedReports = await Report.countDocuments({ status: 'RESOLVED' });

    res.status(200).json({
      success: true,
      data: {
        totalComplaints: 278,
        recentComplaints30Days: 48,
        activeVolunteers: 1240,
        averageResolutionDays: 4.2,
        mostReportedCategory: 'Roads (34% of volume)',
        highestRiskCategory: 'Drainage & Stormwater (Avg Risk: 78/100)',
        topProblemLocality: 'Kankarbagh & Fraser Road Sector'
      }
    });
  } catch (error) {
    next(error);
  }
};
