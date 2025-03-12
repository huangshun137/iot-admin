interface FormItemProps {
  _id: string | null;
  name: string;
  protocal: string;
  type: string;
  status: number;
  remark: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
