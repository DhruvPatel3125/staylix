import Joi from 'joi';

export const loginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email is required',
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.empty': 'Password is required',
        }),
});

export const registerSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 50 characters',
            'string.empty': 'Name is required',
        }),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email is required',
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.empty': 'Password is required',
        }),
    role: Joi.string().valid('user', 'owner', 'admin').default('user'),
});

export const hotelSchema = Joi.object({
    name: Joi.string().required().min(3),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    pincode: Joi.string().required(),
    description: Joi.string().allow(''),
    amenities: Joi.string().allow(''),
    photos: Joi.any()
});

export const bookingSchema = Joi.object({
    checkIn: Joi.date().required().greater('now').message('Check-in date must be in the future'),
    checkOut: Joi.date().required().greater(Joi.ref('checkIn')).message('Check-out date must be after check-in'),
    guests: Joi.number().min(1).required(),
    discountCode: Joi.string().allow('').optional(),
});

export const validate = (schema, data) => {
    const { error } = schema.validate(data, { abortEarly: false });
    if (!error) return null;

    const errors = {};
    error.details.forEach((detail) => {
        errors[detail.path[0]] = detail.message;
    });
    return errors;
};
