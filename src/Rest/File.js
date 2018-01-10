import { UPLOAD_FILE } from './RestClient';
/**
 * Convert a `File` object returned by the upload input into
 * a base 64 string. That's easier to use on FakeRest, used on
 * the ng-admin example. But that's probably not the most optimized
 * way to do in a production database.
 */
export const convertFileToBase64 = file =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => resolve({ file64: reader.result, file });
        reader.onerror = reject;
    });

/**
 * For posts update only, convert uploaded image in base 64 and attach it to
 * the `file` sent property, with `src` and `title` attributes.
 */
export const addUploadCapabilities = (stores, requestHandler) => {
    var storeNameSchema = {};
    var storeWithStatic = {};
    for (var i = 0; i < stores.length; i++) {
        const store = stores[i];
        storeNameSchema[store.name] = store;
        const propKeys = Object.keys(store.properties);

        for (var ii = 0; ii < propKeys.length; ii++) {
            const name = propKeys[ii];
            const field = store.properties[name];
            if (field.ref && field.ref.target === 'static') {
                if (!storeWithStatic[store.name]) {
                    storeWithStatic[store.name] = [{ ...field, name }];
                } else {
                    storeWithStatic[store.name].push({ ...field, name });
                }
            }
        }
    }
    return (type, resource, params) => {
        // const curStore = storeNameSchema[resource];
        if (type === 'UPDATE') {
            const fields = storeWithStatic[resource];
            if (fields) {
                for (var i = 0; i < fields.length; i++) {
                    const field = fields[i];
                    const fieldName = field.name;
                    if (params.data[fieldName]) {
                        // check if static field is available
                        // only freshly dropped files are instance of File
                        const formerFiles = params.data[fieldName].filter(
                            p => !(p instanceof File)
                        );
                        const newFiles = params.data[fieldName].filter(
                            p => p instanceof File
                        );

                        return Promise.all(
                            params.data[fieldName].map(f =>
                                convertFileToBase64(f.rawFile)
                            )
                        )
                            .then(base64Files =>
                                base64Files.map(({ file64, file }) => ({
                                    uri: file64,
                                    raw: file,
                                    size: file.size,
                                    lastmodified: file.lastmodified,
                                    type: file.type,
                                    name: file.name
                                }))
                            )
                            .then(transformedNewFiles =>
                                requestHandler(UPLOAD_FILE, resource, {
                                    files: transformedNewFiles,
                                    id: params.id,
                                    field: fieldName
                                })
                            )
                            .then(resp => {
                                delete params.data[fieldName];
                                return requestHandler(type, resource, params);
                            });
                    }
                }
            }
        }

        return requestHandler(type, resource, params);
    };
};
// export default addUploadCapabilities;
