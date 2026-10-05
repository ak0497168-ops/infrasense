import { Report } from '../models/Report.js';
import { RiskAssessment } from '../models/RiskAssessment.js';
import { Notification } from '../models/Notification.js';
import { Feedback } from '../models/Feedback.js';
import { MLService } from '../services/ml.service.js';
import { ImageAnalysisService } from '../services/image-analysis.service.js';
import { SimilarityService } from '../services/similarity.service.js';

export const createReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let body = req.body;

    // Handle multipart JSON parsing if sent with formData
    if (typeof body.location === 'string') {
      try {
        body.location = JSON.parse(body.location);
      } catch {
        // fallback
      }
    }

    const { infrastructureType, problemType, severity, description, location } = body;

    // Collect uploaded evidence files
    const images = [];
    const videos = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        const fileUrl = `/uploads/${file.filename}`;
        if (file.mimetype.startsWith('video/')) {
          videos.push(fileUrl);
        } else {
          images.push(fileUrl);
        }
      });
    }

    // Run AI Computer Vision Analysis (Gemini Flash Multimodal Vision)
    let aiImageAnalysis = null;
    if (req.body.cachedAiAnalysis) {
      try {
        aiImageAnalysis = typeof req.body.cachedAiAnalysis === 'string'
          ? JSON.parse(req.body.cachedAiAnalysis)
          : req.body.cachedAiAnalysis;
      } catch {
        // ignore fallback to fresh analysis
      }
    }

    const firstImageFile = req.files && Array.isArray(req.files) ? req.files.find(f => !f.mimetype.startsWith('video/')) : null;

    if (!aiImageAnalysis && (images.length > 0 || firstImageFile || req.body.runMockAi)) {
      aiImageAnalysis = await ImageAnalysisService.analyzeImage({
        infrastructureType,
        problemType,
        filename: images[0] || 'uploaded-sample.jpg',
        filePath: firstImageFile?.path || '',
        description: description || ''
      });
    }

    // Generate Unique Citizen Report ID (INF-XXXXX)
    const reportId = `INF-${Math.floor(10000 + Math.random() * 90000)}`;

    // Determine effective severity for risk assessment:
    // Priority: AI-estimated severity (from visual inspection) > citizen-entered severity
    const aiEstimatedSeverity = aiImageAnalysis?.estimatedSeverity;
    const effectiveSeverity = aiEstimatedSeverity || severity;

    // Perform Predictive Risk Assessment (ML / Statistical Engine)
    // Uses AI-estimated severity when available so risk score is driven by visual intelligence
    const assessmentResult = await MLService.predictRisk({
      infrastructureType,
      problemType,
      severity: effectiveSeverity,
      location,
      citizenSeverity: severity,           // retained for audit/display
      aiEstimatedSeverity: aiEstimatedSeverity || null
    });

    // Save Risk Assessment document
    const riskAssessment = await RiskAssessment.create({
      reportId,
      riskScore: assessmentResult.riskScore,
      riskLevel: assessmentResult.riskLevel,
      maintenanceLikelihood: assessmentResult.maintenanceLikelihood,
      riskFactors: assessmentResult.riskFactors,
      explanation: assessmentResult.explanation,
      similarComplaintsSummary: assessmentResult.similarComplaintsSummary,
      // Severity audit trail — AI-estimated severity drives the score when available
      citizenSeverity: severity,
      aiEstimatedSeverity: aiEstimatedSeverity || null,
      effectiveSeverity              // which severity was actually used for risk calculation
    });

    // Save Report document
    const report = await Report.create({
      reportId,
      userId,
      infrastructureType,
      problemType,
      severity,
      description,
      location,
      evidence: {
        images,
        videos
      },
      aiImageAnalysis,
      status: 'SUBMITTED',
      riskAssessmentId: riskAssessment._id || riskAssessment.id
    });

    // Generate Automatic Notifications for Citizen
    await Notification.create({
      userId,
      reportId,
      title: 'Report Submitted Successfully',
      message: `Your report ${reportId} for ${infrastructureType} in ${location.area} has been recorded into the municipal queue.`,
      type: 'REPORT_SUBMITTED'
    });

    await Notification.create({
      userId,
      reportId,
      title: 'Risk Assessment Completed',
      message: `Your report ${reportId} has been classified as ${assessmentResult.riskLevel} Risk with a score of ${assessmentResult.riskScore}/100.`,
      type: 'RISK_ASSESSED'
    });

    if (assessmentResult.similarComplaintsSummary && assessmentResult.similarComplaintsSummary.count > 0) {
      await Notification.create({
        userId,
        reportId,
        title: 'Similar Complaints Detected',
        message: `${assessmentResult.similarComplaintsSummary.count} similar complaints were matched in ${location.area}, elevating maintenance urgency.`,
        type: 'SIMILAR_DETECTED'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Infrastructure problem reported successfully.',
      data: {
        report,
        riskAssessment
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyReports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, infrastructureType, riskLevel, search } = req.query;

    const filter = { userId };
    if (status && status !== 'ALL') filter.status = status;
    if (infrastructureType && infrastructureType !== 'ALL') filter.infrastructureType = infrastructureType;

    const reports = await Report.find(filter).sort({ createdAt: -1 });

    // Populate Risk Assessment details for each report
    const enrichedReports = await Promise.all(
      reports.map(async (r) => {
        let assessment = null;
        if (r.riskAssessmentId) {
          assessment = await RiskAssessment.findById(r.riskAssessmentId);
        }
        if (!assessment) {
          assessment = await RiskAssessment.findOne({ reportId: r.reportId });
        }
        const plainReport = typeof r.toObject === 'function' 
          ? r.toObject() 
          : (r._doc ? { ...r._doc } : { ...r });
        const plainAssessment = assessment 
          ? (typeof assessment.toObject === 'function' ? assessment.toObject() : assessment) 
          : null;
        return {
          ...plainReport,
          riskAssessment: plainAssessment
        };
      })
    );

    // Filter by riskLevel if requested
    let finalReports = enrichedReports;
    if (riskLevel && riskLevel !== 'ALL') {
      finalReports = enrichedReports.filter(
        r => r.riskAssessment && r.riskAssessment.riskLevel.toUpperCase() === riskLevel.toUpperCase()
      );
    }

    // Filter by search query if provided
    if (search) {
      const q = search.toLowerCase();
      finalReports = finalReports.filter(r => 
        r.reportId.toLowerCase().includes(q) ||
        r.infrastructureType.toLowerCase().includes(q) ||
        r.problemType.toLowerCase().includes(q) ||
        (r.location && (r.location.area.toLowerCase().includes(q) || r.location.city.toLowerCase().includes(q)))
      );
    }

    // Calculate Summary Stats for Top Cards
    const totalReports = reports.length;
    const underReview = reports.filter(r => r.status === 'UNDER_REVIEW' || r.status === 'SUBMITTED').length;
    const inProgress = reports.filter(r => r.status === 'IN_PROGRESS' || r.status === 'MAINTENANCE_SCHEDULED').length;
    const resolved = reports.filter(r => r.status === 'RESOLVED').length;

    res.status(200).json({
      success: true,
      data: {
        reports: finalReports,
        stats: {
          totalReports,
          underReview,
          inProgress,
          resolved
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let report = await Report.findOne({ reportId: id });
    if (!report) {
      report = await Report.findById(id);
    }

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report ${id} not found.`
      });
    }

    let riskAssessment = null;
    if (report.riskAssessmentId) {
      riskAssessment = await RiskAssessment.findById(report.riskAssessmentId);
    }
    if (!riskAssessment) {
      riskAssessment = await RiskAssessment.findOne({ reportId: report.reportId });
    }

    const feedback = await Feedback.findOne({ reportId: report.reportId });

    res.status(200).json({
      success: true,
      data: {
        report,
        riskAssessment,
        feedback
      }
    });
  } catch (error) {
    next(error);
  }
};

export const previewAnalyzeImage = async (req, res, next) => {
  try {
    const { infrastructureType, problemType, description, imageBase64 } = req.body;

    const analysis = await ImageAnalysisService.analyzeImage({
      infrastructureType: infrastructureType || 'Public Buildings',
      problemType: problemType || 'Structural Damage',
      description: description || '',
      imageBase64: imageBase64 || ''
    });

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeImageEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { infrastructureType, problemType, imageBase64 } = req.body;

    const report = id && id !== 'new' ? await Report.findOne({ reportId: id }) : null;
    const targetCategory = infrastructureType || (report ? report.infrastructureType : 'Roads');
    const targetProblem = problemType || (report ? report.problemType : 'Pothole');
    const targetFilename = report?.evidence?.images?.[0] || '';

    const analysis = await ImageAnalysisService.analyzeImage({
      infrastructureType: targetCategory,
      problemType: targetProblem,
      filename: targetFilename,
      description: report?.description || '',
      imageBase64: imageBase64 || ''
    });

    if (report) {
      await Report.findByIdAndUpdate(report._id || report.id, {
        $set: { aiImageAnalysis: analysis }
      });
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

export const submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    let report = await Report.findOne({ reportId: id });
    if (!report) {
      report = await Report.findById(id);
    }

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const feedback = await Feedback.create({
      reportId: report.reportId,
      userId,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! It helps improve municipal response quality.',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

export const simulateStatusAdvance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nextStatus } = req.body;

    let report = await Report.findOne({ reportId: id });
    if (!report) {
      report = await Report.findById(id);
    }

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const statusOrder = [
      'SUBMITTED',
      'UNDER_REVIEW',
      'MAINTENANCE_SCHEDULED',
      'IN_PROGRESS',
      'RESOLVED'
    ];

    let target = nextStatus;
    if (!target) {
      const idx = statusOrder.indexOf(report.status);
      target = idx < statusOrder.length - 1 ? statusOrder[idx + 1] : statusOrder[idx];
    }

    const updated = await Report.findByIdAndUpdate(
      report._id || report.id,
      { $set: { status: target, updatedAt: new Date() } },
      { new: true }
    );

    // Create Notification
    const notifTitle = target === 'RESOLVED' 
      ? 'Issue Resolved'
      : target === 'MAINTENANCE_SCHEDULED'
      ? 'Maintenance Crew Dispatched'
      : `Report Status Updated: ${target.replace('_', ' ')}`;

    await Notification.create({
      userId: report.userId,
      reportId: report.reportId,
      title: notifTitle,
      message: `Your report ${report.reportId} status has progressed to ${target.replace('_', ' ')}.`,
      type: target === 'RESOLVED' ? 'RESOLVED' : 'STATUS_CHANGED'
    });

    res.status(200).json({
      success: true,
      message: `Report status updated to ${target}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
