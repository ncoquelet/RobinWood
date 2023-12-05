import {
  Input,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  FormErrorMessage,
  Icon,
} from "@chakra-ui/react";
import { FiFile } from "react-icons/fi";
import { Control, useController } from "react-hook-form";
import { FC, useRef } from "react";

interface FileUploadParams {
  name: string;
  placeholder: string;
  acceptedFileTypes?: string;
  control: Control<any>;
  children: React.ReactNode;
  isRequired: boolean;
}

export const FileUpload: FC<FileUploadParams> = ({
  name,
  placeholder,
  acceptedFileTypes,
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

FileUpload.defaultProps = {
  acceptedFileTypes: "",
  //allowMultipleFiles: false,
};

export default FileUpload;
