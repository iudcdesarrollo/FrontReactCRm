import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import '../css/PaginationKanban.css';

const Pagination = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDate, setSelectedDate] = useState('');
    const totalPages = 10;

    const getPageNumbers = () => {
        const pages = [];
        const showPages = 5;

        let start = Math.max(1, currentPage - Math.floor(showPages / 2));
        const end = Math.min(totalPages, start + showPages - 1);

        if (end - start + 1 < showPages) {
            start = Math.max(1, end - showPages + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    return (
        <div className="pagination-wrapper">
            <div className="pagination-container">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="pagination-arrow"
                >
                    <ChevronLeft size={20} />
                </button>

                {getPageNumbers().map((pageNum) => (
                    <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`pagination-button ${pageNum === currentPage ? 'active' : ''}`}
                    >
                        {pageNum}
                    </button>
                ))}

                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="pagination-arrow"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="date-picker-container">
                <Calendar size={18} className="date-picker-icon" />
                <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="date-picker-input"
                />
            </div>
        </div>
    );
};

export default Pagination;