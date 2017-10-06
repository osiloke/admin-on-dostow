import React from 'react'
import {
    List,
    Datagrid,
    TextField,
    TextInput,
    ReferenceInput,
    Filter,
    ReferenceField,
    SelectInput,
    NumberField,
    BooleanField,
    DateField,
    FunctionField,
    EditButton,
    DeleteButton,
} from 'admin-on-rest'
import { getDisplayField } from '../Lib/Resource'

const makeFilters = storeDef => props => {
    const fields =
        storeDef.required && storeDef.required.length > 0
            ? [
                  // <TextInput key="search" label="Search" source="q" alwaysOn />,
                  ...storeDef.required.map(
                      field =>
                          storeDef.properties[field] &&
                          storeDef.properties[field].ref ? (
                              <ReferenceInput
                                  key={`${storeDef.name}${field}`}
                                  label={field}
                                  source={field}
                                  reference={
                                      storeDef.properties[field].ref.target
                                  }
                                  allowEmpty
                              >
                                  <SelectInput optionText={getDisplayField} />
                              </ReferenceInput>
                          ) : (
                              <TextInput
                                  key={`${storeDef.name}${field}`}
                                  source={field}
                              />
                          )
                  ),
              ]
            : [<TextInput key="search" label="Search" source="q" alwaysOn />]
    return <Filter {...props}>{fields}</Filter>
}

const ListStore = ({ store }) => {
    const hidden = store.hidden || []
    const fields = store.properties
        ? Object.keys(store.properties).filter(w => hidden.indexOf(w) == -1)
        : []
    const Filters = makeFilters(store)
    return props => (
        <List
            {...props}
            title={store.title}
            perPage={25}
            filters={<Filters store={store} />}
        >
            <Datagrid>
                <FunctionField
                    key={`${store.name}-id`}
                    label="id"
                    render={record =>
                        record.id ? record.id.substring(0, 8) : 'id'}
                />
                {(fields.length > 7
                    ? fields.slice(0, 7)
                    : fields
                ).map(field => {
                    const elem = store.properties[field]
                    const params = {
                        key: `${store.id}-${field}`,
                        source: field,
                        sortable: false,
                    }
                    if (elem.ref && elem.ref.target !== '_static') {
                        return (
                            <ReferenceField
                                {...params}
                                label={elem.title || elem.name}
                                reference={elem.ref.target}
                                source={field}
                            >
                                <FunctionField
                                    {...params}
                                    render={record => (
                                        <span>
                                            {getDisplayField(record, elem)}
                                        </span>
                                    )}
                                />
                            </ReferenceField>
                        )
                    }
                    if (field === 'created_at') {
                        return <DateField {...params} source={field} />
                    }
                    if (field === 'modified_at') {
                        return <DateField {...params} source={field} />
                    }
                    if (typeof elem.type === 'string') {
                        if (elem.type === 'string') {
                            return <TextField {...params} source={field} />
                        }
                        if (elem.type === 'boolean')
                            return <BooleanField {...params} source={field} />
                        if (
                            elem.type === 'number' ||
                            elem.type === 'float' ||
                            elem.type === 'integer'
                        )
                            return <NumberField {...params} source={field} />
                    }
                    return (
                        <TextField
                            key={params.key}
                            {...params}
                            source={field}
                        />
                    )
                })}
                <EditButton />
                <DeleteButton />
            </Datagrid>
        </List>
    )
}

export default ListStore
