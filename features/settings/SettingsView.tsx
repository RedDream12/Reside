import React, { ChangeEvent, useState } from 'react';
import { useStore } from '../../store';
import PomodoroTimer from './PomodoroTimer';
import { LanguageIcon, NotesIcon } from '../../components/Icons';
import { useTranslation } from '../../hooks/useTranslation';

const SettingsView: React.FC = () => {
  const { settings, setSettings, currentUser, updateProfile, logout } = useStore();
  const { t } = useTranslation();
  
  const [name, setName] = useState(currentUser?.name || '');

  const handleProfilePicChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      updateProfile({ profilePicture: base64 });
    };
    reader.readAsDataURL(file);
  };
  
  const handleNameChange = () => {
      if(name.trim()) {
          updateProfile({ name: name.trim() });
          alert(t('settings_profile_updated'));
      }
  };
  
  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSettings({ primaryColor: e.target.value });
  };
  
  const handleFontSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSettings({ fontSize: `${e.target.value}px` });
  };

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSettings({ language: e.target.value as 'en' | 'ar' });
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      <SettingsGroup title={t('settings_profile_title')}>
        <div className="flex items-center gap-4">
          <label htmlFor="profile-pic-upload" className="cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {currentUser.profilePicture ? (
                <img src={currentUser.profilePicture} alt={t('settings_profile_picture_alt')} className="w-full h-full object-cover" />
              ) : (
                <NotesIcon className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <input id="profile-pic-upload" type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
          </label>
          <div className="flex-grow">
            <label htmlFor="name" className="text-sm font-medium text-muted-foreground">{t('form_name')}</label>
            <div className="flex gap-2">
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-input rounded-md border-border focus:ring-primary focus:border-primary" />
                <button onClick={handleNameChange} className="px-4 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90">{t('save')}</button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{currentUser.email}</p>
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup title={t('settings_appearance_title')}>
         <div className="flex justify-between items-center">
            <label htmlFor="language" className="font-medium">{t('settings_language')}</label>
            <div className="flex items-center gap-2">
                <LanguageIcon className="w-5 h-5 text-muted-foreground" />
                <select id="language" value={settings.language} onChange={handleLanguageChange} className="bg-input rounded-md border-border focus:ring-primary focus:border-primary">
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                </select>
            </div>
        </div>
        <div className="flex justify-between items-center">
            <label htmlFor="primary-color" className="font-medium">{t('settings_accent_color')}</label>
            <input type="color" id="primary-color" value={settings.primaryColor} onChange={handleColorChange} className="w-10 h-10 rounded-md border-none bg-transparent p-0 cursor-pointer"/>
        </div>
        <div>
            <label htmlFor="font-size" className="flex justify-between items-center mb-2">
                <span className="font-medium">{t('settings_font_size')}</span>
                <span className="text-muted-foreground">{settings.fontSize}</span>
            </label>
            <input type="range" id="font-size" min="12" max="20" value={parseInt(settings.fontSize)} onChange={handleFontSizeChange} className="w-full"/>
        </div>
      </SettingsGroup>
      
      <SettingsGroup title={t('settings_pomodoro_title')}>
        <PomodoroTimer />
      </SettingsGroup>
      
      <SettingsGroup title={t('settings_account_title')}>
        <button onClick={logout} className="w-full bg-destructive text-destructive-foreground rounded-lg py-2.5 font-medium hover:bg-destructive/90 transition-colors">{t('settings_logout')}</button>
      </SettingsGroup>
    </div>
  );
};

const SettingsGroup: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

export default SettingsView;
