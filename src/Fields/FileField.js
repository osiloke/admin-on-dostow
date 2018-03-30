import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';

export const FileField = ({ elStyle, record, source, src }) => {
    const sourceValue = get(record, source);

    if (!sourceValue) {
        return <div />;
    }

    if (Array.isArray(sourceValue)) {
        return (
            <ul style={elStyle}>
                {sourceValue.map((file, index) => {
                    const titleValue = get(file, 'id') + get(file, '_e');
                    // const srcValue = get(file, src) || title;
                    return (
                        <li key={index}>
                            <a href={get(file, 'url')} title={titleValue}>
                                {titleValue}
                            </a>
                        </li>
                    );
                })}
            </ul>
        );
    }

    const titleValue = get(record, 'id') + get(record, '_e');

    return (
        <div style={elStyle}>
            <a href={get(record, 'url')} title={titleValue}>
                {titleValue}
            </a>
        </div>
    );
};

FileField.propTypes = {
    elStyle: PropTypes.object,
    record: PropTypes.object,
    source: PropTypes.string.isRequired,
    src: PropTypes.string,
    title: PropTypes.string
};

FileField.defaultProps = {
    elStyle: { display: 'inline-block' }
};

export default FileField;
