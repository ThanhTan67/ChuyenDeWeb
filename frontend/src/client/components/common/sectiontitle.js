import React from 'react';

const SectionTitle = ({ title, spanText }) => {
    return (
        <div className="row justify-content-center">
            <div className="col-lg-12">
                <div className="section_tittle text-center">
                    <h2>
                        {title} {spanText && <span>{spanText}</span>}
                    </h2>
                </div>
            </div>
        </div>
    );
};

export default SectionTitle;