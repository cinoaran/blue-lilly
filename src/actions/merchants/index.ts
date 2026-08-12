import prisma from "@/lib/prisma";

export async function getMerchants() {
  try {
    const merchants = await prisma.merchant.findMany({orderBy: {name: "asc"}});
    return merchants;
  } catch (error) {
    console.error("Error fetching merchants:", error);
    return [];
  }
}
