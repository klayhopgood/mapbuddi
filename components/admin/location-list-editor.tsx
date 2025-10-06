import { LocationListEditorElements } from "./location-list-editor-elements";
import { LocationList, ListCategory as DbListCategory, ListPoi as DbListPoi } from "@/db/schema";

export const LocationListEditor = (props: {
  displayType?: "page" | "modal";
  listStatus: "new-list" | "existing-list";
  initialValues?: LocationList;
  initialCategories?: DbListCategory[];
  initialPois?: DbListPoi[];
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
