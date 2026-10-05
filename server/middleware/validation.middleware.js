import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

export const reportSchema = z.object({
  infrastructureType: z.enum([
    'Roads', 'Bridges', 'Streetlights', 'Water Pipelines', 'Public Buildings', 'Drainage'
  ]),
  problemType: z.string().min(2, 'Problem type is required'),
  severity: z.enum(['Low', 'Moderate', 'High', 'Critical']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.object({
    city: z.string().min(2, 'City is required'),
    area: z.string().min(2, 'Area / Locality is required'),
    street: z.string().min(2, 'Street / Road is required'),
    landmark: z.string().optional().default('')
  })
});

export const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().default('')
});

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMsg,
        errors: parsed.error.issues
      });
    }
    req.body = parsed.data;
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Validation error: ' + err.message
    });
  }
};
