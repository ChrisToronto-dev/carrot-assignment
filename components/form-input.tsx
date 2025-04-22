interface FormInputProps {
  type: string;
  placeholder: string;
  required: boolean;
  name: string;
  icon: React.ReactNode;
}

export default function FormInput({
  type,
  placeholder,
  required,
  name,
  icon,
}: FormInputProps) {
  return (
    <div className="flex items-center relative border-gray-300 border-2 rounded-full pl-4">
      {icon}
      <input
        className="bg-transparent p-4 pl-2 w-full focus:outline-none  placeholder:text-neutral-400"
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
