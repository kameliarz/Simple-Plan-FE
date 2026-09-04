import Button, { type ButtonProps } from './Button'

export type PrimaryButtonProps = Omit<ButtonProps, 'variant'>

export default function PrimaryButton(props: PrimaryButtonProps) {
  return <Button variant="primary" {...props} />
}
