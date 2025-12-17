import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SupabaseTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Проверка подключения...\n');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      setResult(prev => prev + `✓ Supabase клиент инициализирован\n`);
      setResult(prev => prev + `Сессия: ${session ? 'есть' : 'нет'}\n\n`);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('count');

      if (profilesError) {
        setResult(prev => prev + `✗ Ошибка доступа к profiles: ${profilesError.message}\n`);
      } else {
        setResult(prev => prev + `✓ Доступ к таблице profiles работает\n`);
      }

      const testEmail = `test${Date.now()}@test.com`;
      const testPassword = 'Test123456!';

      setResult(prev => prev + `\nПопытка регистрации: ${testEmail}\n`);

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (signUpError) {
        setResult(prev => prev + `✗ Ошибка регистрации: ${signUpError.message}\n`);
        setResult(prev => prev + `Код ошибки: ${signUpError.status}\n`);
      } else {
        setResult(prev => prev + `✓ Регистрация прошла успешно!\n`);
        setResult(prev => prev + `User ID: ${signUpData.user?.id}\n`);
        setResult(prev => prev + `Email confirmed: ${signUpData.user?.email_confirmed_at ? 'да' : 'нет'}\n`);

        if (signUpData.session) {
          setResult(prev => prev + `✓ Сессия создана автоматически\n`);

          await new Promise(resolve => setTimeout(resolve, 2000));

          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', signUpData.user?.id)
            .maybeSingle();

          if (profileError) {
            setResult(prev => prev + `✗ Ошибка проверки профиля: ${profileError.message}\n`);
          } else if (profileData) {
            setResult(prev => prev + `✓ Профиль создан: ${JSON.stringify(profileData, null, 2)}\n`);
          } else {
            setResult(prev => prev + `✗ Профиль не найден\n`);
          }
        } else {
          setResult(prev => prev + `⚠ Сессия не создана - требуется подтверждение email\n`);
        }
      }

    } catch (err: any) {
      setResult(prev => prev + `\n✗ Критическая ошибка: ${err.message}\n`);
      console.error('Test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-xl max-w-2xl z-50">
      <h3 className="text-lg font-bold mb-2">Диагностика Supabase</h3>
      <button
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 mb-4"
      >
        {loading ? 'Тестирование...' : 'Запустить тест'}
      </button>
      {result && (
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96 whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
}
