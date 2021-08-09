import React from 'react';

const Description = ({title, desc}) => {
    return (
        <div className="description">
            <div className="description-title">
                <h2>{title}</h2>
            </div>
            <div className="description-body">
                <p>{desc}</p>
            </div>
        </div>
    );
}

export default Description;