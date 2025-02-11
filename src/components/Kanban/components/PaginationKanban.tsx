import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { ListId } from '../../Kanban/@types/kanban';
import "react-datepicker/dist/react-datepicker.css";
import '../css/PaginationKanban.css';
import { usePaginatedSales } from './usePaginatedSales';

interface PaginationProps {
    listId: ListId;
    email: string;
}

const Pagination = ({ listId, email }: PaginationProps) => {
    const [showDatePicker, setShowDatePicker] = useState(false);

    const {
        currentPage,
        totalPages,
        isLoading,
        selectedDate,
        handlePageChange,
        handleDateChange
    } = usePaginatedSales({
        listId,
        initialPage: 1,
        itemsPerPage: 5,
        email: email
    });

    const getPageNumbers = () => {
        const pages = [];
        const showPages = 3;

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

    const onDateChange = (date: Date | null) => {
        handleDateChange(date);
        setShowDatePicker(false);
    };

    if (isLoading) {
        return <div className="paginate-loading">Cargando...</div>;
    }

    return (
        <div className="paginate-container">
            <div className="paginate-content">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="paginate-nav-btn"
                >
                    <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map((pageNum) => (
                    <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`paginate-number ${pageNum === currentPage ? 'active' : ''}`}
                    >
                        {pageNum}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="paginate-nav-btn"
                >
                    <ChevronRight size={16} />
                </button>

                <div className="paginate-calendar-wrapper">
                    <button
                        className="paginate-calendar-btn"
                        onClick={() => setShowDatePicker(!showDatePicker)}
                    >
                        <Calendar size={16} />
                    </button>
                    {showDatePicker && (
                        <div className="paginate-calendar-dropdown">
                            <DatePicker
                                selected={selectedDate}
                                onChange={onDateChange}
                                inline
                                dateFormat="dd/MM/yyyy"
                                locale="es"
                                calendarClassName="paginate-calendar"
                                monthsShown={1}
                                showPopperArrow={false}
                                fixedHeight
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Pagination;