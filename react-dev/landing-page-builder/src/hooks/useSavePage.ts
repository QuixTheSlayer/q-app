import editorConfig from "@/configs/editor.config";
import { stripImportedCode } from '@/utils/security/codePolicy';
import { isDev } from "@/libs/checkEnv";
import { useSavePageDataMutation } from "@/store/query";
import { PageFile } from "@/types/contentFile.type";
import { protectPageCode } from "@/utils/security/codeCrypto";

export interface SavePagePayloadOptions {
  data?: PageFile;
  title: string;
  thumbnail?: string;
  /** Extra fields merged onto both the dev and prod payload shapes (e.g. plan_type, is_boxed). */
  extra?: Record<string, unknown>;
}

export function buildSavePagePayload({ data, title, thumbnail, extra }: SavePagePayloadOptions) {
  const saveDataForDev = {
    id: data?.id,
    title,
    page_content: JSON.stringify(data?.content),
    thumbnail,
    description: "",
    user_id: data?.user_id,
    is_free: data?.is_free,
    ...extra,
  };

  const saveDataForProd = {
    id: data?.id,
    title,
    content: data?.content,
    thumbnail,
    description: "",
    scrollToTop: data?.scrollToTop,
    ...extra,
  };

  return isDev ? saveDataForDev : saveDataForProd;
}

/**
 * Shared save-page payload builder + mutation, used by both Editor.page.tsx
 * (full save with plan-tier/sync-state handling) and Canvas.tsx (thumbnail-only
 * save after capture) so the dev/prod payload shape lives in one place.
 */
/**
 * The save request body. The CSS, JavaScript and SVG are encrypted on a copy for the request only; the page in
 * the editor stays readable.
 */
export async function prepareSavePayload(options: SavePagePayloadOptions) {
  // Code that came in from imported HTML stays in the editor and is left out of the request.
  const clean = options.data ? { ...options.data, content: stripImportedCode(options.data.content) } : options.data;
  const data = clean && editorConfig.enable_code_encryption
    ? { ...clean, content: await protectPageCode(clean.content) }
    : clean;
  return buildSavePagePayload({ ...options, data });
}

export default function useSavePage() {
  const [saveData, savingProcess] = useSavePageDataMutation();

  const savePage = async (options: SavePagePayloadOptions) => saveData(await prepareSavePayload(options)).unwrap();

  return { savePage, saveData, savingProcess };
}
