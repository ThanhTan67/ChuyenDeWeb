import React from 'react';

const Comments = () => {
    return (
        <div className="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">
            <div className="row">
                <div className="col-lg-6">
                    <div className="comment_list">
                        <div className="review_item">
                            <div className="media">
                                <div className="d-flex">
                                    <img src="img/product/single-product/review-1.png" alt="" />
                                </div>
                                <div className="media-body">
                                    <h4>Blake Ruiz</h4>
                                    <h5>12th Feb, 2017 at 05:56 pm</h5>
                                    <a className="reply_btn" href="#">Reply</a>
                                </div>
                            </div>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                                sed do eiusmod tempor incididunt ut labore et dolore magna
                                aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                                ullamco laboris nisi ut aliquip ex ea commodo
                            </p>
                        </div>
                        <div className="review_item reply">
                            <div className="media">
                                <div className="d-flex">
                                    <img src="img/product/single-product/review-2.png" alt="" />
                                </div>
                                <div className="media-body">
                                    <h4>Blake Ruiz</h4>
                                    <h5>12th Feb, 2017 at 05:56 pm</h5>
                                    <a className="reply_btn" href="#">Reply</a>
                                </div>
                            </div>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                                sed do eiusmod tempor incididunt ut labore et dolore magna
                                aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                                ullamco laboris nisi ut aliquip ex ea commodo
                            </p>
                        </div>
                        <div className="review_item">
                            <div className="media">
                                <div className="d-flex">
                                    <img src="img/product/single-product/review-3.png" alt="" />
                                </div>
                                <div className="media-body">
                                    <h4>Blake Ruiz</h4>
                                    <h5>12th Feb, 2017 at 05:56 pm</h5>
                                    <a className="reply_btn" href="#">Reply</a>
                                </div>
                            </div>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                                sed do eiusmod tempor incididunt ut labore et dolore magna
                                aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                                ullamco laboris nisi ut aliquip ex ea commodo
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Comments;