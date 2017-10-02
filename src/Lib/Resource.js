export const getDisplayField = (row, elem) => {
    if (elem && elem.ref && elem.ref.display) {
        return row[elem.ref.display]
    }
    if (row.name) {
        return row.name
    }
    if (row.title) return row.title
    const keys = Object.keys(row)
    for (var index = 0; index < keys.length; index++) {
        const element = keys[index]
        const name = element.toLocaleLowerCase();
        if (name.includes('name'))
            return row[element]
        if (name.includes('desc'))
            return row[element]
    }
    return row.id
}

export const validateInputForm = (schema) => (values) => {
    const errors = {};
    if (!schema.required) return errors
    for (var index = 0; index < schema.required.length; index++) {
        var field = schema.required[index];
        if (!values[field])
            errors[field] = ['The ' + field + ' is required']
    }
    return errors
}