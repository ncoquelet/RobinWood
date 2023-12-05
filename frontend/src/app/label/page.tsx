"use client";

import AddLabel from "@/components/AddLabel";
import { LabelProvider } from "@/context/labelContext";

export default function Label() {
  return (
    <div>
      <LabelProvider>
        <p>Labels</p>
        <AddLabel />
      </LabelProvider>
    </div>
  );
}
