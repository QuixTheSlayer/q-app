import {PageFile} from "@/types/contentFile.type";

export const checkEventPlaceholders = (data: PageFile) => {
  if(!data) return {};
  const contentString = JSON.stringify(data.content)
  const hasSubmitEntryUrl = contentString.includes("{{event_submit_entry_url}}");
  const hasRegisterUrl = contentString.includes("{{event_register_url}}");

  return {
    hasSubmitEntryUrl,
    hasRegisterUrl,
  }
}