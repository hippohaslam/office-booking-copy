const addSpaceBetweenCapitals = (str: string) => {
  return str
    .split("")
    .map((char, index) => (char === char.toUpperCase() && index !== 0 ? ` ${char}` : char))
    .join("");
};

const getEnumOptions = <T extends object>(enumObj: T) => {
  const enumKeys = Object.keys(enumObj).filter((key) => isNaN(Number(key)));
  return enumKeys.map((key) => ({
    value: enumObj[key as keyof T],
    label: addSpaceBetweenCapitals(key),
  }));
};

type EnumSelectProps<T> = {
  enumObj: T;
  value: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const EnumSelect = <T extends object>({ enumObj, name, value, onChange }: EnumSelectProps<T>) => {
  const options = getEnumOptions(enumObj);

  return (
    <select value={value} onChange={onChange} name={name}>
      {options.map((option) => (
        <option key={String(option.value)} value={String(option.value)}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default EnumSelect;
