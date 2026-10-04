import { validateFields } from '../hooks/hook.js';

const validateRequestFields = (requiredFields) => (req, res, next) => {
    const validationResult = validateFields(req.body ?? {}, requiredFields);

    if (!validationResult.valid) {
        return res.status(400).json({
            message: validationResult.message
        });
    }

    next();
};

export default validateRequestFields;
