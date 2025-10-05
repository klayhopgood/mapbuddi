import { LocationListEditorElements } from "./location-list-editor-elements";
import { LocationList } from "@/db/schema";

export const LocationListEditor = (props: {
  displayType?: "page" | "modal";
  listStatus: "new-list" | "existing-list";
  initialValues?: LocationList;
}) => {
  return (
    <LocationListEditorElements
      displayType={props.displayType}
      listStatus={props.listStatus}
      initialValues={props.initialValues}
    />
  );
};
