import { GetSpecificRequest } from "@/functions/purchase";
export async function GET(request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  return await GetSpecificRequest(
    "Chief Accountant",
    searchParams.get("dateStart"),
    searchParams.get("dateEnd"),
    page,
    limit,
    true,
  );
}
