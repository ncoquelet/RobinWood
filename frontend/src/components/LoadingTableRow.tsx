import { Skeleton, Stack, Tbody, Td, Tr } from "@chakra-ui/react";
import React, { FC } from "react";

interface LoadingTableRowParams {
  size: number;
  span: number;
}

const LoadingTableRow: FC<LoadingTableRowParams> = ({ size, span }) => {
  return (
    <Tbody>
      <Tr>
        <Td colSpan={span}>
          <Stack>
            {Array(size)
              .fill("")
              .map((value, index) => (
                <Skeleton key={index} height="20px" />
              ))}
          </Stack>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default LoadingTableRow;
