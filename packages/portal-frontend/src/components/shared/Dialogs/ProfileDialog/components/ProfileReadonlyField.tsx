import { FormTextField } from 'components/atoms'

type ProfileReadonlyFieldProps = {
  label: string
  value?: string
}

export const ProfileReadonlyField = ({
  label,
  value
}: ProfileReadonlyFieldProps) => (
  <FormTextField label={label} value={value ?? ''} disabled />
)
