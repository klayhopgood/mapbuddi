import { LocationListEditorElements } from "./location-list-editor-elements";
import { LocationList, ListCategory, ListPoi } from "@/db/schema";

export const LocationListEditor = (props: {
  displayType?: "page" | "modal";
  listStatus: "new-list" | "existing-list";
  initialValues?: LocationList;
  initialCategories?: ListCategory[];
  initialPois?: ListPoi[];
}) => {
  return (
    <LocationListEditorElements
      displayType={props.displayType}
      listStatus={props.listStatus}
      initialValues={props.initialValues}
      initialCategories={props.initialCategories}
      initialPois={props.initialPois}
    />
  );
};
