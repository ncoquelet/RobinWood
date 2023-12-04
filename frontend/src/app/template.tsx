import Header from "@/components/Header";
import { Box } from "@chakra-ui/react";

export default function Home({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <div>
        <Header />
      </div>
      <Box mx={10}>{children}</Box>
    </main>
  );
}
