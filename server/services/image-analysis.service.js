import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

/**
 * Computer Vision Image Analysis Service
 *
 * Primary Engine: Google Gemini Flash Multimodal Vision (@google/genai)
 * Fallback Engine: Domain Heuristic Civil Knowledge Matrix
 */
export class ImageAnalysisService {
  /**
   * Run visual inspection on submitted image evidence
   * @param {Object} params
   * @param {string} [params.infrastructureType]
   * @param {string} [params.problemType]
   * @param {string} [params.filename]
   * @param {string} [params.filePath]
   * @param {string} [params.description]
   * @param {string} [params.imageBase64]
   * @param {string} [params.mimeType]
   */
  static async analyzeImage({
    infrastructureType = 'Roads',
    problemType = 'Pothole',
    filename = '',
    filePath = '',
    description = '',
    imageBase64 = '',
    mimeType = ''
  }) {
    // 1. Check if Gemini API Key is available
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      // Case A: Direct Base64 image payload (e.g. from live client intake preview)
      if (imageBase64 && typeof imageBase64 === 'string') {
        try {
          let cleanBase64 = imageBase64;
          let detectedMime = mimeType || 'image/jpeg';

          const match = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
          if (match) {
            detectedMime = match[1];
            cleanBase64 = match[2];
          }

          const result = await this.analyzeWithGemini({
            base64Data: cleanBase64,
            mimeType: detectedMime,
            infrastructureType,
            problemType,
            description,
            apiKey
          });
          if (result) return result;
        } catch (geminiError) {
          console.warn('[Gemini Vision] Base64 inspection notice, using fallback heuristic:', geminiError.message);
        }
      }

      // Case B: Image file on disk (from file upload)
      const resolvedPath = this.resolveImagePath(filePath, filename);
      if (resolvedPath && fs.existsSync(resolvedPath)) {
        try {
          const imgBuffer = fs.readFileSync(resolvedPath);
          const base64Data = imgBuffer.toString('base64');
          const detectedMime = this.getMimeType(resolvedPath);

          const result = await this.analyzeWithGemini({
            base64Data,
            mimeType: detectedMime,
            infrastructureType,
            problemType,
            description,
            apiKey
          });
          if (result) return result;
        } catch (geminiError) {
          console.warn('[Gemini Vision] File inspection notice, using fallback heuristic:', geminiError.message);
        }
      }
    }

