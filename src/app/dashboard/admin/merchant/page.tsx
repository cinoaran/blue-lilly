import React from "react";
import {DataTable} from "@/app/dashboard/_components/DataTable";
import {columns} from "./_components/Columns";
import {getAllMerchants} from "@/actions/admin/merchant/getAllMerchants";
import {headers} from "next/headers";

const MerchantPage = async () => {
  const hdrs = headers();
  const data = await getAllMerchants({headers: hdrs});

  if (!data) {
    return (
      <div className="container  bg-secondary text-foreground border-[0.3px] border-foreground/10 rounded-lg backdrop-blur-md shadow-md shadow-foreground/10 mx-auto my-12">
        No merchants found
      </div>
    );
  }

  return (
    <div className="container  bg-secondary text-foreground border-[0.3px] border-foreground/10 rounded-lg backdrop-blur-md shadow-md shadow-foreground/10 mx-auto my-12">
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default MerchantPage;
