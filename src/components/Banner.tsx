import classNames from 'classnames';
import { ReactNode } from 'react';

export function Banner({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warning' }) {
  return (
    <div
      className={classNames('rounded-md px-4 py-3 border text-sm', {
        'bg-amber-500/10 border-amber-500/40 text-amber-100': tone === 'warning',
        'bg-blue-500/10 border-blue-500/40 text-blue-100': tone === 'info',
      })}
    >
      {children}
    </div>
  );
}
