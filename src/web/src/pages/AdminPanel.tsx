import { useTranslation } from 'react-i18next';

export default function AdminPanel() {
  const { t } = useTranslation();
  return <div>{t('users')}</div>
}
