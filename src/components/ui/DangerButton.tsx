import Button, { type ButtonProps } from './Button'

export type DangerButtonProps = Omit<ButtonProps, 'variant'>

export default function DangerButton(props: DangerButtonProps) {
  return <Button variant="danger" {...props} />
}
