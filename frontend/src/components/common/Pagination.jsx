import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    totalElements, 
    pageSize 
}) => {
    // If there's only one page or no items, don't show pagination
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(0, currentPage - 2);
        let end = Math.min(totalPages - 1, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(0, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                        currentPage === i
                            ? 'bg-blue-600 text-white shadow-md scale-105'
                            : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                    {i + 1}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white border-t border-gray-100 sm:px-6 mt-4">
            <div className="flex-1 flex justify-between sm:hidden w-full mb-4 sm:mb-0">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                    Previous
                </button>
                <div className="text-sm text-gray-700 self-center">
                    Page {currentPage + 1} of {totalPages}
                </div>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                    Next
                </button>
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{Math.min(currentPage * pageSize + 1, totalElements)}</span> to{' '}
                        <span className="font-medium">
                            {Math.min((currentPage + 1) * pageSize, totalElements)}
                        </span>{' '}
                        of <span className="font-medium">{totalElements}</span> results
                    </p>
                </div>
                
                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => onPageChange(0)}
                        disabled={currentPage === 0}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-all text-gray-500 hover:text-blue-600 disabled:hover:text-gray-500"
                        title="First Page"
                    >
                        <ChevronsLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-all text-gray-500 hover:text-blue-600 disabled:hover:text-gray-500"
                        title="Previous Page"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center space-x-1 px-1">
                        {renderPageNumbers()}
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-all text-gray-500 hover:text-blue-600 disabled:hover:text-gray-500"
                        title="Next Page"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onPageChange(totalPages - 1)}
                        disabled={currentPage === totalPages - 1}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-all text-gray-500 hover:text-blue-600 disabled:hover:text-gray-500"
                        title="Last Page"
                    >
                        <ChevronsRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
