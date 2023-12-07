import { useFormatter } from "next-intl";
import { FC } from "react";
import truncateEthAddress from "truncate-eth-address";

import {
  Box,
  Heading,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

import useNftStorage from "@/hooks/useNftStorage";
import { Label } from "@/types";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import LoadingTableRow from "../LoadingTableRow";

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
  const { truncateCid } = useNftStorage();
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
              <Th></Th>
            </Tr>
          </Thead>
          {loading ? (
            <LoadingTableRow size={3} span={6} />
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
                  <Td>{truncateCid(label.external_url)}</Td>
                  <Td>
                    <InfoOutlineIcon />
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
