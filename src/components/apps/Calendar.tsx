import React, { useState, useEffect } from 'react';
import { useOSStore } from '../../store/osStore';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react';

interface Event {
    id: string;
    date: string; // YYYY-MM-DD
    title: string;
    time: string;
}

const CalendarApp: React.FC = () => {
    const { theme } = useOSStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [events, setEvents] = useState<Event[]>(() => {
        const saved = localStorage.getItem('ether-calendar-events');
        return saved ? JSON.parse(saved) : [];
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventTime, setNewEventTime] = useState('12:00');

    useEffect(() => {
        localStorage.setItem('ether-calendar-events', JSON.stringify(events));
    }, [events]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newDate);
    };

    const formatDateKey = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const addEvent = () => {
        if (!newEventTitle) return;
        const newEvent: Event = {
            id: Date.now().toString(),
            date: formatDateKey(selectedDate),
            title: newEventTitle,
            time: newEventTime,
        };
        setEvents([...events, newEvent]);
        setNewEventTitle('');
        setShowAddModal(false);
    };

    const deleteEvent = (id: string) => {
        setEvents(events.filter(e => e.id !== id));
    };

    const selectedDateKey = formatDateKey(selectedDate);
    const selectedDayEvents = events.filter(e => e.date === selectedDateKey);

    return (
        <div className={`flex h-full ${theme.isDarkMode ? 'text-white' : 'text-black'}`}>
            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col p-4 border-r border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">
                        {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex space-x-2">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 mb-4 opacity-50 text-sm font-medium text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day}>{day}</div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 flex-1 auto-rows-fr gap-2">
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: days }).map((_, i) => {
                        const day = i + 1;
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const isToday = new Date().toDateString() === date.toDateString();
                        const isSelected = selectedDate.toDateString() === date.toDateString();
                        const hasEvents = events.some(e => e.date === formatDateKey(date));

                        return (
                            <button
                                key={day}
                                onClick={() => handleDateClick(day)}
                                className={`
                                    relative rounded-xl flex items-center justify-center text-sm font-medium transition-all
                                    hover:bg-white/10
                                    ${isSelected ? 'bg-blue-500 text-white shadow-lg scale-105 z-10' : ''}
                                    ${!isSelected && isToday ? 'border border-blue-500 text-blue-500' : ''}
                                `}
                            >
                                {day}
                                {hasEvents && !isSelected && (
                                    <div className="absolute bottom-2 w-1 h-1 rounded-full bg-blue-400" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar / Event Details */}
            <div className={`w-80 flex flex-col p-6 ${theme.isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                <div className="mb-6">
                    <div className="text-4xl font-light mb-1">
                        {selectedDate.getDate()}
                    </div>
                    <div className="text-lg opacity-60">
                        {selectedDate.toLocaleDateString('default', { weekday: 'long' })}
                    </div>
                    <div className="text-sm opacity-40 uppercase tracking-wider mt-1">
                        {selectedDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold opacity-80">Events</h3>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3">
                    {selectedDayEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 opacity-30 text-center">
                            <CalendarIcon size={32} className="mb-2" />
                            <p className="text-sm">No events</p>
                        </div>
                    ) : (
                        selectedDayEvents.map(event => (
                            <div key={event.id} className="p-3 rounded-xl bg-white/10 group animate-in slide-in-from-right duration-300">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium text-sm">{event.title}</div>
                                        <div className="flex items-center mt-1 text-xs opacity-50">
                                            <Clock size={12} className="mr-1" />
                                            {event.time}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteEvent(event.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Event Modal Overlay */}
            {showAddModal && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl ${theme.isDarkMode ? 'bg-zinc-900 border border-white/10' : 'bg-white'}`}>
                        <h3 className="text-xl font-bold mb-4">Add Event</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs opacity-50 uppercase font-bold block mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                                    placeholder="Event Title"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-xs opacity-50 uppercase font-bold block mb-1">Time</label>
                                <input
                                    type="time"
                                    value={newEventTime}
                                    onChange={(e) => setNewEventTime(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="flex space-x-2 pt-2">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={addEvent}
                                    className="flex-1 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarApp;
