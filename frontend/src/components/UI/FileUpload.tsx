import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { FC, PropsWithChildren, useRef } from "react";
import { Control, useController } from "react-hook-form";
import { FiFile } from "react-icons/fi";

interface FileUploadParams extends PropsWithChildren {
  name: string;
  placeholder: string;
  acceptedFileTypes?: string;
  control: Control<any>;
  isRequired: boolean;
}

const FileUpload: FC<FileUploadParams> = ({
  name,
  placeholder,
  acceptedFileTypes = "",
  control,
  children,
  isRequired = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    field: { ref, onChange, value, ...inputProps },
    fieldState: { invalid, isTouched, isDirty },
  } = useController({
    name,
    control,
    rules: { required: isRequired },
  });

  return (
    <FormControl isRequired>
      <FormLabel htmlFor="writeUpFile">{children}</FormLabel>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <Icon as={FiFile} />
        </InputLeftElement>
        <input
          type="file"
          onChange={(e) => {
            if (e.target.files) onChange(e.target.files[0]);
          }}
          accept={acceptedFileTypes}
          ref={inputRef}
          {...inputProps}
          style={{ display: "none" }}
        />
        <Input
          placeholder={placeholder || "Your file ..."}
          onClick={() => inputRef.current?.click()}
          // onChange={(e) => {}}
          readOnly={true}
          value={(value && value.name) || ""}
        />
      </InputGroup>
      <FormErrorMessage>{invalid}</FormErrorMessage>
    </FormControl>
  );
};

export default FileUpload;
