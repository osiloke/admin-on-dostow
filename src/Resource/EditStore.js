import React from 'react';
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
    FileField,
    LongTextInput
} from 'admin-on-rest';
import {
    // getDisplayField,
    validateInputForm
} from '../Lib/Resource';
// import ListInput from '../Fields/ListInput'
import ramda from 'ramda';
import { Field } from 'redux-form';

const UploadableFile = props => {
    const { params, elem, field, record, resource, basePath } = props;
    const input = {
        value: record[field] && record[field][0] ? record[field][0].id : null
    };
    return (
        <Field
            name={'file'}
            component={fprops => {
                return (
                    <div key={`container-${record.id}-${field}`}>
                        <ReferenceInput
                            {...fprops}
                            label={elem.title}
                            input={input}
                            key={`select-${record.id}-${field}`}
                            source={`${field}.id`}
                            record={record}
                            basePath={basePath}
                            resource={resource}
                            reference={elem.ref.target}
                        >
                            <SelectInput optionText="id" />
                        </ReferenceInput>
                        <FileInput
                            {...fprops}
                            label={elem.title}
                            input={input}
                            key={`file-${record.id}-${elem.title}`}
                            source={field}
                            meta={{ name: 'name' }}
                            record={record}
                            resource={resource}
                        >
                            <FileField
                                record={record}
                                source="src"
                                title="title"
                            />
                        </FileInput>
                    </div>
                );
            }}
        />
    );
};
export default ({ store }) => {
    const fields = store.properties ? Object.keys(store.properties) : [];
    return props => {
        return (
            <Edit {...props}>
                <SimpleForm validate={validateInputForm(store)}>
                    <DisabledInput label="Id" source="id" />
                    {fields.map(field => {
                        const elem = store.properties[field];
                        const params = {
                            label: elem.title,
                            source: field,
                            key: `${elem.id || elem.name}-${field}`
                        };
                        if (elem.type === 'object') {
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
                        if (elem.type === 'array')
                            return (
                                <TextInput
                                    {...params}
                                    format={v =>
                                        v !== undefined ? ramda.join(',', v) : v
                                    }
                                    parse={v =>
                                        v !== undefined
                                            ? ramda.split(',', v)
                                            : v
                                    }
                                />
                            );
                        if (elem.ref) {
                            if (elem.ref.target === 'static') {
                                return (
                                    <UploadableFile
                                        key={params.key}
                                        elem={elem}
                                        params={params}
                                        field={field}
                                    />
                                );
                            }
                            if (elem.ref.dynamic === true) {
                                //get dynamic path {{.dynamic.path}}
                                const s = elem.ref.target.indexOf('{');
                                const e = elem.ref.target.indexOf('}');
                                const path = elem.ref.target.slice(
                                    s + 1,
                                    e - 1
                                );
                                return null;
                            }
                            return (
                                <ReferenceInput
                                    {...params}
                                    reference={elem.ref.target}
                                >
                                    <SelectInput optionText="name" />
                                </ReferenceInput>
                            );
                        }
                        if (typeof elem.type === 'string') {
                            if (
                                elem.type === 'date-time' ||
                                elem.type === 'datetime'
                            )
                                return <DateInput {...params} />;
                            if (elem.type === 'string') {
                                if (elem.format === 'long')
                                    return <LongTextInput {...params} />;
                                return <TextInput {...params} />;
                            }
                            if (elem.type === 'boolean')
                                return <BooleanInput {...params} />;
                            if (
                                elem.type === 'number' ||
                                elem.type === 'float' ||
                                elem.type === 'integer'
                            )
                                return <NumberInput {...params} />;
                        }
                        return <TextInput key={params.key} {...params} />;
                    })}
                </SimpleForm>
            </Edit>
        );
    };
};
