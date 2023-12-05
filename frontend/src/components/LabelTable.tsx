import React, { FC, PropsWithChildren } from "react";
import { FaGear } from "react-icons/fa6";
import { useFormatter } from "next-intl";
import { useLabels } from "@/context/labelContext";
import truncateEthAddress from "truncate-eth-address";

import {
  Box,
  Heading,
  Skeleton,
  Stack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import LoadingTableRow from "./LoadingTableRow";
import useNftStorage from "@/hooks/useNftStorage";
import { Label } from "@/types";

interface LabelTableParams {
  name: string;
  labelList: Array<Label>;
  loading: boolean;
  onRowClick(label: Label): void;
}

const LabelTable: FC<LabelTableParams> = ({
  name,
  labelList,
  loading,
  onRowClick,
}) => {
  const { wrappeWithGateway } = useNftStorage();
  const format = useFormatter();

  return (
    <Box mt={8}>
      <Heading size="md">{name}</Heading>
      <TableContainer>
        <Table variant="simple">
          {!loading && !labelList.length && (
            <TableCaption>No labels</TableCaption>
          )}
          <Thead>
            <Tr>
              <Th>Id</Th>
              <Th>Owner</Th>
              <Th>Name</Th>
              <Th>Submited Date</Th>
              <Th>Geographical Area</Th>
              <Th>Document</Th>
            </Tr>
          </Thead>
          {loading ? (
            <LoadingTableRow size={3} span={5} />
          ) : (
            <Tbody>
              {labelList.map((label) => (
                <Tr
                  key={label.id}
                  onClick={(e) => onRowClick(label)}
                  className="highlight"
                  style={{ cursor: "pointer" }}
                >
                  <Td>{`#${label.id}`}</Td>
                  <Td>{truncateEthAddress(label.owner!)}</Td>
                  <Td>{label.name}</Td>
                  <Td>
                    {label.submitedDate
                      ? format.dateTime(label.submitedDate, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </Td>
                  <Td>{label.properties.geographic_area}</Td>
                  <Td>{label.external_url}</Td>
                  <Td>
                    <FaGear />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LabelTable;
