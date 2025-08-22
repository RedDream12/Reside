import React, { useState } from 'react';
import { useStore } from '../../store';
import { WhatsAppIcon } from '../../components/Icons';
import { useTranslation } from '../../hooks/useTranslation';

type AuthViewMode = 'gateway' | 'login' | 'signup' | 'reactivate';

const AuthView: React.FC = () => {
    const [view, setView] = useState<AuthViewMode>('gateway');
    const [activationCode, setActivationCode] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const { login, signup, reactivateAccount } = useStore();
    const { t } = useTranslation();

    const handleActivationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (activationCode === 'YL10') {
            setError(null);
            setView('signup'); // Go to signup after entering a valid code format
        } else {
            setError(t('auth_error_invalid_code_format'));
        }
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            if ((err as Error).message === "Subscription expired") {
                setError(t('auth_error_subscription_expired'));
                setView('reactivate');
            } else {
                setError(t((err as Error).message));
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await signup({ name, email }, password, activationCode);
        } catch (err) {
             setError(t((err as Error).message));
        } finally {
            setLoading(false);
        }
    };
    
    const handleReactivationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await reactivateAccount(email, activationCode);
        } catch (err) {
            setError(t((err as Error).message));
        } finally {
            setLoading(false);
        }
    }

    const renderGateway = () => (
        <>
            <h1 className="text-3xl font-bold text-center mb-2">{t('auth_welcome_title')}</h1>
            <p className="text-muted-foreground text-center mb-6">{t('auth_gateway_subtitle')}</p>
            <form onSubmit={handleActivationSubmit} className="space-y-4">
                <div>
                    <label htmlFor="activation" className="block text-sm font-medium text-muted-foreground">{t('form_activation_code')}</label>
                    <input type="text" id="activation" value={activationCode} onChange={e => setActivationCode(e.target.value)} className="mt-1 w-full bg-input rounded-md border-border focus:ring-primary focus:border-primary p-2" required />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button type="submit" className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-md hover:bg-primary/90 transition-colors">
                    {t('auth_activate_button')}
                </button>
            </form>
            <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-4 text-muted-foreground text-sm">{t('or')}</span>
                <div className="flex-grow border-t border-border"></div>
            </div>
            <button onClick={() => setView('login')} className="w-full bg-secondary text-secondary-foreground font-semibold py-2 rounded-md hover:bg-secondary/80 transition-colors">
                {t('auth_login_button')}
            </button>
            <a href="https://wa.me/201111766191" target="_blank" rel="noopener noreferrer" className="mt-4 w-full bg-green-500 text-white font-semibold py-2 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                <WhatsAppIcon className="w-5 h-5" />
                {t('auth_whatsapp_button')}
            </a>
        </>
    );

    const renderAuthForm = (mode: 'login' | 'signup' | 'reactivate') => {
        const title = { login: 'auth_login_title', signup: 'auth_signup_title', reactivate: 'auth_reactivate_title' };
        const subtitle = { 
            login: 'auth_login_subtitle', 
            signup: 'auth_signup_subtitle',
            reactivate: t('auth_reactivate_subtitle', { email })
        };
        const isReactivating = mode === 'reactivate';

        return (
            <>
                <h1 className="text-3xl font-bold text-center mb-2">{t(title[mode])}</h1>
                <p className="text-muted-foreground text-center mb-6">{isReactivating ? subtitle.reactivate : t(subtitle[mode])}</p>
                <form onSubmit={isReactivating ? handleReactivationSubmit : (mode === 'login' ? handleLoginSubmit : handleSignupSubmit)} className="space-y-4">
                    {mode === 'signup' && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">{t('form_name')}</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full bg-input rounded-md border-border focus:ring-primary focus:border-primary p-2" required />
                        </div>
                    )}
                    {!isReactivating && (
                        <>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">{t('form_email')}</label>
                                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full bg-input rounded-md border-border focus:ring-primary focus:border-primary p-2" required />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">{t('form_password')}</label>
                                <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full bg-input rounded-md border-border focus:ring-primary focus:border-primary p-2" required />
                            </div>
                        </>
                    )}
                    {isReactivating && (
                         <div>
                            <label htmlFor="reactivation-code" className="block text-sm font-medium text-muted-foreground">{t('form_new_activation_code')}</label>
                            <input type="text" id="reactivation-code" value={activationCode} onChange={e => setActivationCode(e.target.value)} className="mt-1 w-full bg-input rounded-md border-border focus:ring-primary focus:border-primary p-2" required />
                        </div>
                    )}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-md hover:bg-primary/90 transition-colors disabled:bg-primary/50">
                        {loading ? t('processing') : (isReactivating ? t('auth_reactivate_button_submit') : (mode === 'login' ? t('auth_login_button_submit') : t('auth_signup_button_submit')))}
                    </button>
                </form>
                <p className="text-center text-sm text-muted-foreground mt-4">
                    <button onClick={() => { setView('gateway'); setError(null); }} className="font-semibold text-primary hover:underline ml-1">
                        &larr; {t('auth_back_button')}
                    </button>
                </p>
            </>
        );
    };

    return (
        <div className="w-full h-full flex flex-col justify-center items-center bg-background p-4 animate-fade-in">
            <div className="w-full max-w-sm">
                {view === 'gateway' && renderGateway()}
                {view === 'login' && renderAuthForm('login')}
                {view === 'signup' && renderAuthForm('signup')}
                {view === 'reactivate' && renderAuthForm('reactivate')}
            </div>
        </div>
    );
};

export default AuthView;
