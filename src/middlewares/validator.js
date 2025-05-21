const Joi = require('joi');

exports.signupSchema = Joi.object({
    email: Joi.string()
                .required()
                .min(4)
                .max(60),

    password: Joi.string()
                .required()
                .min(8)
                .max(60)
                .pattern(new RegExp('^[A-Za-z0-9!@#$%^&*()\\-+_\\[\\]{};:\'",.<>/?`~|\\\\]{8,60}$')), // 8-60 chars, no spaces, any keyboard special char

    phoneNumber: Joi.string()
                .required()
                .pattern(new RegExp('^\\+[1-9]\\d{1,14}$')), 
    
});

exports.loginSchema = Joi.object({
    email: Joi.string()
                .required()
                .min(4)
                .max(60),

    password: Joi.string()
                .required()
                .min(8)
                .max(60)
                .pattern(new RegExp('^[A-Za-z0-9!@#$%^&*()\\-+_\\[\\]{};:\'",.<>/?`~|\\\\]{8,60}$')), // 8-60 chars, no spaces, any keyboard special char

});

exports.acceptCodeSchema = Joi.object({
    email: Joi.string()
                .required()
                .min(4)
                .max(60),
    providedCode: Joi.number().required(),
});


exports.acceptResetPasswordSchema = Joi.object({
  email: Joi.string().required().min(4).max(60),
  newpassword: Joi.string()
    .required()
    .min(8)
    .max(60)
    .pattern(
      new RegExp("^[A-Za-z0-9!@#$%^&*()\\-+_\\[\\]{};:'\",.<>/?`~|\\\\]{8,60}$")
    ), // 8-60 chars, no spaces, any keyboard special char
  providedCode: Joi.number().required(),
});