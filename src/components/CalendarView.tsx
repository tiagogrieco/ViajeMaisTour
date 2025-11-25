import React, { useMemo } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plane, CheckCircle2, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgendaItem } from '@/types';
import { Badge } from '@/components/ui/badge';

interface CalendarViewProps {
    events: AgendaItem[];
    currentDate: Date;
    onDateChange: (date: Date) => void;
    onEventClick: (event: AgendaItem) => void;
    onDayClick: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
    events,
    currentDate,
    onDateChange,
    onEventClick,
    onDayClick
}) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = useMemo(() => {
        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [startDate, endDate]);

    const getDayEvents = (day: Date) => {
        return events.filter(event => {
            // Adjust for timezone issues if necessary, but simple string comparison works if format matches
            // Assuming event.data is YYYY-MM-DD
            const eventDate = new Date(event.data);
            // Fix timezone offset issue by treating the string as local date
            // Or simpler: compare date strings
            const dayString = format(day, 'yyyy-MM-dd');
            return event.data === dayString;
        });
    };

    const getEventColor = (event: AgendaItem) => {
        const title = event.titulo.toLowerCase();
        if (title.includes('check-in') || title.includes('checkin')) return 'bg-purple-100 text-purple-800 border-purple-200';
        if (title.includes('viagem') || title.includes('embarque')) return 'bg-green-100 text-green-800 border-green-200';
        if (title.includes('retorno') || title.includes('chegada')) return 'bg-orange-100 text-orange-800 border-orange-200';
        if (event.status === 'Cancelado') return 'bg-red-100 text-red-800 border-red-200';
        return 'bg-blue-100 text-blue-800 border-blue-200';
    };

    const nextMonth = () => onDateChange(addMonths(currentDate, 1));
    const prevMonth = () => onDateChange(subMonths(currentDate, 1));
    const goToToday = () => onDateChange(new Date());

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold capitalize text-gray-900">
                        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </h2>
                    <div className="flex gap-1">
                        <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <Button variant="outline" onClick={goToToday}>
                    Hoje
                </Button>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                {/* Header dos dias da semana */}
                {weekDays.map(day => (
                    <div key={day} className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-500">
                        {day}
                    </div>
                ))}

                {/* Dias do calendário */}
                {calendarDays.map((day, dayIdx) => {
                    const dayEvents = getDayEvents(day);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isTodayDate = isToday(day);

                    return (
                        <div
                            key={day.toString()}
                            className={`min-h-[120px] bg-white p-2 transition-colors hover:bg-gray-50 cursor-pointer flex flex-col gap-1
                ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : ''}
                ${isTodayDate ? 'bg-blue-50/30' : ''}
              `}
                            onClick={() => onDayClick(day)}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`
                  text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full
                  ${isTodayDate ? 'bg-blue-600 text-white' : ''}
                `}>
                                    {format(day, 'd')}
                                </span>
                                {dayEvents.length > 0 && (
                                    <span className="text-xs text-gray-400 font-medium">{dayEvents.length}</span>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[100px] scrollbar-hide">
                                {dayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick(event);
                                        }}
                                        className={`
                      text-xs p-1.5 rounded border truncate cursor-pointer transition-all hover:opacity-80
                      ${getEventColor(event)}
                    `}
                                        title={`${event.hora} - ${event.titulo}`}
                                    >
                                        <div className="font-semibold truncate">{event.titulo}</div>
                                        <div className="text-[10px] opacity-80 truncate">{event.hora} • {event.cliente.split(' ')[0]}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
