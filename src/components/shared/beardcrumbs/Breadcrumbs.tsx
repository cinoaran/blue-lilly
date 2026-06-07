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
    <Breadcrumb className="my-12">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="flex items-center">
            <HomeIcon className="mr-2 h-4 w-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>

        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="text-sm">
              {item.active ? (
                <span className={`ml-2 font-medium`}>{item.label}</span>
              ) : (
                <BreadcrumbLink
                  href={item.href}
                  className="ml-2 text-sm font-normal text-foreground/70 hover:text-foreground"
                >
                  {item.label}
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
