import type {
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react'
import { cn } from '@/utils/cn'

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode
  wrapperClassName?: string
}

export interface TableCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  children?: ReactNode
  icon?: ReactNode
  title: ReactNode
}

export interface TableEmptyProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode
  colSpan: number
  message: ReactNode
}

function Table({ children, className, wrapperClassName, ...props }: TableProps) {
  return (
    <div
      className={cn(
        'w-full overflow-hidden overflow-x-auto rounded-b-lg border border-t-0 border-slate-200 dark:border-slate-800',
        wrapperClassName,
      )}
    >
      <table className={cn('w-full text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  )
}

function Card({ children, className, icon, title, ...props }: TableCardProps) {
  return (
    <>
      <div
        className={cn(
          'rounded-t-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950',
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {icon}
          {title}
        </div>
      </div>
      <div className="rounded-b-lg bg-white dark:bg-slate-950">{children}</div>
    </>
  )
}

function Thead({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        'border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950',
        className,
      )}
      {...props}
    >
      {children}
    </thead>
  )
}

function Tbody({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn(
        'divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950',
        className,
      )}
      {...props}
    >
      {children}
    </tbody>
  )
}

function Td({ children, className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        'whitespace-nowrap p-4 align-middle text-slate-700 dark:text-slate-400',
        className,
      )}
      {...props}
    >
      {children}
    </td>
  )
}

function Th({ children, className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-slate-700 dark:text-slate-400',
        className,
      )}
      scope="col"
      {...props}
    >
      {children}
    </th>
  )
}

function Empty({ children, colSpan, message, ...props }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} {...props}>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            {children}
            <div className="mt-5">{message}</div>
          </div>
        </div>
      </td>
    </tr>
  )
}

Table.Card = Card
Table.Thead = Thead
Table.Tbody = Tbody
Table.Td = Td
Table.Th = Th
Table.Empty = Empty

export default Table
