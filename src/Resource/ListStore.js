import React from "react";
import {
    List,
    Datagrid,
    TextField,
    TextInput,
    Filter,
    ReferenceInput,
    SelectInput,
    NumberField,
    BooleanField,
    DateField,
    FunctionField,
    EditButton,
    ReferenceField,
    DeleteButton
} from "react-admin";
import { getDisplayField } from "../Lib/Resource";
// import PropTypes from "prop-types";

const makeFilters = storeDef => props => {
    const fields = [
        <TextInput key="search" label="Search" source="q" alwaysOn />,
        ...(storeDef.required || []).map(
            field =>
                storeDef.properties[field] && storeDef.properties[field].ref ? (
                    <ReferenceInput
                        key={`${storeDef.name}${field}`}
                        label={field}
                        source={field}
                        reference={storeDef.properties[field].ref.target}
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
        )
    ];
    return <Filter {...props}>{fields}</Filter>;
};

const ListStore = ({ store }) => {
    const fields = store.properties ? Object.keys(store.properties) : [];
    const Filters = makeFilters(store);
    return props => (
        <List
            {...props}
            title={store.title || store.name}
            perPage={25}
            filters={<Filters store={store} />}
        >
            <Datagrid>
                <FunctionField
                    key={`${store.id}-id`}
                    label="id"
                    render={record => record.id.substring(0, 8)}
                />
                {(fields.length > 6 ? fields.slice(0, 6) : fields).map(
                    field => {
                        const elem = store.properties[field];
                        const params = {
                            key: `${store.id}-${field}`,
                            source: field
                        };
                        if (elem.type === "object")
                            return (
                                <FunctionField
                                    {...params}
                                    render={record => (
                                        <span>
                                            {JSON.stringify(record[field])}
                                        </span>
                                    )}
                                />
                            );
                        if (elem.ref && elem.ref.target) {
                            // return <TextField {...params} source={field} />;
                            if (elem.ref.include && elem.ref.include === true) {
                                return (
                                    <FunctionField
                                        {...params}
                                        render={record => {
                                            const included = record[field];
                                            if (included) {
                                                if (
                                                    elem.ref.target === "static"
                                                ) {
                                                    return (
                                                        <a
                                                            href={
                                                                included[0].url
                                                            }
                                                        >{`${included[0].id}${
                                                            included[0]._e
                                                            }`}</a>
                                                    );
                                                }
                                                return (
                                                    <span>
                                                        {getDisplayField(
                                                            record[field],
                                                            elem
                                                        )}
                                                    </span>
                                                );
                                            }
                                            return <span>none</span>;
                                        }}
                                    />
                                );
                            } else {
                                return (
                                    <ReferenceField
                                        {...params}
                                        reference={elem.ref.target}
                                    >
                                        <FunctionField
                                            render={record => (
                                                <span>
                                                    {getDisplayField(record, elem)}
                                                </span>
                                            )}
                                        />
                                    </ReferenceField>
                                );
                            }
                            // return (
                            //     <FunctionField
                            //         render={record => (
                            //             <span>
                            //                 {getDisplayField(record, elem)}
                            //             </span>
                            //         )}
                            //     />
                            // );
                        }
                        if (field === "created_at") {
                            return <DateField {...params} source={field} />;
                        }
                        if (typeof elem.type === "string") {
                            if (elem.type === "string") {
                                return <TextField {...params} source={field} />;
                            }
                            if (elem.type === "boolean")
                                return (
                                    <BooleanField {...params} source={field} />
                                );
                            if (
                                elem.type === "number" ||
                                elem.type === "float" ||
                                elem.type === "integer"
                            )
                                return (
                                    <NumberField {...params} source={field} />
                                );
                        }
                        // return (
                        //     <TextField
                        //         key={params.key}
                        //         {...params}
                        //         source={field}
                        //     />
                        // );
                        return (
                            <FunctionField
                                key={`${store.id}-id`}
                                render={record => {
                                    if (typeof record == "string") {
                                        return (
                                            <TextField
                                                key={params.key}
                                                {...params}
                                                source={field}
                                            />
                                        );
                                    }
                                    return (
                                        <span>
                                            {getDisplayField(record, elem)}
                                        </span>
                                    );
                                }}
                            />
                        );
                    }
                )}

                <DateField key={`${store.id}-createdat`} source="created_at" />
                <EditButton basePath="/" />
                <DeleteButton basePath="/" />
            </Datagrid>
        </List>
    );
};

export default ListStore;
