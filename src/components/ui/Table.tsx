import type {
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react'

import { cn } from '@/utils/cn'

export interface TableProps
  extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode
  wrapperClassName?: string
}

export interface TableCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  children?: ReactNode
  icon?: ReactNode
  title: ReactNode
}

export interface TableEmptyProps
  extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode
  colSpan: number
  message: ReactNode
  description?: ReactNode
}


function Table({
  children,
  className,
  wrapperClassName,
  ...props
}: TableProps) {
  return (
    <div
      className={cn(
         'w-full overflow-x-auto',
        wrapperClassName,
      )}
    >
      <table
        className={cn(
          'w-full text-sm',
          className,
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}


function Card({
  children,
  className,
  icon,
  title,
  ...props
}: TableCardProps) {
  return (
    <>
      <div
        className={cn(
          `
          rounded-t-lg
          border
          border-b-0
          border-slate-200
          bg-white
          p-4
          dark:border-slate-800
          dark:bg-slate-950
          `,
          className,
        )}
        {...props}
      >
        <div
          className="
          flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-slate-700
          dark:text-slate-200
          "
        >
          {icon}
          {title}
        </div>
      </div>

      <div
        className="
        rounded-b-lg
        bg-white
        dark:bg-slate-950
        "
      >
        {children}
      </div>
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
        `
        border-b
        border-slate-200
        bg-blue-50
        dark:border-slate-800
        dark:bg-slate-900
        `,
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
        `
        divide-y
        divide-slate-200
        bg-white
        dark:divide-slate-800
        dark:bg-slate-950
        `,
        className,
      )}
      {...props}
    >
      {children}
    </tbody>
  )
}


function Td({
  children,
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        `
        whitespace-nowrap
        px-6
        py-3
        align-middle
        text-sm
        text-slate-600
        dark:text-slate-400
        `,
        className,
      )}
      {...props}
    >
      {children}
    </td>
  )
}


function Th({
  children,
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        `
        h-12
        px-6
        text-left
        align-middle
        text-xs
        font-semibold
        uppercase
        tracking-wide
        text-slate-600
        dark:text-slate-300
        `,
        className,
      )}
      scope="col"
      {...props}
    >
      {children}
    </th>
  )
}


function Empty({
  children,
  colSpan,
  message,
  description,
  ...props
}: TableEmptyProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        {...props}
      >
        <div
          className="
            flex
            h-96
            items-center
            justify-center
          "
        >
          <div
            className="
              flex
              flex-col
              items-center
              text-center
            "
          >

            {children}


            <div
              className="
                mt-5
                text-sm
                font-semibold
                text-slate-700
              "
            >
              {message}
            </div>


            {description && (
              <div
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                {description}
              </div>
            )}

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