import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../store';
import { PlayIcon, PauseIcon, ResetIcon, ChevronRightIcon } from '../../components/Icons';
import { useTranslation } from '../../hooks/useTranslation';

const PomodoroTimer: React.FC = () => {
    const { settings, setSettings } = useStore();
    const { t } = useTranslation();
    
    const [isWorkSession, setIsWorkSession] = useState(true);
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(settings.pomodoroWork * 60);

    const totalDuration = isWorkSession ? settings.pomodoroWork * 60 : settings.pomodoroBreak * 60;
    
    const resetTimer = useCallback((switchToWork = true) => {
        setIsActive(false);
        setIsWorkSession(switchToWork);
        const newDuration = switchToWork ? settings.pomodoroWork * 60 : settings.pomodoroBreak * 60;
        setTimeLeft(newDuration);
    }, [settings.pomodoroWork, settings.pomodoroBreak]);
    
    useEffect(() => {
        resetTimer(isWorkSession);
    }, [settings.pomodoroWork, settings.pomodoroBreak, isWorkSession, resetTimer]);

    useEffect(() => {
        let interval: number | null = null;
        if (isActive && timeLeft > 0) {
            interval = window.setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            new Notification(t(isWorkSession ? 'pomodoro_work_session_over' : 'pomodoro_break_session_over'));
            setIsActive(false);
            setIsWorkSession(prev => !prev);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, isWorkSession, t]);
    
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
    const circumference = 2 * Math.PI * 90; // 90 is the radius
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="flex flex-col items-center justify-center p-4 gap-6">
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                <div>
                    <label htmlFor="pomodoro-work" className="block text-sm text-center font-medium text-muted-foreground">{t('pomodoro_work_label')}</label>
                    <input 
                        type="number" 
                        id="pomodoro-work" 
                        value={settings.pomodoroWork} 
                        onChange={e => setSettings({ pomodoroWork: Number(e.target.value)})}
                        className="mt-1 w-full text-center bg-input rounded-md border-border focus:ring-primary focus:border-primary"
                    />
                </div>
                 <div>
                    <label htmlFor="pomodoro-break" className="block text-sm text-center font-medium text-muted-foreground">{t('pomodoro_break_label')}</label>
                    <input 
                        type="number" 
                        id="pomodoro-break"
                        value={settings.pomodoroBreak}
                        onChange={e => setSettings({ pomodoroBreak: Number(e.target.value)})}
                        className="mt-1 w-full text-center bg-input rounded-md border-border focus:ring-primary focus:border-primary"
                    />
                </div>
            </div>
            
            <div className="relative w-52 h-52 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="90" stroke="hsl(var(--muted))" strokeWidth="10" fill="transparent" />
                    <circle
                        cx="50%" cy="50%" r="90"
                        stroke="hsl(var(--primary))"
                        strokeWidth="10"
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                </svg>
                <div className="flex flex-col items-center">
                    <div className="text-5xl font-bold font-mono">{formatTime(timeLeft)}</div>
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{isWorkSession ? t('pomodoro_work') : t('pomodoro_break')}</div>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button
                    onClick={() => resetTimer(isWorkSession)}
                    className="p-3 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 font-semibold transition-colors"
                    aria-label={t('pomodoro_reset_timer')}
                >
                    <ResetIcon className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setIsActive(!isActive)}
                    className="w-16 h-16 text-primary-foreground bg-primary rounded-full hover:bg-primary/90 font-semibold flex items-center justify-center transition-colors text-4xl"
                    aria-label={isActive ? t('pomodoro_pause_timer') : t('pomodoro_start_timer')}
                >
                    {isActive ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
                </button>
                 <button
                    onClick={() => { resetTimer(!isWorkSession); }}
                    className="p-3 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 font-semibold transition-colors"
                    aria-label={t('pomodoro_skip_session')}
                >
                    <ChevronRightIcon className="w-6 h-6 rtl-flip" />
                </button>
            </div>
        </div>
    );
};

export default PomodoroTimer;
