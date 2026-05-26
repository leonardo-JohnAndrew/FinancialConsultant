export async function validationRequiredFields(requiredFields, inputvalue) {
  let missingFields = {};

  if (!inputvalue) return;

  for (const item of inputvalue) {
    let missing = [];
    requiredFields?.forEach((fields) => {
      if (!item[fields]) {
        missing.push(`${fields} is required`);
      } else {
        const currentItem = item[fields].trim();
        if (currentItem === undefined || currentItem === null || !currentItem) {
          missing.push(`${fields} is required`);
        }
      }
    });
    if (missing.length > 0) {
      missingFields[`data ${inputvalue.indexOf(item) + 1}`] = missing;
    }
  }
  return missingFields;
}
export async function validateFields(requiredFields, inputs) {
  let missingFields = [];

  // validate object
  if (!inputs || typeof inputs !== "object" || Array.isArray(inputs)) {
    return {
      error: ["Input must be an object"],
    };
  }

  // check required fields
  requiredFields.forEach((field) => {
    const value = inputs[field];

    if (value === undefined || value === null || String(value).trim() === "") {
      missingFields.push(`${field} is required`);
    }
  });

  return missingFields;
}
export const validateRequiredFields = (values, requiredFields) => {
  const errors = {};

  requiredFields.forEach((field) => {
    const value = values[field.name];

    // required validation
    if (
      field.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors[field.name] = field.message || `${field.label} is required`;

      return;
    }

    // number validation
    if (
      field.type === "number" &&
      value !== "" &&
      value !== null &&
      isNaN(Number(value))
    ) {
      errors[field.name] =
        field.invalidMessage || `${field.label} must be a valid number`;

      return;
    }

    // minimum validation
    if (field.min !== undefined && Number(value) < field.min) {
      errors[field.name] =
        field.minMessage || `${field.label} must be at least ${field.min}`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
