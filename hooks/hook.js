
import crypto from "crypto";

const getOTP = () => {
    return crypto.randomBytes(32).toString("hex").slice(0, 6);
};


const validateFields = (data, requiredFields) => {
    const missingFields = requiredFields.filter(
        (field) =>
            data[field] === undefined ||
            data[field] === null ||
            data[field] === ""
    );

    if (missingFields.length > 0) {
        return {
            valid: false,
            message: `${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"} required`,
        };
    }

    return {
        valid: true,
    };
};


export {
    getOTP,
    validateFields
}
