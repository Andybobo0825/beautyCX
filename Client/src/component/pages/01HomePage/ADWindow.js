import AD1 from "./pic/AD1.jpg";

const ADWindow = ({ isOpen, onClose }) => {
    
    // 判斷是否顯示
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="modal fade show"
            tabIndex="-1"
            role="dialog"
            style={{ 
                display: 'block', 
                backgroundColor: 'rgba(0,0,0,0.5)', 
                zIndex: 9999 
            }}
        >
            <div 
                className="modal-dialog modal-dialog-centered" 
                role="document"
                style={{ margin: '1.75rem auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content">
                    <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h5 className="modal-title">最新消息</h5>

                        <button
                            type="button"
                            className="close"
                            onClick={onClose}
                            aria-label="Close"
                            style={{
                                background: "transparent",
                                border: "none",
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                                color: "#000",
                                opacity: "0.5",
                                cursor: "pointer"
                            }}
                        >
                        &times;
                        </button>
                    </div>

                    <div className="modal-body">
                        <img 
                            src={AD1} 
                            alt="Advertisement" 
                            style={{ 
                                width: "100%", 
                                height: "auto", // 讓高度依照圖片比例自動調整
                                display: "block"
                            }} 
                        />
                    </div>

                    {/* Footer */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            太棒了!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ADWindow;