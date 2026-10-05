import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Report } from '../models/Report.js';
import { Infrastructure } from '../models/Infrastructure.js';
import { MaintenanceRecord } from '../models/MaintenanceRecord.js';
import { PublicComplaint } from '../models/PublicComplaint.js';
import { SensorData } from '../models/SensorData.js';
import { ClimateData } from '../models/ClimateData.js';
import { RiskAssessment } from '../models/RiskAssessment.js';
import { Notification } from '../models/Notification.js';
import { connectDB } from '../config/db.js';

export async function seedDatabase() {
  console.log('[Seed] Seeding realistic civic infrastructure dataset...');

  // 1. Create Default Demo Citizen User
  const existingUser = await User.findOne({ email: 'anuv@example.com' });
  let demoUser = existingUser;
  if (!demoUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    demoUser = await User.create({
      name: 'Anuv Sharma',
      email: 'anuv@example.com',
      password: hashedPassword,
      role: 'CITIZEN',
      notificationPreferences: { email: true, push: true, sms: true }
    });
    console.log('[Seed] Demo citizen created: anuv@example.com / password123');
  }

  // 1b. Create Demo Admin User requested: admin@gamil.com (and admin@gmail.com) with password admin@1234
  const requestedAdminEmails = ['admin@gamil.com', 'admin@gmail.com', 'admin@infrasense.gov.in', 'admin@infrasense.gov'];
  const salt = await bcrypt.genSalt(10);
  const requestedHashedPassword = await bcrypt.hash('admin@1234', salt);

  for (const email of requestedAdminEmails) {
    let adm = await User.findOne({ email });
    if (!adm) {
      await User.create({
        name: 'Municipal Administrator',
        email,
        password: requestedHashedPassword,
        role: 'ADMIN',
        notificationPreferences: { email: true, push: true, sms: true }
      });
      console.log(`[Seed] Admin user created: ${email} / admin@1234`);
    } else {
      // Ensure role is ADMIN and password matches admin@1234 if requested
      if (adm.role !== 'ADMIN' || email === 'admin@gamil.com' || email === 'admin@gmail.com') {
        adm.role = 'ADMIN';
        adm.password = requestedHashedPassword;
        if (typeof adm.save === 'function') await adm.save();
      }
    }
  }

  const userId = demoUser._id || demoUser.id;

  // 2. Infrastructures for all 6 categories
  const infraCount = await Infrastructure.countDocuments();
  if (infraCount === 0) {
    await Infrastructure.insertMany([
      {
        name: 'Bailey Road Arterial Corridor',
        category: 'Roads',
        city: 'Patna',
        area: 'Bailey Road',
        conditionRating: 58,
        installationYear: 2017,
        status: 'Operational - High Stress'
      },
      {
        name: 'Mahatma Gandhi Setu Approach Span',
        category: 'Bridges',
        city: 'Patna',
        area: 'Ganga Riverbank Sector',
        conditionRating: 72,
        installationYear: 2012,
        status: 'Operational - Monitored'
      },
      {
        name: 'Kankarbagh High-Mast Illumination Grid',
        category: 'Streetlights',
        city: 'Patna',
        area: 'Kankarbagh',
        conditionRating: 64,
        installationYear: 2020,
        status: 'Partial Outages Reported'
      },
      {
        name: 'Boring Road Main Potable Trunk Line',
        category: 'Water Pipelines',
        city: 'Patna',
        area: 'Boring Road',
        conditionRating: 52,
        installationYear: 2014,
        status: 'Pressure Warning'
      },
      {
        name: 'Patna Central Civic Service Complex',
        category: 'Public Buildings',
        city: 'Patna',
        area: 'Fraser Road',
        conditionRating: 81,
        installationYear: 2016,
        status: 'Operational'
      },
      {
        name: 'Rajendra Nagar Stormwater Trunk Culvert',
        category: 'Drainage',
        city: 'Patna',
        area: 'Rajendra Nagar',
        conditionRating: 44,
        installationYear: 2011,
        status: 'Chronic Silt Occlusion'
      }
    ]);
  }

  // 3. Maintenance Records
  const maintCount = await MaintenanceRecord.countDocuments();
  if (maintCount === 0) {
    await MaintenanceRecord.insertMany([
      {
        infrastructureType: 'Roads',
        city: 'Patna',
        area: 'Kankarbagh',
        workDone: 'Emergency cold-mix pothole resurfacing and bitumen patching',
        cost: 45000,
        completedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        frequencyScore: 82
      },
      {
        infrastructureType: 'Roads',
        city: 'Patna',
        area: 'Kankarbagh',
        workDone: 'Subgrade stabilization after monsoon runoff subsidence',
        cost: 120000,
        completedAt: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000),
        frequencyScore: 82
      },
      {
        infrastructureType: 'Bridges',
        city: 'Patna',
        area: 'Ganga Riverbank Sector',
        workDone: 'Elastomeric bearing pad inspection & joint resealing',
        cost: 350000,
        completedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        frequencyScore: 60
      },
      {
        infrastructureType: 'Drainage',
        city: 'Patna',
        area: 'Rajendra Nagar',
        workDone: 'Desilting mechanized suction dredging along 800m trunk',
        cost: 75000,
        completedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        frequencyScore: 90
      },
      {
        infrastructureType: 'Water Pipelines',
        city: 'Patna',
        area: 'Boring Road',
        workDone: 'Cast iron pipe replacement following pressure surge fracture',
        cost: 95000,
        completedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
        frequencyScore: 75
      }
    ]);
  }

  // 4. Public Complaints in Area
  const complaintsCount = await PublicComplaint.countDocuments();
  if (complaintsCount === 0) {
    await PublicComplaint.insertMany([
      {
        infrastructureType: 'Roads',
        problemType: 'Pothole',
        city: 'Patna',
        area: 'Kankarbagh',
        street: 'Main Colony Road 4',
        urgency: 'High',
        reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        infrastructureType: 'Roads',
        problemType: 'Pothole',
        city: 'Patna',
        area: 'Kankarbagh',
        street: 'Tiwari Bechar Road',
        urgency: 'Critical',
        reportedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        infrastructureType: 'Roads',
        problemType: 'Cracks',
        city: 'Patna',
        area: 'Kankarbagh',
        street: 'Old Bypass Junction',
        urgency: 'Moderate',
        reportedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        infrastructureType: 'Drainage',
        problemType: 'Blocked Drain',
        city: 'Patna',
        area: 'Rajendra Nagar',
        street: 'Road No. 12',
        urgency: 'Critical',
        reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        infrastructureType: 'Water Pipelines',
        problemType: 'Leakage',
        city: 'Patna',
        area: 'Boring Road',
        street: 'Near Nageshwar Colony',
        urgency: 'High',
        reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]);
  }

  // 5. Sensor Data
  const sensorCount = await SensorData.countDocuments();
  if (sensorCount === 0) {
    await SensorData.insertMany([
      {
        infrastructureType: 'Roads',
        sensorType: 'subsurface_strain_gauge',
        city: 'Patna',
        area: 'Kankarbagh',
        readingValue: 340,
        unit: 'microstrain',
        thresholdStatus: 'Warning',
        anomalyScore: 78
      },
      {
        infrastructureType: 'Bridges',
        sensorType: 'piezoelectric_accelerometer',
        city: 'Patna',
        area: 'Ganga Riverbank Sector',
        readingValue: 2.4,
        unit: 'm/s²',
        thresholdStatus: 'Normal',
        anomalyScore: 35
      },
      {
        infrastructureType: 'Drainage',
        sensorType: 'ultrasonic_flow_depth',
        city: 'Patna',
        area: 'Rajendra Nagar',
        readingValue: 88,
        unit: '% capacity',
        thresholdStatus: 'Critical',
        anomalyScore: 92
      },
      {
        infrastructureType: 'Water Pipelines',
        sensorType: 'piezoresistive_pressure',
        city: 'Patna',
        area: 'Boring Road',
        readingValue: 1.8,
        unit: 'bar',
        thresholdStatus: 'Warning',
        anomalyScore: 72
      }
    ]);
  }

  // 6. Climate Data
  const climateCount = await ClimateData.countDocuments();
  if (climateCount === 0) {
    await ClimateData.insertMany([
      {
        city: 'Patna',
        area: 'Metro Urban Zone',
        temperature: 29.5,
        rainfallMm: 64.0,
        humidity: 78,
        floodRiskIndex: 72,
        environmentalRiskRating: 'Elevated'
      },
      {
        city: 'Bengaluru',
        area: 'Indiranagar Urban Sector',
        temperature: 24.2,
        rainfallMm: 38.0,
        humidity: 65,
        floodRiskIndex: 45,
        environmentalRiskRating: 'Moderate'
      }
    ]);
  }

  // 7. Seed Example Citizen Reports for Demo User
  const reportsCount = await Report.countDocuments({ userId });
  if (reportsCount === 0) {
    // Report 1: High Risk Pothole (INF-20481)
    const report1Id = 'INF-20481';
    const assessment1 = await RiskAssessment.create({
      reportId: report1Id,
      riskScore: 74,
      riskLevel: 'High',
      maintenanceLikelihood: 76,
      riskFactors: {
        historicalMaintenance: {
          score: 85,
          impact: 'High impact',
          description: 'This road section required resurfacing 3 times in the past 12 months.'
        },
        publicComplaints: {
          score: 80,
          impact: 'High impact',
          count: 14,
          description: '14 similar complaints were recently recorded in Kankarbagh.'
        },
        sensorData: {
          score: 75,
          impact: 'High impact',
          status: 'Warning',
          description: 'Subsurface strain sensor recorded excessive pavement deflection.'
        },
        climate: {
          score: 70,
          impact: 'High impact',
          description: 'Heavy seasonal precipitation has weakened the bitumen binder.'
        },
        currentSeverity: {
          score: 75,
          impact: 'High impact',
          description: 'Classified as High severity due to direct hazard to two-wheeler commuters.'
        },
        infrastructureCondition: {
          score: 60,
          impact: 'Moderate impact',
          description: 'Municipal condition score is 58/100, reflecting persistent wear.'
        }
      },
      explanation: 'InfraSense synthesized 6 civic data streams for Roads in Kankarbagh, Patna. The resulting composite score of 74/100 establishes a HIGH RISK profile with 76% urgent maintenance likelihood.',
      similarComplaintsSummary: {
        count: 14,
        windowDays: 30,
        notes: '14 similar reports recorded in Kankarbagh within the last 30 days.'
      }
    });

    await Report.create({
      reportId: report1Id,
      userId,
      infrastructureType: 'Roads',
      problemType: 'Pothole',
      severity: 'High',
      description: 'Severe depression spanning 1.5 meters across the left vehicular lane near SBI ATM. Motorcyclists are swerving dangerously during peak hours.',
      location: {
        city: 'Patna',
        area: 'Kankarbagh',
        street: 'Main Colony Road No. 4',
        landmark: 'Opposite State Bank of India ATM'
      },
      evidence: {
        images: ['/uploads/demo-pothole.jpg'],
        videos: []
      },
      aiImageAnalysis: {
        detectedIssue: 'Severe Pothole & Sub-base Exposure',
        confidence: 94,
        estimatedSeverity: 'High',
        visualCues: [
          'Surface depression boundary ~24cm depth detected',
          'Granular aggregate disintegration visible',
          'Immediate commuter hazard'
        ]
      },
      status: 'UNDER_REVIEW',
      riskAssessmentId: assessment1._id || assessment1.id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    // Report 2: Critical Drainage Overflow (INF-73921)
    const report2Id = 'INF-73921';
    const assessment2 = await RiskAssessment.create({
      reportId: report2Id,
      riskScore: 86,
      riskLevel: 'Critical',
      maintenanceLikelihood: 92,
      riskFactors: {
        historicalMaintenance: {
          score: 90,
          impact: 'High impact',
          description: 'Culvert has chronic silt clogging history during monsoon spells.'
        },
        publicComplaints: {
          score: 85,
          impact: 'High impact',
          count: 19,
          description: '19 local residents lodged waterlogging distress calls this week.'
        },
        sensorData: {
          score: 92,
          impact: 'High impact',
          status: 'Critical',
          description: 'Catch basin ultrasonic gauge detects 88% capacity blockage.'
        },
        climate: {
          score: 80,
          impact: 'High impact',
          description: 'Rainfall exceeding 64mm triggers acute backwater surge.'
        },
        currentSeverity: {
          score: 95,
          impact: 'High impact',
          description: 'Reported as Critical due to foul stormwater entering ground-floor dwellings.'
        },
        infrastructureCondition: {
          score: 75,
          impact: 'High impact',
          description: 'Drainage culvert integrity rated at 44/100 (Attention Needed).'
        }
      },
      explanation: 'Critical drainage failure identified in Rajendra Nagar. Rapid dispatch recommended.',
      similarComplaintsSummary: {
        count: 19,
        windowDays: 30,
        notes: '19 similar complaints recorded within the last 30 days.'
      }
    });

    await Report.create({
      reportId: report2Id,
      userId,
      infrastructureType: 'Drainage',
      problemType: 'Blocked Drain',
      severity: 'Critical',
      description: 'Major stormwater culvert completely choked with construction debris and solid silt. Wastewater is backing up onto pedestrian walkways.',
      location: {
        city: 'Patna',
        area: 'Rajendra Nagar',
        street: 'Road No. 12 Culvert',
        landmark: 'Near Rajendra Nagar Children Park'
      },
      evidence: {
        images: ['/uploads/demo-drain.jpg'],
        videos: []
      },
      aiImageAnalysis: {
        detectedIssue: 'Solid Waste Silt & Grate Obstruction',
        confidence: 95,
        estimatedSeverity: 'Critical',
        visualCues: [
          '85% stormwater catch-basin intake occlusion',
          'Organic debris and solid waste damming',
          'Backwater spillover risk'
        ]
      },
      status: 'IN_PROGRESS',
      riskAssessmentId: assessment2._id || assessment2.id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });

    // Report 3: Resolved Streetlight (INF-10928)
    const report3Id = 'INF-10928';
    const assessment3 = await RiskAssessment.create({
      reportId: report3Id,
      riskScore: 28,
      riskLevel: 'Low',
      maintenanceLikelihood: 30,
      riskFactors: {
        historicalMaintenance: {
          score: 25,
          impact: 'Low impact',
          description: 'Regular LED maintenance cycle was completed 4 months ago.'
        },
        publicComplaints: {
          score: 30,
          impact: 'Low impact',
          count: 2,
          description: 'Only 2 isolated streetlight tickets registered in this street.'
        },
        sensorData: {
          score: 20,
          impact: 'Low impact',
          status: 'Normal',
          description: 'Power feeder circuit voltage steady at 230V.'
        },
        climate: {
          score: 25,
          impact: 'Low impact',
          description: 'No windstorm damage.'
        },
        currentSeverity: {
          score: 30,
          impact: 'Low impact',
          description: 'Moderate dark spot without immediate vehicular hazard.'
        },
        infrastructureCondition: {
          score: 35,
          impact: 'Low impact',
          description: 'Pole foundation stable.'
        }
      },
      explanation: 'Routine luminaire replacement required.',
      similarComplaintsSummary: {
        count: 2,
        windowDays: 30,
        notes: '2 similar reports recorded.'
      }
    });

    await Report.create({
      reportId: report3Id,
      userId,
      infrastructureType: 'Streetlights',
      problemType: 'Not Working',
      severity: 'Moderate',
      description: 'Single pole luminaire flickering continuously and turns off after 9 PM, causing poor visibility for pedestrians.',
      location: {
        city: 'Patna',
        area: 'Boring Road',
        street: 'Canal Road Crossing',
        landmark: 'Opposite Oxford Book Depot'
      },
      evidence: {
        images: ['/uploads/demo-light.jpg'],
        videos: []
      },
      aiImageAnalysis: {
        detectedIssue: 'Luminaire Inactivation / Dark Zone',
        confidence: 93,
        estimatedSeverity: 'Moderate',
        visualCues: ['Zero lumen output during operational cycle', 'Photocell sensor misalignment']
      },
      status: 'RESOLVED',
      riskAssessmentId: assessment3._id || assessment3.id,
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
    });

    // 8. Notifications for Demo User
    await Notification.insertMany([
      {
        userId,
        reportId: 'INF-20481',
        title: 'Risk Assessment Completed',
        message: 'Your report INF-20481 has been classified as High Risk (Risk Score: 74/100). Municipal engineers have been notified.',
        type: 'RISK_ASSESSED',
        read: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId,
        reportId: 'INF-73921',
        title: 'Maintenance Crew Dispatched',
        message: 'Your report INF-73921 status has progressed to IN PROGRESS. Suction excavation equipment is on site.',
        type: 'STATUS_CHANGED',
        read: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        userId,
        reportId: 'INF-10928',
        title: 'Report Resolved',
        message: 'Your report INF-10928 has been resolved. The municipal electrical team replaced the photocell sensor. Please rate the resolution.',
        type: 'RESOLVED',
        read: true,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('[Seed] Sample reports and notifications populated for demo user.');
  }

  console.log('[Seed] Seeding completed successfully!');
}

// Standalone execution support
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      process.exit(0);
    } catch (err) {
      console.error('[Seed] Error seeding database:', err);
      process.exit(1);
    }
  })();
}
