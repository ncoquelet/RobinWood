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
import { Product } from "@/types";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import LoadingTableRow from "../LoadingTableRow";

interface ProductTableParams {
  name: string;
  productList: Array<Product>;
  loading: boolean;
  onRowClick(product: Product): void;
}

const ProductTable: FC<ProductTableParams> = ({
  name,
  productList,
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
          {!loading && !productList.length && (
            <TableCaption>No products</TableCaption>
          )}
          <Thead>
            <Tr>
              <Th>Id</Th>
              <Th>Owner</Th>
              <Th>Name</Th>
              <Th>Creation Date</Th>
              <Th>Document</Th>
              <Th></Th>
            </Tr>
          </Thead>
          {loading ? (
            <LoadingTableRow size={3} span={5} />
          ) : (
            <Tbody>
              {productList.map((product) => (
                <Tr
                  key={product.id}
                  onClick={(e) => onRowClick(product)}
                  className="highlight"
                  style={{ cursor: "pointer" }}
                >
                  <Td>{`#${product.id}`}</Td>
                  <Td>{truncateEthAddress(product.owner!)}</Td>
                  <Td>{product.name}</Td>
                  <Td>
                    {product.creation_date
                      ? format.dateTime(product.creation_date, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </Td>
                  <Td>{truncateCid(product.external_url)}</Td>
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

export default ProductTable;
