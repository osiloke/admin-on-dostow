import React from "react";
import {
    Edit,
    SimpleForm,
    DisabledInput,
    SelectInput,
    ReferenceInput,
    BooleanInput,
    NumberInput,
    TextInput,
    DateInput,
    FileInput,
    // FileField,
    LongTextInput
} from "react-admin";
import {
    getDisplayField,
    validateInputForm
} from "../Lib/Resource";
import FileField from "../Fields/FileField";
// import FileInput from '../Fields/FileInput';
// import ListInput from '../Fields/ListInput'
import ramda from "ramda";
export default ({ store }) => {
    const fields = store.properties ? Object.keys(store.properties) : [];
    return props => (
        <Edit {...props}>
            <SimpleForm validate={validateInputForm(store)}>
                <DisabledInput label="Id" source="id" />
                {fields.map(field => {
                    const elem = store.properties[field];
                    const params = {
                        label: elem.title,
                        source: field,
                        key: `${elem.id}-${field}`
                    };
                    if (elem.type === "object") {
                        return (
                            <TextInput
                                {...params}
                                parse={v => {
                                    let val;
                                    try {
                                        val = JSON.parse(v);
                                    } catch (error) {
                                        val = v;
                                    }
                                    return val;
                                }}
                                format={v =>
                                    v !== undefined ? JSON.stringify(v) : v
                                }
                            />
                        );
                    }
                    if (elem.type === "array")
                        return (
                            <TextInput
                                {...params}
                                format={v =>
                                    v !== undefined ? ramda.join(",", v) : v
                                }
                                parse={v =>
                                    v !== undefined ? ramda.split(",", v) : v
                                }
                            />
                        );
                    if (elem.ref) {
                        if (elem.ref.target === "static") {
                            return (
                                <FileInput
                                    label={elem.title}
                                    source={field}
                                    key={`${elem.id}-${field}`}
                                >
                                    <FileField source="id" title="url" />
                                </FileInput>
                            );
                        }
                        if (elem.ref.dynamic === true) {
                            //get dynamic path {{.dynamic.path}}
                            const s = elem.ref.target.indexOf("{");
                            const e = elem.ref.target.indexOf("}");
                            const path = elem.ref.target.slice(s + 1, e - 1);
                            return null;
                        }
                        return (
                            <ReferenceInput
                                {...params}
                                allowEmpty
                                reference={elem.ref.target}
                            >
                                <SelectInput
                                    optionText={record => (
                                        <span>
                                            {getDisplayField(record, elem)}
                                        </span>
                                    )}
                                />
                            </ReferenceInput>
                        );
                        // return <TextInput key={params.key} {...params} />;
                    }
                    if (typeof elem.type === "string") {
                        if (
                            elem.type === "date-time" ||
                            elem.type === "datetime"
                        )
                            return <DateInput {...params} />;
                        if (elem.type === "string") {
                            if (elem.format === "long")
                                return <LongTextInput {...params} />;
                            return <TextInput {...params} />;
                        }
                        if (elem.type === "boolean")
                            return <BooleanInput {...params} />;
                        if (
                            elem.type === "number" ||
                            elem.type === "float" ||
                            elem.type === "integer"
                        )
                            return <NumberInput {...params} />;
                    }
                    return <TextInput key={params.key} {...params} />;
                })}
            </SimpleForm>
        </Edit>
    );
};
