import React from 'react'
import { List, Datagrid, TextField, TextInput, Filter, ReferenceInput, SelectInput, NumberField, BooleanField, ReferenceField, DateField, FunctionField, EditButton } from 'react-admin'
import { getDisplayField } from '../Lib/Resource'
import PropTypes from 'prop-types'

const Filters = (props) => {
    const { store } = props
    return (
        <Filter {...props}>
            <TextInput label="Search" source="q" alwaysOn />
            {(store.required || []).map((field) => (store.properties[field] && store.properties[field].ref) ?
                (<ReferenceInput
                    key={`${store.id}${field}`}
                    label={field}
                    source={field}
                    reference={store.properties[field].ref.target}
                    allowEmpty>
                    <SelectInput optionText={getDisplayField} />
                </ReferenceInput>) : <TextInput key={`${store.id}${field}`} source={field} />
            )}
        </Filter>
    )
};

Filters.propTypes = {
    store: PropTypes.string
}
export default ({ store }) => {
    const fields = store.properties ? Object.keys(store.properties) : []
    return (props) => (
        <List {...props } perPage={25} filters={<Filters store={store} />}>
            <Datagrid>
                <FunctionField
                    key={`${store.id}-id`}
                    label='id'
                    render={(record) => record.id.substring(0, 8)} />
                {(fields.length > 7 ? fields.slice(0, 7) : fields).map((field) => {
                    const elem = store.properties[field]
                    const params = {
                        key: `${store.id}-${field}`,
                        source: field
                    }
                    if (elem.ref && elem.ref.target !== '_static') {
                        return <TextField {...params} source={field} /> 
                    }
                    if (field === 'created_at') {
                        return <DateField {...params} source={field} />
                    }
                    if (typeof elem.type === 'string') {
                        if (elem.type === 'string') {
                            return <TextField {...params} source={field} />
                        }
                        if (elem.type === 'boolean')
                            return <BooleanField {...params} source={field} />
                        if (elem.type === 'number'
                            || elem.type === 'float'
                            || elem.type === 'integer')
                            return <NumberField {...params} source={field} />
                    }
                    return <TextField key={params.key} {...params} source={field} />
                })}
                <EditButton />
            </Datagrid>
        </List>)
}