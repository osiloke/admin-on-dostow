import React from 'react'
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
    LongTextInput,
} from 'admin-on-rest'
import { getDisplayField, validateInputForm } from '../Lib/Resource'
// import ListInput from '../Fields/ListInput'
import ramda from 'ramda'
export default ({ store }) => {
    const fields = store.properties ? Object.keys(store.properties) : []
    return props => (
        <Edit {...props} title={`Edit ${store.title || store.name}`}>
            <SimpleForm validate={validateInputForm(store)}>
                <DisabledInput label="Id" source="id" />
                {fields.map(field => {
                    const elem = store.properties[field]
                    const params = {
                        label: elem.title,
                        source: field,
                        key: `${elem.id}-${field}`,
                    }
                    if (elem.type === 'array')
                        return (
                            <TextInput
                                {...params}
                                format={v =>
                                    v !== undefined ? ramda.join(',', v) : v}
                                parse={v =>
                                    v !== undefined ? ramda.split(',', v) : v}
                            />
                        )
                    if (elem.ref && elem.ref.target !== '_static') {
                        return (
                            <ReferenceInput
                                allowEmpty
                                {...params}
                                label={elem.title || elem.ref.target}
                                reference={elem.ref.target}
                            >
                                <SelectInput
                                    optionText={record => (
                                        <span>
                                            {record
                                                ? getDisplayField(record, elem)
                                                : 'Select a ' + field}
                                        </span>
                                    )}
                                />
                            </ReferenceInput>
                        )
                    }
                    if (typeof elem.type === 'string') {
                        if (
                            elem.type === 'date-time' ||
                            elem.type === 'datetime'
                        )
                            return <DateInput {...params} />
                        if (elem.type === 'string') {
                            if (elem.format === 'long')
                                return <LongTextInput {...params} />
                            return (
                                <TextInput
                                    {...params}
                                    {...elem.format && { type: elem.format }}
                                />
                            )
                        }
                        if (elem.type === 'boolean')
                            return <BooleanInput {...params} />
                        if (
                            elem.type === 'number' ||
                            elem.type === 'float' ||
                            elem.type === 'integer'
                        )
                            return <NumberInput {...params} />
                    }
                    return <TextInput key={params.key} {...params} />
                })}
            </SimpleForm>
        </Edit>
    )
}