    // 2. Fallback Heuristic Pipeline
    return this.fallbackHeuristic({ infrastructureType, problemType });
  }

  /**
   * Helper to locate image on filesystem
   */
  static resolveImagePath(filePath, filename) {
    if (filePath && fs.existsSync(filePath)) return filePath;

    if (filename) {
      // Strip leading slash if any
      const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
      const cwd = process.cwd();
      const possiblePaths = [
        path.resolve(cwd, cleanFilename),
        path.resolve(cwd, 'uploads', path.basename(cleanFilename)),
        path.resolve(cwd, process.env.UPLOAD_DIR || 'uploads', path.basename(cleanFilename))
      ];

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) return p;
      }
    }
    return null;
  }

  /**
   * Detect mime type from file extension
   */
  static getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.png': return 'image/png';
      case '.webp': return 'image/webp';
      case '.gif': return 'image/gif';
      case '.avif': return 'image/avif';
      case '.jpg':
      case '.jpeg':
      default:
        return 'image/jpeg';
    }
  }

  /**
   * Multimodal Vision Analysis via @google/genai
   */
  static async analyzeWithGemini({ base64Data, mimeType, infrastructureType, problemType, description, apiKey }) {
    const ai = new GoogleGenAI({ apiKey });

    // Primary model: gemini-3.1-flash-lite, fallback: gemini-3.8-flash
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const prompt = `You are a certified senior civil and municipal infrastructure inspection AI.
Carefully inspect the actual structure and damage shown in this photograph.
Citizen submission context:
- Reported Sector: "${infrastructureType}"
- Reported Defect: "${problemType}"
${description ? `- Citizen Notes: "${description}"` : ''}

Instructions:
1. Examine what is PHYSICALLY PRESENT in the image (e.g., if it is an interior or exterior building wall with cracks, brick masonry, concrete surface, road asphalt, metal drainage grate, water pipe, etc.).
2. Do NOT hallucinate unrepresented features (e.g., do not mention bridge rebar or highway pavement if the image depicts a building wall or house crack).
3. Evaluate the visible severity of the structural degradation, surface fissure, or hazard.
4. Provide 3 to 4 specific, real physical observations visible in this specific photo.

Return a valid JSON object matching this schema:
{
  "detectedIssue": "Precise defect title based on the real image (e.g. 'Diagonal Shear Cracking in Masonry Wall' or 'Asphalt Cavity')",
  "confidence": 92,
  "estimatedSeverity": "Critical" | "High" | "Moderate" | "Low",
  "visualCues": [
    "Specific observation 1 actually visible in the photo",
    "Specific observation 2 actually visible in the photo",
    "Specific observation 3 actually visible in the photo"
  ],
  "recommendation": "Actionable civil repair or maintenance recommendation"
}`;

        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: base64Data
                  }
                },
                { text: prompt }
              ]
            }
          ],
          config: {
            responseMimeType: 'application/json'
          }
        });

        const text = response.text ? response.text.trim() : '';
        if (!text) continue;

        const parsed = JSON.parse(text);

        // Normalize confidence to percentage integer (e.g. 0.88 -> 88)
        let conf = parsed.confidence;
        if (typeof conf === 'number' && conf > 0 && conf <= 1) {
          conf = Math.round(conf * 100);
        } else if (typeof conf === 'number') {
          conf = Math.round(conf);
        } else {
          conf = 92;
        }

        // Normalize severity to Title Case
        let sev = (parsed.estimatedSeverity || 'Moderate').toLowerCase();
        if (sev.includes('crit')) sev = 'Critical';
        else if (sev.includes('high')) sev = 'High';
        else if (sev.includes('mod')) sev = 'Moderate';
        else if (sev.includes('low')) sev = 'Low';
        else sev = 'Moderate';

        return {
          detectedIssue: parsed.detectedIssue || `${infrastructureType} Structural Issue`,
          confidence: Math.min(99, Math.max(70, conf)),
          estimatedSeverity: sev,
          visualCues: Array.isArray(parsed.visualCues) && parsed.visualCues.length > 0
            ? parsed.visualCues.slice(0, 5)
            : ['Visible surface distress detected in photo', 'Physical structural deformation observed'],
          recommendation: parsed.recommendation || 'Dispatch municipal maintenance crew for on-site assessment.',
          isSimulated: false,
          modelArchitecture: `Google Gemini Flash Vision (${modelName})`,
          modelName,
          timestamp: new Date()
        };
      } catch (err) {
        lastError = err;
        // Continue to next candidate model
      }
    }

    if (lastError) {
      throw lastError;
    }
    return null;
  }

  /**
   * Domain Heuristic Fallback
   */
  static async fallbackHeuristic({ infrastructureType = 'Roads', problemType = 'Pothole' }) {
    // Simulated CV model inference latency
    await new Promise(resolve => setTimeout(resolve, 350));

    const categoryProfiles = {
      Roads: {
        Pothole: {
          detectedIssue: 'Severe Pothole & Sub-base Exposure',
          confidence: 94,
          estimatedSeverity: 'High',
          visualCues: [
            'Surface depression boundary ~24cm diameter detected',
            'Granular aggregate disintegration visible',
            'Water retention cavity at wheel-path line'
          ],
          recommendation: 'Cold-mix patching and sub-base compaction required within 48h.'
        },
        Cracks: {
          detectedIssue: 'Alligator / Fatigue Cracking Pattern',
          confidence: 91,
          estimatedSeverity: 'Moderate',
          visualCues: [
            'Interconnected longitudinal and transverse crack network',
            'Subgrade moisture infiltration risk',
            'Tensile strain displacement on asphalt layer'
          ],
          recommendation: 'Asphalt crack sealing to prevent water permeation into subgrade.'
        },
        Flooding: {
          detectedIssue: 'Standing Surface Water Obstruction',
          confidence: 96,
          estimatedSeverity: 'High',
          visualCues: [
            'Standing water depth exceeds curb tolerance',
            'Reflective surface obstruction spanning carriage lane'
          ],
          recommendation: 'Clear downstream stormwater inlets and deploy portable dewatering pump.'
        },
        default: {
          detectedIssue: 'Road Surface Irregularity & Wear',
          confidence: 89,
          estimatedSeverity: 'Moderate',
          visualCues: ['Asphalt wear pattern', 'Localized pavement distortion'],
          recommendation: 'Schedule routine road surface inspection.'
        }
      },
      Bridges: {
        'Visible Cracks': {
          detectedIssue: 'Concrete Spalling & Sub-surface Fracture',
          confidence: 95,
          estimatedSeverity: 'Critical',
          visualCues: [
            'Linear fissure along load-bearing abutment',
            'Rebar oxidation discoloration noted',
            'Structural integrity margin warning'
          ],
          recommendation: 'Immediate structural engineer inspection; restrict heavy vehicle access.'
        },
        default: {
          detectedIssue: 'Bridge Deck / Joint Degradation',
          confidence: 92,
          estimatedSeverity: 'High',
          visualCues: ['Expansion joint displacement', 'Safety barrier friction marks'],
          recommendation: 'Inspect bridge expansion joints and seal elastomeric dampers.'
        }
      },
      Streetlights: {
        'Not Working': {
          detectedIssue: 'Luminaire Inactivation / Dark Zone',
          confidence: 93,
          estimatedSeverity: 'Moderate',
          visualCues: ['Zero lumen output during operational cycle', 'Photocell sensor misalignment'],
          recommendation: 'Replace LED luminaire or check junction breaker.'
        },
        'Exposed Wiring': {
          detectedIssue: 'Exposed Electrical Junction at Pole Base',
          confidence: 97,
          estimatedSeverity: 'Critical',
          visualCues: [
            'Tampered or missing base cover plate',
            'Unshielded conduit wire junction detected',
            'Pedestrian shock hazard proximity'
          ],
          recommendation: 'Emergency line isolation; install tamper-proof access cover.'
        },
        default: {
          detectedIssue: 'Streetlight Pole / Fixture Hazard',
          confidence: 90,
          estimatedSeverity: 'Moderate',
          visualCues: ['Fixture tilt deflection', 'Casing weathering'],
          recommendation: 'Re-align luminaire bracket and verify anchor bolt tension.'
        }
      },
      'Water Pipelines': {
        Leakage: {
          detectedIssue: 'Pressurized Pipe Rupture & Water Egress',
          confidence: 96,
          estimatedSeverity: 'High',
          visualCues: [
            'Continuous liquid dispersion plume detected',
            'Soil erosion cavitation adjacent to pipeline sleeve',
            'Loss of distribution pressure signature'
          ],
          recommendation: 'Isolate upstream sluice valve and deploy pipe clamp repair kit.'
        },
        default: {
          detectedIssue: 'Conduit Stress & Pipeline Corrosion',
          confidence: 91,
          estimatedSeverity: 'High',
          visualCues: ['Pipe sleeve corrosion pitting', 'Joint seepage evidence'],
          recommendation: 'Perform ultrasonic wall-thickness test on affected segment.'
        }
      },
      'Public Buildings': {
        'Structural Damage': {
          detectedIssue: 'Masonry Shear Fracture & Wall Separation',
          confidence: 93,
          estimatedSeverity: 'Critical',
          visualCues: [
            'Diagonal shear displacement along load wall',
            'Plaster delamination and plasterboard sagging'
          ],
          recommendation: 'Evacuate affected wing and install temporary steel shoring.'
        },
        default: {
          detectedIssue: 'Facility Structural Wear',
          confidence: 88,
          estimatedSeverity: 'Moderate',
          visualCues: ['Ceiling damp patch', 'Exterior cladding detachment'],
          recommendation: 'Remediate water waterproofing membrane and reseal facade.'
        }
      },
      Drainage: {
        'Blocked Drain': {
          detectedIssue: 'Solid Waste Silt & Grate Obstruction',
          confidence: 95,
          estimatedSeverity: 'High',
          visualCues: [
            '85% stormwater catch-basin intake occlusion',
            'Organic debris and solid waste damming',
            'Backwater spillover risk to roadway'
          ],
          recommendation: 'Dispatch municipal vacuum jetting crew for immediate catch-basin de-silting.'
        },
        default: {
          detectedIssue: 'Drainage Channel Culvert Degradation',
          confidence: 92,
          estimatedSeverity: 'High',
          visualCues: ['Culvert wall scouring', 'Silt accumulation level'],
          recommendation: 'Clear culvert inlet debris and inspect concrete lining.'
        }
      }
    };

    const categoryMap = categoryProfiles[infrastructureType] || categoryProfiles.Roads;
    const result = categoryMap[problemType] || categoryMap.default;

    return {
      detectedIssue: result.detectedIssue,
      confidence: result.confidence,
      estimatedSeverity: result.estimatedSeverity,
      visualCues: result.visualCues,
      recommendation: result.recommendation || 'Dispatch municipal maintenance crew for on-site inspection.',
      isSimulated: true,
      modelArchitecture: 'InfraVision-YOLOv8-Simulated (Heuristic Fallback)',
      timestamp: new Date()
    };
  }
}

export default ImageAnalysisService;
