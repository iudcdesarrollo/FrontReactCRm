
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
    // Estado local para el datepicker
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Usar un identificador único para cada lista
    const paginationKey = `${listId}-pagination`;

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
        email,
        paginationKey
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
                    data-list-id={listId} // Añadir identificador de lista
                >
                    <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map((pageNum) => (
                    <button
                        key={`${listId}-${pageNum}`} // Añadir identificador único
                        onClick={() => handlePageChange(pageNum)}
                        className={`paginate-number ${pageNum === currentPage ? 'active' : ''}`}
                        data-list-id={listId}
                    >
                        {pageNum}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="paginate-nav-btn"
                    data-list-id={listId}
                >
                    <ChevronRight size={16} />
                </button>

                <div className="paginate-calendar-wrapper">
                    <button
                        className="paginate-calendar-btn"
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        data-list-id={listId}
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