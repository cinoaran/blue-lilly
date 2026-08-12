import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {HomeIcon} from "lucide-react";

interface BreadcrumbsProps {
  items: {label: string; href: string; active?: boolean}[];
}

const Breadcrumbs = ({items}: BreadcrumbsProps) => {
  return (
    <Breadcrumb className="my-2">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href="/"
            className="flex items-center text-primary hover:scale-110 transition-transform duration-200"
          >
            <HomeIcon className="mr-2 h-4 w-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>

        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="text-primary underlined">
              {item.active ? (
                <span className={`font-medium hover:text-primary`}>
                  {item.label}
                </span>
              ) : (
                <BreadcrumbLink href={item.href} className="font-normal">
                  <span className={`font-medium hover:text-primary`}>
                    {item.label}
                  </span>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
