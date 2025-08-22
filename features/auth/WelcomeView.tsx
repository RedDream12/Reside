import React, { useEffect } from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';

interface WelcomeViewProps {
    onFinish: () => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ onFinish }) => {
    const { currentUser } = useStore();
    const { t } = useTranslation();

    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, 3000); // Show for 3 seconds

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className="w-full h-full flex flex-col justify-center items-center bg-background p-4 text-center animate-fade-in">
            <h1 className="text-4xl font-bold">{t('welcome_message', { name: currentUser?.name })}</h1>
            <p className="text-lg text-muted-foreground mt-2">{t('welcome_redirect')}</p>
        </div>
    );
};

export default WelcomeView;
