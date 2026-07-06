import { useState, useEffect, useMemo } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { formatDateTime } from '../utils/dateHelpers';

export default function DataTable({ data, totalCount, onEdit, onDelete, hasMore, onLoadMore }) {
    const [sorting, setSorting] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [isFetchingNext, setIsFetchingNext] = useState(false);

    const totalPages = Math.max(1, Math.ceil(totalCount / pagination.pageSize));

    const columns = useMemo(() => [
        {
            accessorKey: 'date',
            header: 'Tarih',
            size: 150,
            cell: info => <div className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate" title={formatDateTime(info.getValue())}>{formatDateTime(info.getValue())}</div>,
        },
        {
            accessorKey: 'description',
            header: 'Açıklama',
            size: 150,
            cell: info => {
                const text = (info.getValue() || info.row.original.categoryName).toLocaleLowerCase('tr-TR');
                return (
                    <div className="w-full overflow-hidden">
                        <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm capitalize truncate" title={text}>
                            {text}
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'categoryName',
            header: 'Kategori / İşyeri',
            size: 180,
            cell: info => (
                <div className="flex flex-col w-full overflow-hidden">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1.5 truncate">
                        {info.row.original.categoryIcon} <span className="truncate">{info.getValue()}</span>
                    </span>
                    {info.row.original.merchantName && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 ml-5 truncate">
                            ↳ {info.row.original.merchantName}
                        </span>
                    )}
                </div>
            )
        },
        {
            accessorKey: 'addedBy',
            header: 'Ekleyen',
            size: 100,
            cell: info => {
                const user = info.getValue()?.toLowerCase() || '';
                const isCeren = user.includes('ceren');
                const isUgur = user.includes('ugur') || user.includes('uğur');
                
                let badgeStyle = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
                if (isCeren) badgeStyle = "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
                if (isUgur) badgeStyle = "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";

                return (
                    <div className="truncate">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md capitalize tracking-wide ${badgeStyle}`}>
                            {info.getValue() || 'Bilinmiyor'}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'amount',
            header: () => <div className="text-right">Tutar</div>,
            size: 120,
            cell: info => {
                const row = info.row.original;
                return (
                    <div className="flex flex-col items-end w-full overflow-hidden">
                        <span className="font-bold text-gray-900 dark:text-gray-100 truncate w-full text-right">
                            {info.getValue()} {row.currencySymbol || '₺'}
                        </span>
                        {row.exchangeRate && row.exchangeRate !== 1 && (
                            <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">Kur: {row.exchangeRate}</span>
                        )}
                    </div>
                );
            }
        },
        {
            id: 'actions',
            header: '',
            size: 90,
            cell: info => (
                <div className="flex items-center justify-end gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => onEdit(info.row.original)}
                        className="text-gray-400 dark:text-gray-500 hover:text-blue-600 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-slate-700 p-1.5 text-xs rounded-lg transition shadow-sm border border-gray-100 dark:border-gray-700" 
                        title="Düzenle"
                    >✏️</button>
                    <button 
                        onClick={() => onDelete(info.row.original.id)}
                        className="text-gray-400 dark:text-gray-500 hover:text-red-600 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-slate-700 p-1.5 text-xs rounded-lg transition shadow-sm border border-gray-100 dark:border-gray-700" 
                        title="Sil"
                    >🗑️</button>
                </div>
            )
        }
    ], [onEdit, onDelete]);

    const table = useReactTable({
        data,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        autoResetPageIndex: false,
    });

    useEffect(() => {
        if (isFetchingNext) {
            const targetPage = pagination.pageIndex + 1;
            if (data.length > targetPage * pagination.pageSize) {
                table.setPageIndex(targetPage);
                setIsFetchingNext(false);
            }
        }
    }, [data.length, isFetchingNext, pagination.pageIndex, pagination.pageSize, table]);

    const handleNextPage = () => {
        if (table.getCanNextPage()) {
            table.nextPage();
        } else if (hasMore) {
            setIsFetchingNext(true);
            onLoadMore();
        }
    };

    return (
        // DİKKAT: Ana yükseklik senin ayarladığın 902px'e sabitlendi
        <div className="bg-white dark:bg-slate-800 rounded-2xl lg:rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col lg:h-[902px] transition-colors">
            
            <div className="overflow-x-auto flex-1 scrollbar-hide">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead className="bg-gray-50/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-slate-700">
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id} 
                                        style={{ width: header.getSize() !== 150 ? header.getSize() : 'auto' }}
                                        className="p-3 lg:p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition whitespace-nowrap select-none overflow-hidden"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        {/* EĞER SÜTUN 'amount' İSE SAĞA YASLA (justify-end), DEĞİLSE SOLA (justify-start) */}
                                        <div className={`flex items-center gap-1 ${header.id === 'amount' ? 'justify-end' : 'justify-start'}`}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted()] ?? null}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            // DİKKAT: lg:h-[76px] eklenerek satırların her birinin yüksekliği 10 satır = 760px olacak şekilde kusursuzca ayarlandı!
                            <tr key={row.id} className="lg:h-[76px] border-b border-gray-100 dark:border-slate-700/50 hover:bg-blue-50/30 dark:hover:bg-slate-700/30 transition group">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-3 py-2 lg:px-4 lg:py-0 align-middle overflow-hidden">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* mt-auto özelliği bu alanı her koşulda 902. pikselin dibine (en alta) yapıştırır */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-900/30 flex items-center justify-between mt-auto">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                    SAYFA {pagination.pageIndex + 1} / {totalPages}
                </span>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => table.previousPage()} 
                        disabled={!table.getCanPreviousPage()}
                        className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600 rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        Önceki
                    </button>
                    <button 
                        onClick={handleNextPage} 
                        disabled={(!table.getCanNextPage() && !hasMore) || isFetchingNext}
                        className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-slate-600 rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-30 disabled:hover:bg-transparent min-w-[80px]"
                    >
                        {isFetchingNext ? '...' : 'Sonraki'}
                    </button>
                </div>
            </div>
        </div>
    );
}